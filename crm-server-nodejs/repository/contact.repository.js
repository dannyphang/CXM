import { DEFAULT_SYSTEM_TENANT } from "../shared/constant.js";
import { supabase } from "../configuration/supabase.js";

const contactCollectionName = "contact";
const associationCollection = "association";

// get all contacts
function getAllContacts({ tenantId }) {
    return new Promise(async (resolve, reject) => {
        try {
            // const snapshot = await firebase.db
            //   .collection(contactCollectionName)
            //   .orderBy("createdDate")
            //   .where(
            //     Filter.or(
            //       Filter.where("tenantId", "==", tenantId),
            //       Filter.where("tenantId", "==", DEFAULT_SYSTEM_TENANT)
            //     )
            //   )
            //   .where("statusId", "==", 1)
            //   .get();

            // const contactList = snapshot.docs.map((doc) => {
            //   return doc.data();
            // });

            // resolve(contactList);

            const { data, error } = await supabase
                .from(contactCollectionName)
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

function getContactById({ tenantId, contactUid }) {
    return new Promise(async (resolve, reject) => {
        try {
            // const snapshot = await firebase.db.collection(contactCollectionName).doc(contactUid).get();

            // if (snapshot.data()?.statusId == 1 && snapshot.data()?.tenantId == tenantId) {
            //     resolve(snapshot.data());
            // } else {
            //     console.log(`Contact (${contactUid}) not found`);
            //     resolve({});
            // }

            const { data, error } = await supabase
                .from(contactCollectionName)
                .select("*")
                .eq("statusId", 1)
                .eq("uid", contactUid)
                .or(`tenantId.eq.${tenantId},tenantId.eq.${DEFAULT_SYSTEM_TENANT}`)
                .single();
            if (error) {
                if (!data) {
                    console.log(`Contact (${contactUid}) not found`);
                    reject(`Contact (${contactUid}) not found`);
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

function getContactAssoList({ contactUid }) {
    return new Promise(async (resolve, reject) => {
        try {
            // const assoSnapshot = await firebase.db.collection(associationCollection).orderBy("createdDate").where("statusId", "==", 1).where("profileUid", "==", contactUid).get();

            // const assoSnapshot2 = await firebase.db.collection(associationCollection).orderBy("createdDate").where("statusId", "==", 1).where("assoProfileUid", "==", contactUid).get();

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

            const { data, error } = await supabase.from(associationCollection).select("*").eq("statusId", 1).eq("contactUid", contactUid).order("modifiedDate", { ascending: false });

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

function createContact({ contact }) {
    return new Promise(async (resolve, reject) => {
        // let newRef = firebase.db.collection(contactCollectionName).doc();
        // contact.uid = newRef.id;
        // await newRef.set(contact);

        // resolve(contact);

        try {
            const { data, error } = await supabase.from(contactCollectionName).insert([contact]).select();

            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            console.log("error while creating contact", error);
            reject(error);
        }
    });
}

function updateContact({ contact }) {
    return new Promise(async (resolve, reject) => {
        // let newRef = firebase.db.collection(contactCollectionName).doc(contact.uid);
        // await newRef.update(contact);

        // resolve(contact);

        try {
            const { data, error } = await supabase.from(contactCollectionName).update(contact).eq("uid", contact.uid).select();
            if (error) {
                console.log("error while updating contact from supabase", error);
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            console.log("error while updating contact", error);
            reject(error);
        }
    });
}

function deleteContact({ contact }) {
    return new Promise(async (resolve, reject) => {
        // let newRef = firebase.db.collection(contactCollectionName).doc(contact.uid);
        // await newRef.update(contact);

        // resolve(contact);

        try {
            const { data, error } = await supabase.from(contactCollectionName).update({ statusId: 2 }).eq("uid", contact.uid).select();
            if (error) {
                console.log("error while updating contact from supabase", error);
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            console.log("error while updating contact", error);
            reject(error);
        }
    });
}

async function getContactByQuery({ tenantId, queryConfig }) {
    // console.log("getContactByQuery called with queryConfig:", queryConfig);
    if (queryConfig.rpc) {
        // Call Supabase RPC
        const { data, error } = await supabase.rpc(queryConfig.function, queryConfig.params);
        if (error) throw error;
        return data;
    } else {
        // It's a chained Supabase query
        const { data, error } = await queryConfig;
        if (error) throw error;
        return data;
    }
}

export { getAllContacts, getContactById, getContactAssoList, createContact, updateContact, deleteContact, getContactByQuery };
