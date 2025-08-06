import * as contactResp from "../repository/contact.repository.js";
import * as companyResp from "../repository/company.repository.js";
import * as func from "../shared/function.js";

const companyTableName = "company";

// get all companies
function getAllCompanies({ tenantId }) {
    return new Promise(async (resolve, reject) => {
        try {
            // companyResp
            //   .getAllCompanies({ tenantId: tenantId })
            //   .then((companyList) => {
            //     companyList.forEach((item) => {
            //       item.createdDate = func.convertFirebaseDateFormat(item.createdDate);
            //       item.modifiedDate = func.convertFirebaseDateFormat(item.modifiedDate);
            //     });

            //     resolve(companyList);
            //   })
            //   .catch((error) => {
            //     console.log("error", error);
            //     reject(error);
            //   });

            companyResp
                .getAllCompanies({ tenantId: tenantId })
                .then((companyList) => {
                    companyList = companyList.map((item) => {
                        item.companyDisplayName = item.companyName;
                        return item;
                    });
                    resolve(companyList);
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

// get company by id
function getCompanyById({ tenantId, companyUid }) {
    return new Promise(async (resolve, reject) => {
        let companyData = {};

        try {
            companyResp
                .getCompanyById({
                    tenantId: tenantId,
                    companyUid: companyUid,
                })
                .then((c) => {
                    companyData = c;
                    companyResp
                        .getCompanyAssoList({
                            companyUid: companyUid,
                        })
                        .then(async (asso) => {
                            companyData.companyDisplayName = companyData.companyName;
                            companyData.association = {};

                            let contactAssoList = await Promise.all(
                                asso.map((item) => {
                                    return contactResp.getContactById({
                                        tenantId: tenantId,
                                        contactUid: item.contactUid,
                                    });
                                })
                            );
                            companyData.association.contactList = contactAssoList;

                            resolve(companyData);
                        })
                        .catch((error) => {
                            console.log(error);
                            reject();
                        });
                })
                .catch((error) => {
                    console.log(error);
                    reject();
                });
        } catch (error) {
            console.log("error", error);
            reject(error);
        }
    });
}

// get company by filter
async function getCompanyByFilter({ tenantId, filterList }) {
    return new Promise(async (resolve, reject) => {
        try {
            let query = supabase.from(companyTableName).select("*").eq("statusId", 1);
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
                const { data, error } = await companyResp.getCompanyByQuery({
                    tenantId: tenantId,
                    query: query,
                });
                if (error) throw error;
                return data;
            }

            // Case 2: Only RPC filters (or mixed): run each RPC and intersect results
            const rpcResults = await Promise.all(rpcFilters.map(async (rpcFilter) => await companyResp.getCompanyByRPC(tenantId, rpcFilter)));

            // Intersect by `uid` (only those who match ALL RPC filters)
            const intersected = rpcResults.reduce((acc, list, idx) => {
                const currentSet = new Set(list?.data?.map((c) => c.uid));
                if (idx === 0) return currentSet;
                return new Set([...acc].filter((uid) => currentSet.has(uid)));
            }, new Set());

            // Get final contact list matching all RPC filters
            let finalRpcCompany = rpcResults[0].data?.filter((c) => intersected.has(c.uid));

            // Case 3: Mixed RPC + standard query: match both sets
            if (query) {
                const { data: defaultData, error } = await companyResp.getCompanyByQuery({
                    tenantId: tenantId,
                    query: query,
                });
                if (error) throw error;
                const uidSet = new Set(defaultData.map((c) => c.uid));
                resolve(finalRpcCompany?.filter((c) => uidSet.has(c.uid)));
            }

            resolve(finalRpcCompany);
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
            case "company_owner":
                column = "companyOwnerUid";
                break;
            case "company_name":
                column = "companyName";
                break;
            case "email":
                column = "companyEmail";
                break;
            case "website_url":
                column = "companyWebsite";
                break;
            case "lead_status":
                column = "companyLeadStatusUid";
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
        function: "filter_company_by_property",
        params: {
            tenantid: tenantId?.toString(),
            prop_code: column?.toString(),
            condition: (condition + suffix).toString(),
            target_value: value !== null && value !== undefined ? value.toString() : null,
        },
    };
}

// create new company
function createCompany({ tenantId, userId, companyDataList }) {
    return new Promise(async (resolve, reject) => {
        try {
            let companyList = await Promise.all(
                companyDataList.map((companyData) => {
                    companyData.createdBy = userId;
                    companyData.modifiedBy = userId;
                    companyData.tenantId = tenantId;

                    return companyResp.createCompany({ company: companyData });
                })
            );
            resolve(companyList);
        } catch (error) {
            console.log("error", error);
            reject(error);
        }
    });
}

function deleteCompany({ userId, companyDataList }) {
    return new Promise(async (resolve, reject) => {
        try {
            let companyList = await Promise.all(
                companyDataList.map((companyData) => {
                    companyData.statusId = 2;
                    companyData.modifiedBy = userId;
                    companyData.modifiedDate = new Date().toISOString();

                    return companyResp.deleteCompany({ company: companyData });
                })
            );
            resolve(companyList);
        } catch (error) {
            console.log("error", error);
            reject(error);
        }
    });
}

function updateCompany({ userId, companyDataList }) {
    return new Promise(async (resolve, reject) => {
        try {
            let companyList = await Promise.all(
                companyDataList.map((companyData) => {
                    companyData.modifiedBy = userId;
                    companyData.modifiedDate = new Date().toISOString();

                    return companyResp.updateCompany({ company: companyData });
                })
            );
            resolve(companyList);
        } catch (error) {
            reject(error);
        }
    });
}

export { getAllCompanies, getCompanyById, getCompanyByFilter, createCompany, deleteCompany, updateCompany };
