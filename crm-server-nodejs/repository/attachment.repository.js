import * as firebase from "../firebase-admin.js";
import * as fb from "../firebase.js";
import * as func from "../shared/function.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const attachmentCollection = "attachment";

function getAttachmentByUid({ uid }) {
    return new Promise(async (resolve, reject) => {
        const snapshot = await firebase.db.collection(attachmentCollection).doc(uid).get();

        if (snapshot.data()?.statusId == 1) {
            resolve(snapshot.data());
        } else {
            resolve({});
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
        uploadBytes(storageRef, file).then((up) => {
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

export { getAttachmentByUid, uploadAttachment, uploadFile };
