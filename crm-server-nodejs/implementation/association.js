import * as associationResp from "../repository/association.repository.js";

function removeAssociation({ data, userId }) {
    return new Promise((resolve, reject) => {
        associationResp.getAssociation(data).then((assoList) => {
            if (assoList[0]) {
                assoList[0].statusId = 2;
                assoList[0].modifiedDate = new Date();
                assoList[0].modifiedBy = userId;

                associationResp.updateAssociation(assoList[0]).then((asso) => {
                    resolve();
                });
            } else {
                reject("Association not found");
            }
        });
    });
}

function createAssociation({ associate }) {
    return new Promise((resolve, reject) => {
        try {
            let createDoc = [];
            if (associate.module === "CONT") {
                associate.companyAssoList.forEach(async (comp, index) => {
                    let asso = {
                        createdDate: new Date(),
                        modifiedDate: new Date(),
                        module: associate.module,
                        profileUid: associate.profileUid,
                        assoProfileUid: comp,
                        statusId: 1,
                    };
                    associationResp.createAssociation(asso).then((a) => {
                        createDoc.push(asso);
                        if (associate.companyAssoList.length - 1 === index) {
                            resolve(createDoc);
                        }
                    });
                });
            } else if (associate.module === "COMP") {
                associate.contactAssoList.forEach((cont) => {
                    let asso = {
                        createdDate: new Date(),
                        modifiedDate: new Date(),
                        module: associate.module,
                        profileUid: associate.profileUid,
                        assoProfileUid: cont,
                        statusId: 1,
                    };
                    associationResp.createAssociation(asso).then((a) => {
                        createDoc.push(asso);
                        if (associate.contactAssoList.length - 1 === index) {
                            resolve(createDoc);
                        }
                    });
                });
            }
        } catch (error) {
            reject(error);
        }
    });
}

export { removeAssociation, createAssociation };
