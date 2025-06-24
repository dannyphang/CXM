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

// TODO: filter
// get contact by filter
async function getContactByFilter({ tenantId, filterList }) {
  let query = supabase.from(contactTableName).select("*").eq("statusId", 1);
  let rpcFilters = [];

  try {
    // Apply each filter
    for (const filter of filterList) {
      const result = await returnFilter({
        property: filter.property,
        query,
        filter,
      });

      if (result?.rpc) {
        rpcFilters.push(result); // Store RPC filters for later
      } else {
        query = result; // Chain standard query
      }
    }

    // Case 1: No RPC filters, just run the query
    if (rpcFilters.length === 0) {
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }

    // Case 2: Only RPC filters (or mixed): run each RPC and intersect results
    const rpcResults = await Promise.all(
      rpcFilters.map((rpcFilter) => supabase.rpc(rpcFilter.function, rpcFilter.params))
    );

    // Intersect by `uid` (only those who match ALL RPC filters)
    const intersected = rpcResults.reduce((acc, list, idx) => {
      const currentSet = new Set(list?.data?.map((c) => c.uid));
      if (idx === 0) return currentSet;
      return new Set([...acc].filter((uid) => currentSet.has(uid)));
    }, new Set());

    // Get final contact list matching all RPC filters
    const finalRpcContacts = rpcResults[0].data?.filter((c) => intersected.has(c.uid));

    // Case 3: Mixed RPC + standard query: match both sets
    if (query) {
      console.log("query", query);
      const { data: defaultData, error } = await query;
      if (error) throw error;
      const uidSet = new Set(defaultData.map((c) => c.uid));
      return finalRpcContacts?.filter((c) => uidSet.has(c.uid));
    }

    return finalRpcContacts;
  } catch (error) {
    console.error("getContactByFilter error", error);
    throw error;
  }
}

async function returnFilter({ property, query, filter }) {
  let column = property.propertyCode;
  const value = filter.filter;

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

    switch (filter.condition) {
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

  // ✅ Custom property stored in contactProperties JSONB
  return {
    rpc: true,
    function: "filter_contacts_by_property",
    params: {
      prop_code: column,
      condition: filter.condition,
      target_value: Array.isArray(value) ? JSON.stringify(value) : value, // 👈 Ensure JSON array for Supabase
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

export {
  getAllContacts,
  getContactById,
  getContactByFilter,
  createContact,
  deleteContact,
  updateContact,
};
