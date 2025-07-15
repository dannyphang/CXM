import * as authRepo from "../repository/auth.repository.js";
import * as tokenRepo from "../repository/token.repository.js";
import * as func from "../shared/function.js";
import * as constant from "../shared/constant.js";
import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js";
import * as config from "../configuration/config.js";
import * as envConfig from "../configuration/envConfig.js";

function getAllUsers() {
    return new Promise((resolve, reject) => {
        authRepo.getAllUsers().then((list) => {
            resolve(list);
        });
    });
}

function createUser({ userId, tenantId, createUserList }) {
    return new Promise(async (resolve, reject) => {
        try {
            let userList = await Promise.all(
                createUserList.map(async (user) => {
                    let { setting, ...userData } = user;
                    userData.createdBy = userId;
                    userData.modifiedBy = userId;

                    let userSetting = {
                        ...setting,
                        tableFilter: JSON.stringify(setting?.tableFilter),
                    };
                    userSetting.userUid = userData.uid;

                    let createdUser = await authRepo.createUser({ user: userData });

                    // create user permission
                    await createPermission({
                        userId: userId,
                        tenantId: tenantId,
                        newUserUid: createdUser.uid,
                    });

                    userSetting.userUid = createdUser.uid;
                    await authRepo.createUserSetting({ userSetting: userSetting });
                    let asso = {
                        tenantUid: tenantId,
                        userUid: createdUser.uid,
                        statusId: 1, // Assuming 1 means active
                    };
                    await authRepo.createUserTenantAsso({ asso: asso });

                    return;
                })
            );
            resolve(userList);
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

function getUserByAuthId({ uid, email }) {
    return new Promise((resolve, reject) => {
        try {
            authRepo
                .getUserByAuthId({ uid: uid })
                .then(async (user) => {
                    if (user) {
                        let userData = user;
                        user.setting = await getUserSetting({ uid: user.uid });
                        resolve(userData);
                    } else {
                        let tempUser = await getUserByEmail({ email });
                        tempUser.authUid = uid;

                        let userSetting = await authRepo.getUserSetting({ uid: tempUser.uid });
                        tempUser.setting = {
                            ...userSetting,
                            tableFilter: JSON.parse(userSetting.tableFilter),
                        };

                        resolve(await updateUser({ userId: tempUser.uid, updateUserList: [tempUser] }));
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

function getUserSetting({ uid }) {
    return new Promise((resolve, reject) => {
        try {
            authRepo
                .getUserSetting({ uid: uid })
                .then((setting) => {
                    let settingData = {
                        ...setting,
                        tableFilter: JSON.parse(setting.tableFilter),
                    };
                    resolve(settingData);
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
    return new Promise(async (resolve, reject) => {
        try {
            let updatedUserList = await Promise.all(
                updateUserList.map(async (user) => {
                    let { setting, ...userData } = user;
                    userData.modifiedDate = new Date().toISOString();
                    userData.modifiedBy = userId;

                    let userSetting = {
                        ...setting,
                        tableFilter: JSON.stringify(setting?.tableFilter),
                    };
                    userSetting.userUid = userData.uid;
                    await authRepo.updateUserSetting({
                        userSetting: userSetting,
                    });
                    return authRepo.updateUser({ user: userData });
                })
            );
            resolve(updatedUserList);
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
                .then(async (userTenantAssoList) => {
                    let tenantPromises = await Promise.all(
                        userTenantAssoList.map(async (asso) => {
                            return await authRepo.getTenantById({ uid: asso.tenantUid });
                        })
                    );
                    resolve(tenantPromises);
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
                const user = await authRepo.getUserById({ uid: u.userUid });
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
                resolve(user);
            });
        } catch (error) {
            reject(error);
        }
    });
}

function sentVerifyEmail({ user }) {
    return new Promise(async (resolve, reject) => {
        try {
            const token = func.generateToken(32);
            const verifyEmailUrl = `${envConfig.baseUrl}/auth/verify-email?token=${token}&email=${user.email}&uid=${user.uid}`;

            // send email
            const mailgun = new Mailgun(FormData);

            const mg = mailgun.client({
                username: "api",
                key: config.default.mailgun.apiKey,
            });

            tokenRepo
                .createToken({
                    token: {
                        email: user.email,
                        module: "email-verification",
                        accessToken: token,
                        statusId: 1,
                        createdDate: new Date().toISOString(),
                        modifiedDate: new Date().toISOString(),
                    },
                })
                .then((_) => {
                    mg.messages
                        .create(config.default.mailgun.domain, {
                            from: `CRM <noreply@${config.default.mailgun.domain}>`,
                            to: user.email,
                            subject: "Verify your email",
                            template: "email confirmation",
                            "h:X-Mailgun-Variables": JSON.stringify({
                                username: user.displayName,
                                confirmationLink: verifyEmailUrl,
                            }),
                        })
                        .then((msg) => {
                            resolve(msg);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                })
                .catch((error) => {
                    console.error("Error creating token:", error);
                    reject(error);
                });
        } catch (error) {
            reject(error);
        }
    });
}

function verifyEmail({ token, email, uid }) {
    return new Promise((resolve, reject) => {
        try {
            tokenRepo
                .getTokenByEmail({ email: email, module: "email-verification" })
                .then((t) => {
                    if (!t || t.accessToken !== token) {
                        reject("Invalid or expired token.");
                    }

                    // Update the token status to inactive
                    t.statusId = 2; // Assuming 0 means inactive
                    t.modifiedDate = new Date().toISOString();
                    tokenRepo
                        .updateToken({ token: t })
                        .then(() => {
                            // Update user email verified status
                            authRepo
                                .updateUser({
                                    user: {
                                        uid: uid,
                                        emailVerified: 1,
                                        modifiedDate: new Date(),
                                    },
                                })
                                .then(() => {
                                    resolve("Email verified successfully.");
                                })
                                .catch((error) => {
                                    console.log("Error updating user:", error);
                                    reject(error);
                                });
                        })
                        .catch((error) => {
                            console.error("Error updating token:", error);
                            reject(error);
                        });
                })
                .catch((error) => {
                    console.error("Error retrieving token:", error);
                    reject("Token not found or invalid.");
                });
        } catch (error) {
            console.error("Error verifying email:", error);
            reject(error);
        }
    });
}

function getPermissionByUserId({ userUid, tenantId }) {
    return new Promise((resolve, reject) => {
        try {
            authRepo
                .getPermissionByUserId({ userUid: userUid, tenantId: tenantId })
                .then((permissionList) => {
                    if (!permissionList) {
                        return reject("Permission not found for this user.");
                    }

                    const result = permissionList.map((permit) => {
                        // Convert field array to single object
                        const permissions = constant.USER_PERMISSION_FIELD.reduce((acc, field) => {
                            acc[field] = permit[field];
                            return acc;
                        }, {});

                        return {
                            module: permit.module,
                            permission: permissions,
                        };
                    });

                    resolve(result);
                })
                .catch((error) => {
                    console.error("Error retrieving permission:", error);
                    reject(error);
                });
        } catch (error) {
            console.error("Error in getPermissionByUserId:", error);
            reject(error);
        }
    });
}

function createPermission({ userId, tenantId, newUserUid }) {
    return new Promise(async (resolve, reject) => {
        try {
            let permissionAsync = await Promise.all(
                constant.USER_PERMISSION_MODULE.map(async (permission) => {
                    let p = {
                        userUid: newUserUid,
                        module: permission,
                        tenantId: tenantId,
                        createdBy: userId,
                        modifiedBy: userId,
                    };
                    return authRepo.createPermission({ permission: p });
                })
            );

            resolve(permissionAsync);
        } catch (error) {
            console.error("Error creating permission:", error);
            reject(error);
        }
    });
}

function updatePermission({ userId, tenantId, userUid, permissionList }) {
    return new Promise(async (resolve, reject) => {
        try {
            let updatedPermissionList = await Promise.all(
                permissionList.map(async (permission) => {
                    let p = {
                        userUid: userUid,
                        module: permission.module,
                        tenantId: tenantId,
                        statusId: permission.statusId,
                        modifiedBy: userId,
                    };

                    constant.USER_PERMISSION_FIELD.forEach((field) => {
                        console.log("field", field);
                        p[field] = permission.permission[field];
                    });

                    console.log(p);
                    return authRepo.updatePermission({ permission: p });
                })
            );

            resolve(updatedPermissionList);
        } catch (error) {
            console.error("Error updating permission:", error);
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
    sentVerifyEmail,
    verifyEmail,
    getPermissionByUserId,
    createPermission,
    updatePermission,
};
