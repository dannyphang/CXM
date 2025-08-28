import * as attachmentRepo from "../repository/attachment.repository.js";

import * as func from "../shared/function.js";

function uploadAttachment({ userId, attachmentList }) {
    return new Promise(async (resolve, reject) => {
        try {
            let createDoc = [];
            attachmentList.forEach((attachment, index) => {
                attachment.createdDate = new Date();
                attachment.createdBy = userId;
                attachment.modifiedDate = new Date();
                attachment.modifiedBy = userId;
                attachment.statusId = 1;

                attachmentRepo.uploadAttachment({ attachment: attachment }).then((a) => {
                    createDoc.push(a);
                    if (attachmentList.length - 1 === index) {
                        resolve(createDoc);
                    }
                });
            });
        } catch (error) {
            reject(error);
        }
    });
}

function uploadFile({ folderName, fileOriginalname, file }) {
    return new Promise(async (resolve, reject) => {
        try {
            if (file == undefined) {
                reject("Please upload a file!");
            }

            attachmentRepo
                .uploadFile({
                    filename: `${folderName}/${fileOriginalname}`,
                    file: file,
                })
                .then((data) => {
                    resolve(data);
                });
        } catch (error) {
            reject(error);
        }
    });
}

function getAttachmentByProfileId({ module, profileUid }) {
    return new Promise(async (resolve, reject) => {
        try {
            attachmentRepo.getAttachmentByProfileId({ module: module, profileUid: profileUid }).then((list) => {
                if (list.length > 0) {
                    list.forEach((att, index) => {
                        att.createdDate = func.convertFirebaseDateFormat(att.createdDate);
                        att.modifiedDate = func.convertFirebaseDateFormat(att.modifiedDate);

                        if (list.length - 1 === index) {
                            resolve(list);
                        }
                    });
                } else {
                    resolve();
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

function removeAttachment({ attachmentList, userId }) {
    return new Promise(async (resolve, reject) => {
        try {
            let list = [];
            attachmentList.forEach((a, index) => {
                a.statusId = 2;
                a.modifiedDate = new Date();
                a.modifiedBy = userId;

                attachmentRepo.updateAttachment({ attachment: a }).then((al) => {
                    list.push(al);
                    if (attachmentList.length - 1 === index) {
                        resolve(list);
                    }
                });
            });
        } catch (error) {
            reject(error);
        }
    });
}

function removeAttachmentById({ attachmentId, userId }) {
    return new Promise(async (resolve, reject) => {
        try {
            attachmentRepo
                .getAttachmentByUid({ uid: attachmentId })
                .then((attachment) => {
                    if (attachment) {
                        attachment.statusId = 2;
                        attachment.modifiedDate = new Date();
                        attachment.modifiedBy = userId;

                        attachmentRepo.updateAttachment({ attachment: attachment }).then((al) => {
                            resolve(al);
                        });
                    } else {
                        resolve();
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        } catch (error) {
            reject(error);
        }
    });
}

export { uploadAttachment, uploadFile, getAttachmentByProfileId, removeAttachment, removeAttachmentById };
