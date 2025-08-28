import * as firebase from "../configuration/firebase-admin.js";
import * as fb from "../configuration/firebase.js";
import * as func from "../shared/function.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const attachmentCollection = "attachment";

function getAttachmentByUid({ uid }) {
    return new Promise(async (resolve, reject) => {
        const snapshot = await firebase.db.collection(attachmentCollection).doc(uid).get();

        if (snapshot.data()?.statusId == 1) {
            resolve(snapshot.data());
        } else {
            resolve(null);
        }
    });
}

function uploadAttachment({ attachment }) {
    return new Promise(async (resolve, reject) => {
        let newRef = firebase.db.collection(attachmentCollection).doc();
        attachment.uid = newRef.id;

        await newRef.set(attachment);

        resolve(attachment);
    });
}

function uploadFile({ filename, file }) {
    return new Promise(async (resolve, reject) => {
        const storageRef = ref(fb.default.storage, `${filename}`);
        const contentType = file.mimetype;
        const metadata = { contentType };

        uploadBytes(storageRef, file.buffer, metadata).then((up) => {
            getDownloadURL(storageRef).then((url) => {
                resolve({
                    file: file,
                    downloadUrl: url,
                    metadata: up.metadata,
                });
            });
        });
    });
}

function getAttachmentByProfileId({ module, profileUid }) {
    return new Promise(async (resolve, reject) => {
        try {
            const snapshot = await firebase.db
                .collection(attachmentCollection)
                .where(module === "CONT" ? "contactUid" : "companyUid", "array-contains", profileUid)
                .where("statusId", "==", 1)
                .orderBy("modifiedDate", "desc")
                .get();

            const list = snapshot.docs.map((doc) => doc.data());
            resolve(list);
        } catch (error) {
            reject(error);
        }
    });
}

function updateAttachment({ attachment }) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("updateAttachment", attachment);
            let actRef = firebase.db.collection(attachmentCollection).doc(attachment.uid);

            await actRef.update(attachment);

            resolve(attachment);
        } catch (error) {
            reject(error);
        }
    });
}

export { getAttachmentByUid, uploadAttachment, uploadFile, getAttachmentByProfileId, updateAttachment };
