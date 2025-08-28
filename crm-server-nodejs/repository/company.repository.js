import { DEFAULT_SYSTEM_TENANT } from "../shared/constant.js";
import { supabase } from "../configuration/supabase.js";

const companyCollectionName = "company";
const associationCollection = "association";

// get all companies
function getAllCompanies({ tenantId }) {
    return new Promise(async (resolve, reject) => {
        try {
            // const snapshot = await firebase.db
            //   .collection(companyCollectionName)
            //   .orderBy("createdDate")
            //   .where(
            //     Filter.or(
            //       Filter.where("tenantId", "==", tenantId),
            //       Filter.where("tenantId", "==", DEFAULT_SYSTEM_TENANT)
            //     )
            //   )
            //   .where("statusId", "==", 1)
            //   .get();

            // const companyList = snapshot.docs.map((doc) => {
            //   return doc.data();
            // });

            // resolve(companyList);

            const { data, error } = await supabase
                .from(companyCollectionName)
                .select("*")
                .eq("statusId", 1)
                .or(`tenantId.eq.${tenantId},tenantId.eq.${DEFAULT_SYSTEM_TENANT}`)
                .order("modifiedDate", { ascending: false });
            if (error) {
                if (!data) {
                    reject("Data not found");
                }
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            console.log("error", error);
            reject(error);
        }
    });
}

function getCompanyById({ tenantId, companyUid }) {
    return new Promise(async (resolve, reject) => {
        try {
            // const snapshot = await firebase.db.collection(companyCollectionName).doc(companyUid).get();

            // if (snapshot.data()?.statusId == 1 && snapshot.data().tenantId == tenantId) {
            //   resolve(snapshot.data());
            // } else {
            //   console.log(`Company (${companyUid}) not found`);
            //   resolve({});
            // }

            const { data, error } = await supabase
                .from(companyCollectionName)
                .select("*")
                .eq("statusId", 1)
                .eq("uid", companyUid)
                .or(`tenantId.eq.${tenantId},tenantId.eq.${DEFAULT_SYSTEM_TENANT}`)
                .single();
            if (error) {
                if (!data) {
                    console.log(`Company (${companyUid}) not found`);
                    reject(`Company (${companyUid}) not found`);
                }
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            console.log("error", error);
            reject(error);
        }
    });
}

function getCompanyAssoList({ companyUid }) {
    return new Promise(async (resolve, reject) => {
        try {
            // const assoSnapshot = await firebase.db.collection(associationCollection).orderBy("createdDate").where("statusId", "==", 1).where("profileUid", "==", companyUid).get();

            // const assoSnapshot2 = await firebase.db.collection(associationCollection).orderBy("createdDate").where("statusId", "==", 1).where("assoProfileUid", "==", companyUid).get();

            // const assoList = assoSnapshot.docs.map((doc) => {
            //     return doc.data();
            // });
            // const assoList2 = assoSnapshot2.docs.map((doc) => {
            //     return doc.data();
            // });

            // resolve({
            //     assoList,
            //     assoList2,
            // });

            const { data, error } = await supabase.from(associationCollection).select("*").eq("statusId", 1).eq("companyUid", companyUid).order("modifiedDate", { ascending: false });

            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            console.log("error", error);
            reject(error);
        }
    });
}

function createCompany({ company }) {
    // return new Promise(async (resolve, reject) => {
    //   let newRef = firebase.db.collection(companyCollectionName).doc();
    //   company.uid = newRef.id;
    //   await newRef.set(company);

    //   resolve(company);
    // });

    return new Promise(async (resolve, reject) => {
        try {
            try {
                const { data, error } = await supabase.from(companyCollectionName).insert([company]).select();

                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            } catch (error) {
                console.log("error while creating company", error);
                reject(error);
            }
        } catch (error) {
            console.log("error while creating company", error);
            reject(error);
        }
    });
}

// function updateCompany({ company }) {
//   return new Promise(async (resolve, reject) => {
//     let newRef = firebase.db.collection(companyCollectionName).doc(company.uid);
//     await newRef.update(company);

//     resolve(company);
//   });
// }

function updateCompany({ company }) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.from(companyCollectionName).update(company).eq("uid", company.uid).select();
            if (error) {
                console.log("error while updating company from supabase", error);
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            console.log("error while updating company", error);
            reject(error);
        }
    });
}

function deleteCompany({ company }) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.from(companyCollectionName).update({ statusId: 2 }).eq("uid", company.uid).select();
            if (error) {
                console.log("error while updating company from supabase", error);
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            console.log("error while updating company", error);
            reject(error);
        }
    });
}

async function getCompanyByQuery({ tenantId, query }) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await query;
            if (error) {
                console.log("error while getting company by query", error);
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            console.log("error", error);
            reject(error);
        }
    });
}

async function getCompanyByRPC({ tenantId, rpcFilter }) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.rpc(rpcFilter.function, rpcFilter.params);
            if (error) {
                console.log("error while getting company by rpc", error);
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            console.log("error", error);
            reject(error);
        }
    });
}

export { getAllCompanies, getCompanyById, getCompanyAssoList, createCompany, updateCompany, deleteCompany, getCompanyByQuery, getCompanyByRPC };
