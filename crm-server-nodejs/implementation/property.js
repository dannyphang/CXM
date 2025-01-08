import * as propertyRepo from "../repository/property.repository.js";
import * as authRepo from "../repository/auth.repository.js";
import * as contactRepo from "../repository/contact.repository.js";
import * as companyRepo from "../repository/company.repository.js";
import * as func from "../shared/function.js";

function getAllModuleCodeByModuleType({ tenantId, moduleType }) {
    return new Promise(async (resolve, reject) => {
        try {
            propertyRepo.getAllModuleByModuleType({ tenantId: tenantId, moduleType: moduleType }).then((list) => {
                resolve(list);
            });
        } catch (error) {
            reject(error);
        }
    });
}

function getAllModuleBySubModule({ tenantId, subModuleCode }) {
    return new Promise((resolve, reject) => {
        try {
            propertyRepo.getAllModuleBySubModule({ tenantId: tenantId, moduleType: moduleType }).then((list) => {
                resolve(list);
            });
        } catch (error) {
            reject(error);
        }
    });
}

function createModule({ userId, moduleList }) {
    return new Promise((resolve, reject) => {
        try {
            let list = [];
            moduleList.forEach((module, index) => {
                module.createdDate = new Date();
                module.modifiedDate = new Date();
                module.createdBy = userId;
                module.modifiedBy = userId;

                propertyRepo.createModule({ module: module }).then((m) => {
                    list.push(m);
                    if (moduleList.length - 1 === index) {
                        resolve(list);
                    }
                });
            });
        } catch (error) {
            reject(error);
        }
    });
}

// get all properties with lookup by module
function getAllProperty({ moduleCode, tenantId }) {
    return new Promise(async (resolve, reject) => {
        try {
            let userList = await authRepo.getAllUsers();

            let propertyList = await propertyRepo.getAllPropertiesByModule({
                moduleCode: moduleCode,
                tenantId: tenantId,
            });

            let moduleList = await propertyRepo.getAllModuleSub({
                moduleCode: moduleCode,
            });

            let propertyLookupList = await propertyRepo.getAllPropertyLookUpList({
                moduleCode: moduleCode,
            });

            // add default value: SYSTEM
            userList.users.push({
                uid: "SYSTEM",
                displayName: "SYSTEM",
            });

            // insert lookup
            for (let i = 0; i < propertyList.length; i++) {
                propertyList[i].propertyLookupList = [];

                propertyList[i].createdDate = func.convertFirebaseDateFormat(propertyList[i].createdDate);
                propertyList[i].modifiedDate = func.convertFirebaseDateFormat(propertyList[i].modifiedDate);

                // assign user list into lookup property
                if (propertyList[i].propertyType === "USR") {
                    propertyList[i].propertyLookupList = userList.users;
                }

                for (let j = 0; j < propertyLookupList.length; j++) {
                    if (propertyList[i].propertyId === propertyLookupList[j].propertyId) {
                        propertyLookupList[j].createdDate = func.convertFirebaseDateFormat(propertyLookupList[j].createdDate);
                        propertyLookupList[i].modifiedDate = func.convertFirebaseDateFormat(propertyLookupList[j].modifiedDate);
                        propertyList[i].propertyLookupList.push(propertyLookupList[j]);
                    }
                    if (propertyList[i].propertyType === "CBX_S") {
                        if (propertyLookupList[j].propertyLookupCode === "true") {
                            propertyLookupList[j].createdDate = func.convertFirebaseDateFormat(propertyLookupList[j].createdDate);
                            propertyLookupList[j].modifiedDate = func.convertFirebaseDateFormat(propertyLookupList[j].modifiedDate);
                            propertyList[i].propertyLookupList.push(propertyLookupList[j]);
                        } else if (propertyLookupList[j].propertyLookupCode === "false") {
                            propertyLookupList[j].createdDate = func.convertFirebaseDateFormat(propertyLookupList[j].createdDate);
                            propertyLookupList[j].modifiedDate = func.convertFirebaseDateFormat(propertyLookupList[j].modifiedDate);
                            propertyList[i].propertyLookupList.push(propertyLookupList[j]);
                        }
                    }
                }
            }

            moduleList.forEach((module) => {
                module.propertiesList = [];
                module.createdDate = func.convertFirebaseDateFormat(module.createdDate);
                module.modifiedDate = func.convertFirebaseDateFormat(module.modifiedDate);
                for (let i = 0; i < propertyList.length; i++) {
                    if (module.moduleCode === propertyList[i].moduleCat) {
                        module.propertiesList.push(propertyList[i]);
                    }
                }
            });

            resolve(moduleList);
        } catch (error) {
            reject(error);
        }
    });
}

function createProperty({ userId, tenantId, propertyList }) {
    return new Promise(async (resolve, reject) => {
        try {
            let list = [];
            propertyList.forEach((property, index) => {
                property.createdDate = new Date();
                property.createdBy = userId;
                property.modifiedDate = new Date();
                property.modifiedBy = userId;
                property.tenantId = tenantId;

                propertyRepo.createProperty({ property: property }).then((p) => {
                    list.push(p);
                    if (propertyList.length - 1 === index) {
                        resolve(list);
                    }
                });
            });
        } catch (error) {
            reject(error);
        }
    });
}

function updateProperty({ userId, propertyList }) {
    try {
        propertyList.forEach((property, index) => {
            property.modifiedDate = new Date();
            property.modifiedBy = userId;

            propertyRepo
                .updateProperty({
                    property: property,
                })
                .then((_) => {
                    if (propertyList.length - 1 === index) {
                        resolve();
                    }
                });
        });
    } catch (error) {
        reject(error);
    }
}

function deleteProperty({ userId, propertyList }) {
    try {
        propertyList.forEach((property, index) => {
            property.statusId = 2;
            property.modifiedDate = new Date();
            property.modifiedBy = userId;

            propertyRepo
                .updateProperty({
                    property: property,
                })
                .then((_) => {
                    if (propertyList.length - 1 === index) {
                        resolve();
                    }
                });
        });
    } catch (error) {
        reject(error);
    }
}

function createPropertyLookUp({ tenantId, userId, propertyList }) {
    return new Promise((resolve, reject) => {
        try {
            propertyList.forEach((property, index) => {
                property.tenantId = tenantId;
                property.createdDate = new Date();
                property.modifiedDate = new Date();
                property.modifiedBy = userId;
                property.createdBy = userId;
                propertyRepo
                    .createPropertyLookUp({
                        property: property,
                    })
                    .then((p) => {
                        if (propertyList.length - 1 === index) {
                            resolve(propertyList);
                        }
                    });
            });
        } catch (error) {
            reject(error);
        }
    });
}

function updatePropertyLookUp({ userId, propertyList }) {
    return new Promise((resolve, reject) => {
        propertyList.forEach((property, index) => {
            property.modifiedDate = new Date();
            property.modifiedBy = userId;

            propertyRepo
                .updatePropertyLookUp({
                    property: property,
                })
                .then((_) => {
                    if (propertyList.length - 1 === index) {
                        resolve();
                    }
                });
        });
    });
}

function getAllActivityModule() {
    return new Promise(async (resolve, reject) => {
        try {
            let activityModuleList = await propertyRepo.getActivityModuleList();
            let activityControlList = await propertyRepo.getActivityControlList();
            let subActivityControlList = await propertyRepo.getActivitySubControlList();

            activityControlList.forEach((item) => {
                item.subActivityControl = [];
                subActivityControlList.forEach((subItem) => {
                    if (item.moduleCode === subItem.moduleSubCode) {
                        item.subActivityControl.push(subItem);
                    }
                });
            });

            resolve({
                activityModuleList,
                activityControlList,
            });
        } catch (error) {
            reject(error);
        }
    });
}

function checkUnique({ tenantId, module, propertyDataList, propertyList }) {
    return new Promise(async (resolve, reject) => {
        try {
            let notUniqueProperties = []; // Collect all non-unique properties here
            for (const [index, p] of propertyList.entries()) {
                if (p.isUnique) {
                    let profileList = [];
                    // Fetch all profiles for the tenant
                    if (module === "CONT") {
                        profileList = await contactRepo.getAllContacts({
                            tenantId: tenantId,
                        });
                    } else {
                        profileList = await companyRepo.getAllCompanies({
                            tenantId: tenantId,
                        });
                    }

                    let pCode = "";
                    // Determine property code
                    if (!p.isDefaultProperty && p.isEditable) {
                        // Property is not in JSON property
                        switch (p.propertyCode) {
                            case "first_name":
                                pCode = "contactFirstName";
                                break;
                            case "last_name":
                                pCode = "contactLastName";
                                break;
                            case "email":
                                pCode = module === "CONT" ? "contactEmail" : "companyEmail";
                                stopHere = true;
                                break;
                            case "phone_number":
                                pCode = "contactPhone";
                                break;
                            case "company_name":
                                pCode = "companyName";
                                break;
                            case "website_url":
                                pCode = "companyWebsite";
                                break;
                        }
                    } else {
                        // Property is in JSON property
                        pCode = p.propertyCode;
                    }

                    // loop profile
                    let mergedProfileList = [];
                    profileList.forEach((profile) => {
                        // merge ori and property obj
                        let propertyObjList = JSON.parse(module === "CONT" ? profile.contactProperties : profile.companyProperties);

                        const newPropertyObject = propertyObjList.reduce((acc, obj) => {
                            acc[obj.propertyCode] = obj.value;
                            return acc;
                        }, {});

                        let mergedProfile = {
                            ...profile,
                            ...newPropertyObject,
                        };
                        mergedProfileList.push(mergedProfile);
                    });

                    // Check if the profile contains this value
                    const propertyValue = propertyDataList.find((pdl) => pdl.uid === p.uid)?.value ?? null;
                    const isNotUnique = mergedProfileList.some((profile) => profile[pCode] === propertyValue);

                    if (isNotUnique) {
                        notUniqueProperties.push(propertyDataList.find((pd) => pd.uid === p.uid));
                    }
                }
            }

            resolve(notUniqueProperties);
        } catch (error) {
            reject(error);
        }
    });
}

export {
    getAllModuleCodeByModuleType,
    getAllModuleBySubModule,
    createModule,
    getAllProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    createPropertyLookUp,
    updatePropertyLookUp,
    getAllActivityModule,
    checkUnique,
};
