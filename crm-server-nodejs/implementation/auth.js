import * as authRepo from "../repository/auth.repository.js";
import * as tokenRepo from "../repository/token.repository.js";
import * as func from "../shared/function.js";
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
                        createdDateTime: new Date().toISOString(),
                        modifiedDateTime: new Date().toISOString(),
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
                    t.modifiedDateTime = new Date().toISOString();
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
};
