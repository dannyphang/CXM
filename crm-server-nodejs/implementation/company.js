import * as contactResp from "../repository/contact.repository.js";
import * as companyResp from "../repository/company.repository.js";
import * as func from "../shared/function.js";

// get all companies
function getAllCompanies({ tenantId }) {
    return new Promise(async (resolve, reject) => {
        try {
            companyResp
                .getAllCompanies({ tenantId: tenantId })
                .then((companyList) => {
                    companyList.forEach((item) => {
                        item.createdDate = func.convertFirebaseDateFormat(item.createdDate);
                        item.modifiedDate = func.convertFirebaseDateFormat(item.modifiedDate);
                    });

                    resolve(companyList);
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

// get company by id
function getCompanyById({ tenantId, companyUid }) {
    return new Promise(async (resolve, reject) => {
        let companyData = {};

        companyResp
            .getCompanyById({
                tenantId: tenantId,
                companyUid: companyUid,
            })
            .then((c) => {
                companyData = c;
                companyResp
                    .getCompanyAssoList({
                        companyUid: companyUid,
                    })
                    .then((assoObj) => {
                        const assoList = assoObj.assoList;
                        const assoList2 = assoObj.assoList2;

                        if (assoList.length > 0 || assoList2.length > 0) {
                            companyData.association = {};
                            companyData.association.contactList = [];

                            let p1 = new Promise((resolve, reject) => {
                                if (assoList.length == 0) {
                                    resolve();
                                }
                                let count = 0;

                                assoList.forEach(async (item) => {
                                    companyResp
                                        .getCompanyById({
                                            companyUid: item.assoProfileUid,
                                        })
                                        .then((cont) => {
                                            companyData.association.contactList.push(cont);
                                            count++;
                                        });

                                    if (assoList.length == count) {
                                        resolve();
                                    }
                                });
                            });

                            let p2 = new Promise((resolve, reject) => {
                                if (assoList.length == 0) {
                                    resolve();
                                }
                                let count = 0;

                                assoList.forEach(async (item) => {
                                    companyResp
                                        .getCompanyById({
                                            companyUid: item.profileUid,
                                        })
                                        .then((comp) => {
                                            companyData.association.companyList.push(comp);
                                            count++;
                                        });

                                    if (assoList2.length == count) {
                                        resolve();
                                    }
                                });
                            });

                            Promise.all([p1, p2]).then((_) => {
                                resolve(companyData);
                            });
                        } else {
                            resolve(companyData);
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            })
            .catch((error) => {
                console.log(error);
            });
    });
}

// create new company
function createCompany({ tenantId, userId, companyDataList }) {
    return new Promise(async (resolve, reject) => {
        try {
            let cList = [];
            companyDataList.forEach((companyData, index) => {
                companyData.createdDate = new Date();
                companyData.createdBy = userId;
                companyData.modifiedDate = new Date();
                companyData.modifiedBy = userId;
                companyData.statusId = 1;
                companyData.tenantId = tenantId;

                companyResp.createCompany({ companyData: companyData }).then((company) => {
                    cList.push(company);
                    if (companyDataList.length - 1 === index) {
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

function deleteCompany({ userId, companyDataList }) {
    return new Promise(async (resolve, reject) => {
        try {
            let cList = [];
            companyDataList.forEach((company, index) => {
                company.statusId = 2;
                company.modifiedDate = new Date();
                company.modifiedBy = userId;

                companyResp
                    .updateCompany({
                        company: company,
                    })
                    .then((companyData) => {
                        cList.push(companyData);

                        if (companyDataList.length - 1 === index) {
                            resolve(cList);
                        }
                    });
            });
        } catch (error) {
            reject(error);
        }
    });
}

function updateCompany({ userId, companyDataList }) {
    return new Promise(async (resolve, reject) => {
        try {
            let cList = [];
            companyDataList.forEach((company, index) => {
                company.modifiedDate = new Date();
                company.modifiedBy = userId;

                companyResp
                    .updateCompany({
                        company: company,
                    })
                    .then((companyData) => {
                        cList.push(companyData);

                        if (companyDataList.length - 1 === index) {
                            resolve(cList);
                        }
                    });
            });
        } catch (error) {
            reject(error);
        }
    });
}

export { getAllCompanies, getCompanyById, createCompany, deleteCompany, updateCompany };
