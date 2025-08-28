import * as firebase from "../configuration/firebase-admin.js";
import { supabase } from "../configuration/supabase.js";

const associationTableName = "association";

function getAssociation({ asso }) {
    return new Promise(async (resolve, reject) => {
        // const assoSnapshot = await firebase.db
        //   .collection(associationCollection)
        //   .where("statusId", "==", 1)
        //   .where("profileUid", "==", data.uid)
        //   .where("module", "==", data.module)
        //   .where("assoProfileUid", "==", data.assoUid)
        //   .get();
        // const assoList = assoSnapshot.docs.map((doc) => {
        //   return doc.data();
        // });
        // resolve(assoList);
        try {
            const { data, error } = await supabase.from(associationTableName).select("*").eq("statusId", 1).or(`contactUid.eq.${asso.contactUid},companyUid.eq.${asso.companyUid}`).single();

            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            console.log("error while getting association", error);
            reject(error);
        }
    });
}

function updateAssociation(associate) {
    return new Promise(async (resolve, reject) => {
        // let newRef = firebase.db.collection(associationCollection).doc(associate.uid);
        // await newRef.update(associate);
        // resolve(associate);
        try {
            const { data, error } = await supabase.from(associationTableName).update(associate).eq("uid", associate.uid).select();

            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            console.log("error while updating association", error);
            reject(error);
        }
    });
}

function createAssociation(associate) {
    return new Promise(async (resolve, reject) => {
        // let newRef = firebase.db.collection(associationCollection).doc();
        // associate.uid = newRef.id;
        // await newRef.set(associate);

        // resolve(associate);

        try {
            const { data, error } = await supabase.from(associationTableName).insert([associate]).select();
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

export { getAssociation, updateAssociation, createAssociation };
