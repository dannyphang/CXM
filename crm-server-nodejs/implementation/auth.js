import * as authRepo from "../repository/auth.repository.js";

import * as func from "../shared/function.js";

function getAllUsers() {
    return new Promise((resolve, reject) => {
        authRepo.getAllUsers().then((list) => {
            resolve(list);
        });
    });
}

function createUser({ userId, createUserList }) {
    return new Promise((resolve, reject) => {
        try {
            let list = [];
            createUserList.forEach((user, index) => {
                user.statusId = 1;
                user.createdBy = userId;
                user.modifiedBy = userId;
                user.createdDate = new Date();
                user.modifiedDate = new Date();

                authRepo.createUser({ user: user }).then((c) => {
                    list.push(c);
                    if (createUserList.length - 1 === index) {
                        resolve(list);
                    }
                });
            });
        } catch (error) {
            reject(error);
        }
    });
}

function getUserByEmail({ email }) {
    return new Promise((resolve, reject) => {
        try {
            authRepo
                .getUserByEmail({ email })
                .then((user) => {
                    let userData = user;
                    userData.createdDate = func.convertFirebaseDateFormat(userData.createdDate);
                    userData.modifiedDate = func.convertFirebaseDateFormat(userData.modifiedDate);
                    resolve(userData);
                })
                .catch((error) => {
                    reject("User not found");
                });
        } catch (error) {
            reject(error);
        }
    });
}

function getUserById({ uid }) {
    return new Promise((resolve, reject) => {
        try {
            authRepo
                .getUserById({ uid: uid })
                .then((user) => {
                    let userData = user;
                    userData.createdDate = func.convertFirebaseDateFormat(userData.createdDate);
                    userData.modifiedDate = func.convertFirebaseDateFormat(userData.modifiedDate);
                    resolve(userData);
                })
                .catch((error) => {
                    reject(error);
                });
        } catch (error) {
            reject(error);
        }
    });
}

function getUserByAuthId({ uid }) {
    return new Promise((resolve, reject) => {
        try {
            authRepo
                .getUserByAuthId({ uid: uid })
                .then((user) => {
                    let userData = user;
                    userData.createdDate = func.convertFirebaseDateFormat(userData.createdDate);
                    userData.modifiedDate = func.convertFirebaseDateFormat(userData.modifiedDate);
                    resolve(userData);
                })
                .catch((error) => {
                    reject(error);
                });
        } catch (error) {
            reject(error);
        }
    });
}

function updateUser({ userId, updateUserList }) {
    return new Promise((resolve, reject) => {
        try {
            let list = [];
            updateUserList.forEach((user, index) => {
                user.modifiedDate = new Date();
                user.modifiedBy = userId;
                authRepo.updateUser({ user }).then((u) => {
                    list.push(u);
                    if (updateUserList.length - 1 === index) {
                        resolve(list);
                    }
                });
            });
        } catch (error) {
            reject(error);
        }
    });
}

function getTenantByUserId({ userId }) {
    return new Promise(async (resolve, reject) => {
        try {
            authRepo
                .getUserTenantAssoByUserId({ uid: userId })
                .then((userTenantAssoList) => {
                    let list = [];
                    if (userTenantAssoList.length === 0) {
                        resolve();
                    } else {
                        userTenantAssoList.forEach((t, index) => {
                            authRepo.getTenantById({ uid: t.tenantId }).then((tenant) => {
                                list.push(tenant);
                                if (userTenantAssoList.length - 1 === index) {
                                    resolve(list);
                                }
                            });
                        });
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

function createTenant({ userId, tenantList }) {
    return new Promise((resolve, reject) => {
        try {
            let list = [];
            tenantList.forEach(async (tenant, index) => {
                tenant.statusId = 1;
                tenant.createdBy = userId;
                tenant.modifiedBy = userId;
                tenant.createdDate = new Date();
                tenant.modifiedDate = new Date();

                authRepo.createTenant({ tenant: tenant }).then((t) => {
                    list.push(t);

                    if (tenantList.length - 1 === index) {
                        resolve(list);
                    }
                });
            });
        } catch (error) {
            reject(error);
        }
    });
}

function getAllRoles() {
    return new Promise((resolve, reject) => {
        try {
            authRepo.getAllRoles().then((list) => {
                resolve(list);
            });
        } catch (error) {
            reject(error);
        }
    });
}

function updateUserRoleAndTenant({ userId, updateList }) {
    return new Promise((resolve, reject) => {
        try {
            let updatedUserList = [];
            updateList.forEach(async (user, index) => {
                authRepo.getUserByEmail({ email: user.email }).then((u) => {
                    let userData = u;
                    userData.modifiedDate = new Date();
                    userData.modifiedBy = userId;
                    userData.roleId = user.roleId;
                    if (!userData.setting) {
                        userData.setting = {};
                    }
                    userData.setting.defaultTenantId = user.tenantId;

                    authRepo.updateUser({ user: userData }).then((uu) => {
                        updatedUserList.push(uu);
                        authRepo.getUserTenantAssoByUserIdAndTenantId({ uid: u.uid, tenantId: user.tenantId }).then(async (ut) => {
                            // only create the document when user is not associated to this tenant
                            if (ut.length === 0) {
                                let asso = {
                                    tenantId: user.tenantId,
                                    userId: u.uid,
                                    statusId: 1,
                                };
                                await authRepo.createUserTenantAsso({ asso: asso });
                            }

                            if (updateList.length - 1 === index) {
                                resolve(updatedUserList);
                            }
                        });
                    });
                });
            });
        } catch (error) {
            reject(error);
        }
    });
}

function getUserByTenantId({ tenantId }) {
    return new Promise(async (resolve, reject) => {
        try {
            const userTenantAssoList = await authRepo.getUserTenantAssoByTenantId({ tenantId });

            if (userTenantAssoList.length === 0) {
                return reject("No user found for this tenant.");
            }

            // Use `map` to create an array of Promises
            const userPromises = userTenantAssoList.map(async (u) => {
                const user = await authRepo.getUserById({ uid: u.userId });
                user.createdDate = func.convertFirebaseDateFormat(user.createdDate);
                user.modifiedDate = func.convertFirebaseDateFormat(user.modifiedDate);
                return user;
            });

            // Wait for all Promises to resolve
            const userList = await Promise.all(userPromises);

            resolve(userList);
        } catch (error) {
            reject(error);
        }
    });
}

function updateUserLastActive({ user }) {
    return new Promise((resolve, reject) => {
        try {
            user.lastActiveDateTime = new Date();

            authRepo.updateUser({ user }).then((u) => {
                user.lastActiveDateTime = func.convertFirebaseDateFormat(user.lastActiveDateTime);
                resolve(user);
            });
        } catch (error) {
            reject(error);
        }
    });
}

export {
    getAllUsers,
    createUser,
    getUserByEmail,
    getUserById,
    getUserByAuthId,
    updateUser,
    getTenantByUserId,
    createTenant,
    getAllRoles,
    updateUserRoleAndTenant,
    getUserByTenantId,
    updateUserLastActive,
};
