import * as contactResp from "../repository/contact.repository.js";
import * as companyResp from "../repository/company.repository.js";
import * as func from "../shared/function.js";
import { supabase } from "../configuration/supabase.js";

const contactTableName = "contact";

// get all contacts
function getAllContacts({ tenantId }) {
    return new Promise(async (resolve, reject) => {
        try {
            contactResp
                .getAllContacts({ tenantId: tenantId })
                .then((contactList) => {
                    // concat contact first name and last name and store into contactDisplayName
                    contactList = contactList.map((contact) => {
                        contact.contactDisplayName = `${contact.contactFirstName} ${contact.contactLastName}`;
                        return contact;
                    });
                    resolve(contactList);
                })
                .catch((error) => {
                    console.log("error", error);
                    reject(error);
                });
        } catch (error) {
            console.log("error", error);
            reject(error);
        }
    });
}

// get contact by id
function getContactById({ tenantId, contactUid }) {
    return new Promise(async (resolve, reject) => {
        let contactData = {};
        try {
            contactResp
                .getContactById({
                    tenantId: tenantId,
                    contactUid: contactUid,
                })
                .then((c) => {
                    contactData = c;
                    contactResp
                        .getContactAssoList({
                            contactUid: contactUid,
                        })
                        .then(async (asso) => {
                            contactData.contactDisplayName = `${contactData.contactFirstName} ${contactData.contactLastName}`;
                            contactData.association = {};

                            let companyAssoList = await Promise.all(
                                asso.map((item) => {
                                    return companyResp.getCompanyById({
                                        tenantId: tenantId,
                                        companyUid: item.companyUid,
                                    });
                                })
                            );
                            contactData.association.companyList = companyAssoList;

                            resolve(contactData);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                })
                .catch((error) => {
                    console.log(error);
                    reject();
                });
        } catch (error) {
            console.log(error);
            reject();
        }
    });
}

// get contact by filter
async function getContactByFilter({ tenantId, filterList }) {
    return new Promise(async (resolve, reject) => {
        try {
            let query = supabase.from(contactTableName).select("*").eq("statusId", 1);
            let rpcFilters = [];

            // Apply each filter
            for (const filter of filterList) {
                if (Array.isArray(filter.filter)) {
                    for (let f of filter.filter) {
                        const result = await returnFilter({
                            tenantId: tenantId,
                            property: filter.property,
                            query: query,
                            condition: filter.condition,
                            value: f,
                        });

                        if (result?.rpc) {
                            rpcFilters.push(result); // Store RPC filters for later
                        } else {
                            query = result; // Chain standard query
                        }
                    }
                } else {
                    const result = await returnFilter({
                        tenantId: tenantId,
                        property: filter.property,
                        query: query,
                        condition: filter.condition,
                        value: filter.filter,
                    });

                    if (result?.rpc) {
                        rpcFilters.push(result); // Store RPC filters for later
                    } else {
                        query = result; // Chain standard query
                    }
                }
            }

            // Case 1: No RPC filters, just run the query
            if (rpcFilters.length === 0) {
                const { data, error } = await contactResp.getContactByQuery({
                    tenantId: tenantId,
                    query: query,
                });
                if (error) throw error;
                resolve(data);
            }

            // Case 2: Only RPC filters (or mixed): run each RPC and intersect results
            const rpcResults = await Promise.all(
                rpcFilters.map(
                    async (rpcFilter) =>
                        await contactResp.getContactByRPC({
                            tenantId: tenantId,
                            rpcFilter: rpcFilter,
                        })
                )
            );

            // Intersect by `uid` (only those who match ALL RPC filters)
            const intersected = rpcResults.reduce((acc, list, idx) => {
                const currentSet = new Set(list?.data?.map((c) => c.uid));
                if (idx === 0) return currentSet;
                return new Set([...acc].filter((uid) => currentSet.has(uid)));
            }, new Set());

            // Get final contact list matching all RPC filters
            let finalRpcContacts = rpcResults[0].data?.filter((c) => intersected.has(c.uid));

            // Case 3: Mixed RPC + standard query: match both sets
            if (query) {
                const { data: defaultData, error } = await contactResp.getContactByQuery({
                    tenantId: tenantId,
                    query: query,
                });

                if (error) throw error;
                const uidSet = new Set(defaultData.map((c) => c.uid));
                resolve(finalRpcContacts.filter((c) => uidSet.has(c.uid)));
            }

            resolve(finalRpcContacts);
        } catch (error) {
            console.error("getContactByFilter error", error);
            reject(error);
        }
    });
}

async function returnFilter({ tenantId, property, query, condition, value }) {
    let column = property.propertyCode;

    if (!property.isDefaultProperty) {
        switch (property.propertyCode) {
            case "contact_owner":
                column = "contactOwnerUid";
                break;
            case "first_name":
                column = "contactFirstName";
                break;
            case "last_name":
                column = "contactLastName";
                break;
            case "email":
                column = "contactEmail";
                break;
            case "phone_number":
                column = "contactPhone";
                break;
            case "lead_status":
                column = "contactLeadStatusUid";
                break;
            case "created_date":
                column = "createdDate";
                break;
            case "created_by":
                column = "createdBy";
                break;
            case "last_modified_date":
                column = "modifiedDate";
                break;
            case "last_modified_by":
                column = "modifiedBy";
                break;
        }

        switch (condition) {
            case "equal_to":
                return query.eq(column, value);
            case "not_equal_to":
                return query.neq(column, value);
            case "more_than":
                return query.gt(column, value);
            case "more_than_equal_to":
                return query.gte(column, value);
            case "less_than":
                return query.lt(column, value);
            case "less_than_equal_to":
                return query.lte(column, value);
            case "is_known":
                return query.not(column, "is", null);
            case "is_not_known":
                return query.is(column, null);
            default:
                return query;
        }
    }

    // Detect value type for RPC usage
    let suffix = "";
    if (["more_than", "more_than_equal_to", "less_than", "less_than_equal_to"].includes(condition)) {
        if (func.isNumeric(value)) suffix = "_numeric";
        else if (func.isValidDate(value)) suffix = "_datetime";
    }

    return {
        rpc: true,
        function: "filter_contacts_by_property",
        params: {
            tenantid: tenantId?.toString(),
            prop_code: column?.toString(),
            condition: (condition + suffix).toString(),
            target_value: value !== null && value !== undefined ? value.toString() : null,
        },
    };
}

// create new contact
function createContact({ tenantId, userId, contactDataList }) {
    return new Promise(async (resolve, reject) => {
        try {
            let contactList = await Promise.all(
                contactDataList.map((contactData) => {
                    contactData.createdBy = userId;
                    contactData.modifiedBy = userId;
                    contactData.tenantId = tenantId;

                    return contactResp.createContact({ contact: contactData });
                })
            );
            resolve(contactList);
        } catch (error) {
            console.log("error", error);
            reject(error);
        }
    });
}

function deleteContact({ userId, contactDataList }) {
    return new Promise(async (resolve, reject) => {
        try {
            let contactList = await Promise.all(
                contactDataList.map((contactData) => {
                    contactData.statusId = 2;
                    contactData.modifiedBy = userId;
                    contactData.modifiedDate = new Date().toISOString();

                    return contactResp.deleteContact({ contact: contactData });
                })
            );
            resolve(contactList);
        } catch (error) {
            console.log("error", error);
            reject(error);
        }
    });
}

function updateContact({ userId, contactDataList }) {
    return new Promise(async (resolve, reject) => {
        try {
            let contactList = await Promise.all(
                contactDataList.map((contactData) => {
                    contactData.modifiedBy = userId;
                    contactData.modifiedDate = new Date().toISOString();

                    return contactResp.updateContact({ contact: contactData });
                })
            );
            resolve(contactList);
        } catch (error) {
            reject(error);
        }
    });
}

export { getAllContacts, getContactById, getContactByFilter, createContact, deleteContact, updateContact };
