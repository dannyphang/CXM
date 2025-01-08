import * as contactResp from "../repository/contact.repository.js";
import * as companyResp from "../repository/company.repository.js";
import * as func from "../shared/function.js";

// get all contacts
function getAllContacts({ tenantId }) {
    return new Promise(async (resolve, reject) => {
        try {
            contactResp
                .getAllContacts({ tenantId: tenantId })
                .then((contactList) => {
                    contactList.forEach((item) => {
                        item.createdDate = func.convertFirebaseDateFormat(item.createdDate);
                        item.modifiedDate = func.convertFirebaseDateFormat(item.modifiedDate);
                    });

                    resolve(contactList);
                })
                .catch((error) => {
                    console.log("error", error);
                    reject(error);
                });
        } catch (error) {
            console.log("error", error);
            reject(error);
        }
    });
}

// get contact by id
function getContactById({ tenantId, contactUid }) {
    return new Promise(async (resolve, reject) => {
        let contactData = {};
        try {
            contactResp
                .getContactById({
                    tenantId: tenantId,
                    contactUid: contactUid,
                })
                .then((c) => {
                    contactData = c;
                    contactResp
                        .getContactAssoList({
                            contactUid: contactUid,
                        })
                        .then((assoObj) => {
                            const assoList = assoObj.assoList;
                            const assoList2 = assoObj.assoList2;

                            if (assoList.length > 0 || assoList2.length > 0) {
                                contactData.association = {};
                                contactData.association.companyList = [];

                                let p1 = new Promise((resolve, reject) => {
                                    if (assoList.length == 0) {
                                        resolve(contactData);
                                    }
                                    let count = 0;

                                    assoList.forEach(async (item) => {
                                        companyResp
                                            .getCompanyById({
                                                tenantId: tenantId,
                                                companyUid: item.assoProfileUid,
                                            })
                                            .then((comp) => {
                                                contactData.association.companyList.push(comp);
                                                count++;
                                                if (assoList.length == count) {
                                                    resolve(contactData);
                                                }
                                            })
                                            .catch((error) => {
                                                console.log(error);
                                                reject();
                                            });
                                    });
                                });

                                let p2 = new Promise((resolve, reject) => {
                                    if (assoList2.length == 0) {
                                        resolve(contactData);
                                    }
                                    let count = 0;

                                    assoList2.forEach(async (item) => {
                                        companyResp
                                            .getCompanyById({
                                                tenantId: tenantId,
                                                companyUid: item.profileUid,
                                            })
                                            .then((comp) => {
                                                contactData.association.companyList.push(comp);
                                                count++;
                                                if (assoList2.length == count) {
                                                    resolve(contactData);
                                                }
                                            })
                                            .catch((error) => {
                                                console.log(error);
                                                reject();
                                            });
                                    });
                                });

                                Promise.all([p1, p2]).then((_) => {
                                    resolve(contactData);
                                });
                            } else {
                                resolve(contactData);
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                            reject();
                        });
                })
                .catch((error) => {
                    console.log(error);
                    reject();
                });
        } catch (error) {
            console.log(error);
            reject();
        }
    });
}

// create new contact
function createContact({ tenantId, userId, contactDataList }) {
    return new Promise(async (resolve, reject) => {
        try {
            let cList = [];
            contactDataList.forEach((contactData, index) => {
                contactData.createdDate = new Date();
                contactData.createdBy = userId;
                contactData.modifiedDate = new Date();
                contactData.modifiedBy = userId;
                contactData.statusId = 1;
                contactData.tenantId = tenantId;

                contactResp.createContact({ contactData: contactData }).then((contact) => {
                    cList.push(contact);
                    if (contactDataList.length - 1 === index) {
                        resolve(cList);
                    }
                });
            });
        } catch (error) {
            console.log("error", error);
            reject(error);
        }
    });
}

function deleteContact({ userId, contactDataList }) {
    return new Promise(async (resolve, reject) => {
        try {
            let cList = [];
            contactDataList.forEach((contact, index) => {
                contact.statusId = 2;
                contact.modifiedDate = new Date();
                contact.modifiedBy = userId;

                contactResp
                    .updateContact({
                        contact: contact,
                    })
                    .then((contactData) => {
                        cList.push(contactData);

                        if (contactDataList.length - 1 === index) {
                            resolve(cList);
                        }
                    });
            });
        } catch (error) {
            reject(error);
        }
    });
}

function updateContact({ userId, contactDataList }) {
    return new Promise(async (resolve, reject) => {
        try {
            let cList = [];
            contactDataList.forEach((contact, index) => {
                contact.modifiedDate = new Date();
                contact.modifiedBy = userId;

                contactResp
                    .updateContact({
                        contact: contact,
                    })
                    .then((contactData) => {
                        cList.push(contactData);

                        if (contactDataList.length - 1 === index) {
                            resolve(cList);
                        }
                    });
            });
        } catch (error) {
            reject(error);
        }
    });
}

export { getAllContacts, getContactById, createContact, deleteContact, updateContact };
