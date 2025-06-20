import * as firebase from "../configuration/firebase-admin.js";
import { Filter } from "firebase-admin/firestore";
import { DEFAULT_SYSTEM_TENANT } from "../shared/constant/constant.js";

const contactCollectionName = "contact";
const associationCollection = "association";

// get all contacts
function getAllContacts({ tenantId }) {
    return new Promise(async (resolve, reject) => {
        try {
            const snapshot = await firebase.db
                .collection(contactCollectionName)
                .orderBy("createdDate")
                .where(Filter.or(Filter.where("tenantId", "==", tenantId), Filter.where("tenantId", "==", DEFAULT_SYSTEM_TENANT)))
                .where("statusId", "==", 1)
                .get();

            const contactList = snapshot.docs.map((doc) => {
                return doc.data();
            });

            resolve(contactList);
        } catch (error) {
            console.log("error", error);
            reject(error);
        }
    });
}

function getContactById({ tenantId, contactUid }) {
    return new Promise(async (resolve, reject) => {
        try {
            const snapshot = await firebase.db.collection(contactCollectionName).doc(contactUid).get();

            if (snapshot.data()?.statusId == 1 && snapshot.data()?.tenantId == tenantId) {
                resolve(snapshot.data());
            } else {
                console.log(`Contact (${contactUid}) not found`);
                resolve({});
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
            const assoSnapshot = await firebase.db.collection(associationCollection).orderBy("createdDate").where("statusId", "==", 1).where("profileUid", "==", contactUid).get();

            const assoSnapshot2 = await firebase.db.collection(associationCollection).orderBy("createdDate").where("statusId", "==", 1).where("assoProfileUid", "==", contactUid).get();

            const assoList = assoSnapshot.docs.map((doc) => {
                return doc.data();
            });
            const assoList2 = assoSnapshot2.docs.map((doc) => {
                return doc.data();
            });

            resolve({
                assoList,
                assoList2,
            });
        } catch (error) {
            console.log("error", error);
            reject(error);
        }
    });
}

function createContact({ contact }) {
    return new Promise(async (resolve, reject) => {
        let newRef = firebase.db.collection(contactCollectionName).doc();
        contact.uid = newRef.id;
        await newRef.set(contact);

        resolve(contact);
    });
}

function updateContact({ contact }) {
    return new Promise(async (resolve, reject) => {
        let newRef = firebase.db.collection(contactCollectionName).doc(contact.uid);
        await newRef.update(contact);

        resolve(contact);
    });
}

export { getAllContacts, getContactById, getContactAssoList, createContact, updateContact };
