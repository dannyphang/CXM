import * as attachmentRepo from "../repository/attachment.repository.js";

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

export { uploadAttachment, uploadFile };
