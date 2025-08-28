import * as associationResp from "../repository/association.repository.js";

function removeAssociation({ data, userId }) {
    return new Promise((resolve, reject) => {
        associationResp.getAssociation({ asso: data }).then((assoList) => {
            if (assoList) {
                assoList.statusId = 2;
                assoList.modifiedDate = new Date().toISOString();
                assoList.modifiedBy = userId;

                associationResp.updateAssociation(assoList).then((asso) => {
                    resolve(asso);
                });
            } else {
                reject("Association not found");
            }
        });
    });
}

function createAssociation({ associate, userId }) {
    return new Promise(async (resolve, reject) => {
        try {
            if (associate.module === "CONT") {
                let assoList = await Promise.all(
                    associate.companyAssoList.map((uid) => {
                        let asso = {
                            createdBy: userId,
                            modifiedBy: userId,
                            contactUid: associate.profileUid,
                            companyUid: uid,
                        };
                        return associationResp.createAssociation(asso);
                    })
                );
                resolve(assoList);
            } else if (associate.module === "COMP") {
                let assoList = await Promise.all(
                    associate.contactAssoList.map((uid) => {
                        let asso = {
                            createdBy: userId,
                            modifiedBy: userId,
                            companyUid: associate.profileUid,
                            contactUid: uid,
                        };
                        return associationResp.createAssociation(asso);
                    })
                );
                resolve(assoList);
            }
        } catch (error) {
            reject(error);
        }
    });
}

export { removeAssociation, createAssociation };
