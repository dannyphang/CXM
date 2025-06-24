import * as contactResp from "../repository/contact.repository.js";
import * as companyResp from "../repository/company.repository.js";
import * as func from "../shared/function.js";

// get all companies
function getAllCompanies({ tenantId }) {
    return new Promise(async (resolve, reject) => {
        try {
            // companyResp
            //   .getAllCompanies({ tenantId: tenantId })
            //   .then((companyList) => {
            //     companyList.forEach((item) => {
            //       item.createdDate = func.convertFirebaseDateFormat(item.createdDate);
            //       item.modifiedDate = func.convertFirebaseDateFormat(item.modifiedDate);
            //     });

            //     resolve(companyList);
            //   })
            //   .catch((error) => {
            //     console.log("error", error);
            //     reject(error);
            //   });

            companyResp
                .getAllCompanies({ tenantId: tenantId })
                .then((companyList) => {
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

        try {
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
                        .then(async (asso) => {
                            companyData.association = {};

                            let contactAssoList = await Promise.all(
                                asso.map((item) => {
                                    return contactResp.getContactById({
                                        tenantId: tenantId,
                                        contactUid: item.contactUid,
                                    });
                                })
                            );
                            companyData.association.contactList = contactAssoList;

                            resolve(companyData);
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
            console.log("error", error);
            reject(error);
        }
    });
}

// TODO: filter
// get contact by filter
function getCompanyByFilter({ tenantId, filterList }) {
    return new Promise(async (resolve, reject) => {
        try {
            companyResp
                .getAllCompanies({ tenantId: tenantId })
                .then((companyList) => {
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

// create new company
function createCompany({ tenantId, userId, companyDataList }) {
    return new Promise(async (resolve, reject) => {
        try {
            let companyList = await Promise.all(
                companyDataList.map((companyData) => {
                    companyData.createdBy = userId;
                    companyData.modifiedBy = userId;
                    companyData.tenantId = tenantId;

                    return companyResp.createCompany({ company: companyData });
                })
            );
            resolve(companyList);
        } catch (error) {
            console.log("error", error);
            reject(error);
        }
    });
}

function deleteCompany({ userId, companyDataList }) {
    return new Promise(async (resolve, reject) => {
        try {
            let companyList = await Promise.all(
                companyDataList.map((companyData) => {
                    companyData.statusId = 2;
                    companyData.modifiedBy = userId;
                    companyData.modifiedDate = new Date().toISOString();

                    return companyResp.deleteCompany({ company: companyData });
                })
            );
            resolve(companyList);
        } catch (error) {
            console.log("error", error);
            reject(error);
        }
    });
}

function updateCompany({ userId, companyDataList }) {
    return new Promise(async (resolve, reject) => {
        try {
            let companyList = await Promise.all(
                companyDataList.map((companyData) => {
                    companyData.modifiedBy = userId;
                    companyData.modifiedDate = new Date().toISOString();

                    return companyResp.updateCompany({ company: companyData });
                })
            );
            resolve(companyList);
        } catch (error) {
            reject(error);
        }
    });
}

export { getAllCompanies, getCompanyById, getCompanyByFilter, createCompany, deleteCompany, updateCompany };
