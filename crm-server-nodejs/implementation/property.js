import * as propertyRepo from "../repository/property.repository.js";
import * as authRepo from "../repository/auth.repository.js";
import * as contactRepo from "../repository/contact.repository.js";
import * as companyRepo from "../repository/company.repository.js";
import * as func from "../shared/function.js";

function getAllModuleCodeByModuleType({ tenantId, moduleType }) {
    return new Promise(async (resolve, reject) => {
        try {
            propertyRepo
                .getAllModuleByModuleType({ tenantId: tenantId, moduleType: moduleType })
                .then((list) => {
                    resolve(list);
                })
                .catch((error) => {
                    reject(error);
                });
        } catch (error) {
            reject(error);
        }
    });
}

function getAllModuleBySubModule({ tenantId, subModuleCode }) {
    return new Promise((resolve, reject) => {
        try {
            propertyRepo
                .getAllModuleBySubModule({ tenantId: tenantId, subModuleCode: subModuleCode })
                .then((list) => {
                    resolve(list);
                })
                .catch((error) => {
                    reject(error);
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
    return new Promise((resolve, reject) => {
        Promise.all([
            authRepo.getAllUsers({ tenantId: tenantId }),
            propertyRepo.getAllPropertiesByModule({ moduleCode, tenantId }),
            propertyRepo.getAllModuleSub({ moduleCode, tenantId }),
            propertyRepo.getAllPropertyLookUpList({ moduleCode, tenantId }),
        ])
            .then(([userListRes, propertyList, moduleList, propertyLookupList]) => {
                const userList = userListRes.map((record) => record.user);

                const lookupMap = new Map();
                propertyLookupList.forEach((lookup) => {
                    if (!lookupMap.has(lookup.propertyId)) {
                        lookupMap.set(lookup.propertyId, []);
                    }
                    lookupMap.get(lookup.propertyId).push(lookup);
                });

                propertyList.forEach((property) => {
                    const lookups = lookupMap.get(property.propertyId) || [];

                    if (property.propertyType === "USR") {
                        property.propertyLookupList = userList;
                    } else if (property.propertyType === "CBX_S") {
                        property.propertyLookupList = lookups.filter((l) => l.propertyLookupCode === "true" || l.propertyLookupCode === "false");
                    } else {
                        property.propertyLookupList = lookups;
                    }
                });

                const propertyByModule = new Map();
                propertyList.forEach((property) => {
                    if (!propertyByModule.has(property.moduleCat)) {
                        propertyByModule.set(property.moduleCat, []);
                    }
                    propertyByModule.get(property.moduleCat).push(property);
                });

                moduleList.forEach((module) => {
                    module.propertiesList = propertyByModule.get(module.moduleCode) || [];
                });

                resolve(moduleList);
            })
            .catch((error) => {
                console.error("Error fetching properties:", error);
                reject(error);
            });
    });
}

function createProperty({ userId, tenantId, propertyList }) {
    return new Promise(async (resolve, reject) => {
        try {
            propertyList.forEach((property, index) => {
                property.createdDate = new Date();
                property.createdBy = userId;
                property.modifiedDate = new Date();
                property.modifiedBy = userId;
                property.tenantId = tenantId;

                propertyRepo
                    .createProperty({ property: property })
                    .then((p) => {
                        resolve(p);
                    })
                    .catch((error) => {
                        console.error("Error creating property:", error);
                        reject(error);
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
    return new Promise((resolve, reject) => {
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
    });
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
                    })
                    .catch((error) => {
                        console.error("Error creating property lookup:", error);
                        reject(error);
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

async function checkUnique({ tenantId, module, propertyDataList, propertyList }) {
    try {
        let notUniqueProperties = [];

        for (const p of propertyList) {
            if (p.isUnique) {
                let profileList = [];

                // Fetch all profiles for the tenant
                if (module === "CONT") {
                    profileList = await contactRepo.getAllContacts({ tenantId });
                } else {
                    profileList = await companyRepo.getAllCompanies({ tenantId });
                }

                let pCode = "";
                if (!p.isDefaultProperty && p.isEditable) {
                    switch (p.propertyCode) {
                        case "first_name":
                            pCode = "contactFirstName";
                            break;
                        case "last_name":
                            pCode = "contactLastName";
                            break;
                        case "email":
                            pCode = module === "CONT" ? "contactEmail" : "companyEmail";
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
                    pCode = p.propertyCode;
                }

                const mergedProfileList = profileList.map((profile) => {
                    const propertyObjList = module === "CONT" ? profile.contactProperties : profile.companyProperties;
                    const newPropertyObject = propertyObjList.reduce((acc, obj) => {
                        acc[obj.propertyCode] = obj.value;
                        return acc;
                    }, {});
                    return {
                        ...profile,
                        ...newPropertyObject,
                    };
                });

                const propertyValue = propertyDataList.find((pdl) => pdl.uid === p.uid)?.value ?? null;
                const isNotUnique = mergedProfileList.some((profile) => profile[pCode] === propertyValue);

                if (isNotUnique) {
                    notUniqueProperties.push(propertyDataList.find((pd) => pd.uid === p.uid));
                }
            }
        }

        return notUniqueProperties;
    } catch (error) {
        throw error;
    }
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
