import * as firebase from "../configuration/firebase-admin.js";
import { supabase } from "../configuration/supabase.js";

const userCollectionName = "user";
const userSettingTableName = "userSetting";
const roleTable = "role";
const tenantCollectionName = "tenant";
const userTenantCollectionName = "userTenant";

function getAllUsers({ tenantId }) {
    // return firebase.auth.listUsers();
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase
                .from(userTenantCollectionName)
                .select(`user:${userCollectionName}(*)`) // get related user data
                .eq("tenantUid", tenantId); // filter by tenantId

            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            console.error("Error fetching all users:", error);
            reject(error);
        }
    });
}

function createUser({ user }) {
    return new Promise(async (resolve, reject) => {
        // let newRef = firebase.db.collection(userCollectionName).doc();
        // user.uid = newRef.id;
        // await newRef.set(user);
        // resolve(user);

        try {
            const { data, error } = await supabase.from(userCollectionName).insert(user).select("*");
            if (error) {
                reject(error);
            } else {
                resolve(data[0]);
            }
        } catch (error) {
            reject(error);
        }
    });
}

function getUserByEmail({ email }) {
    return new Promise(async (resolve, reject) => {
        // const snapshot = await firebase.db.collection(userCollectionName).where("email", "==", email).where("statusId", "==", 1).get();
        // if (snapshot.docs.length > 0) {
        //     const user = snapshot.docs[0].data()?.statusId == 1 ? snapshot.docs[0].data() : {};
        //     resolve(user);
        // } else {
        //     reject("User not found");
        // }

        try {
            const { data, error } = await supabase.from(userCollectionName).select("*").eq("email", email).eq("statusId", 1).single();

            if (error) {
                reject(error);
            } else if (data) {
                resolve(data);
            } else {
                reject("User not found at getUserByEmail");
            }
        } catch (error) {
            reject(error);
        }
    });
}

function getUserById({ uid }) {
    return new Promise(async (resolve, reject) => {
        // const snapshot = await firebase.db.collection(userCollectionName).doc(uid).get();
        // if (snapshot.data()?.statusId == 1) {
        //     resolve(snapshot.data());
        // } else {
        //     reject("User not found");
        // }

        try {
            const { data, error } = await supabase.from(userCollectionName).select("*").eq("uid", uid).eq("statusId", 1).single();

            if (error) {
                reject(error);
            } else if (data) {
                resolve(data);
            } else {
                reject("User not found at getUserById");
            }
        } catch (error) {
            reject(error);
        }
    });
}

function getUserByAuthId({ uid }) {
    return new Promise(async (resolve, reject) => {
        // const snapshot = await firebase.db.collection(userCollectionName).where("authUid", "==", uid).where("statusId", "==", 1).get();
        // if (snapshot.docs.length > 0) {
        //     const user = snapshot.docs[0].data()?.statusId == 1 ? snapshot.docs[0].data() : {};
        //     resolve(user);
        // } else {
        //     reject("User not found");
        // }

        try {
            const { data, error } = await supabase.from(userCollectionName).select("*").eq("authUid", uid).eq("statusId", 1).single();

            if (error) {
                if (!data) {
                    resolve(null);
                }
                reject(error);
            } else if (data) {
                resolve(data);
            } else {
                console.log(data);
                reject("User not found at getUserByAuthId");
            }
        } catch (error) {
            console.error("Error fetching user by auth ID:", error);
            reject(error);
        }
    });
}

function getUserSetting({ uid }) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.from(userSettingTableName).select("*").eq("userUid", uid).eq("statusId", 1).single();

            if (error) {
                reject(error);
            } else if (data) {
                resolve(data);
            } else {
                reject("User not found at getUserSetting");
            }
        } catch (error) {
            reject(error);
        }
    });
}

function updateUser({ user }) {
    return new Promise(async (resolve, reject) => {
        // let newRef = firebase.db.collection(userCollectionName).doc(user.uid);

        // const updatedUser = await newRef.update(user);

        // resolve(updatedUser);
        try {
            const { data, error } = await supabase.from(userCollectionName).update(user).eq("uid", user.uid).select("*").single();

            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            reject(error);
        }
    });
}

function createUserSetting({ userSetting }) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.from(userSettingTableName).insert(userSetting).select("*").single();

            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            reject(error);
        }
    });
}

function updateUserSetting({ userSetting }) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.from(userSettingTableName).update(userSetting).eq("userUid", userSetting.userUid).select("*").single();

            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            reject(error);
        }
    });
}

function getTenantById({ uid }) {
    return new Promise(async (resolve, reject) => {
        // let snapshot2 = await firebase.db.collection(tenantCollectionName).doc(uid).get();

        // resolve(snapshot2.data());

        try {
            const { data, error } = await supabase.from(tenantCollectionName).select("*").eq("uid", uid).single();

            if (error) {
                reject(error);
            } else if (data) {
                resolve(data);
            } else {
                reject("Tenant not found");
            }
        } catch (error) {
            reject(error);
        }
    });
}

function getUserTenantAssoByUserId({ uid }) {
    return new Promise(async (resolve, reject) => {
        // let snapshot2 = await firebase.db.collection(userTenantCollectionName).where("userId", "==", uid).where("statusId", "==", 1).get();
        // const userTenantAssoList = snapshot2.docs.map((doc) => doc.data());
        // resolve(userTenantAssoList);

        try {
            const { data, error } = await supabase.from(userTenantCollectionName).select("*").eq("userUid", uid).eq("statusId", 1);

            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            reject(error);
        }
    });
}

function getUserTenantAssoByUserIdAndTenantId({ uid, tenantId }) {
    return new Promise(async (resolve, reject) => {
        // let snapshot2 = await firebase.db.collection(userTenantCollectionName).where("userId", "==", uid).where("tenantId", "==", tenantId).where("statusId", "==", 1).get();
        // const userTenantAssoList = snapshot2.docs.map((doc) => doc.data());
        // resolve(userTenantAssoList);

        try {
            const { data, error } = await supabase.from(userTenantCollectionName).select("*").eq("userUid", uid).eq("tenantUid", tenantId).eq("statusId", 1).single();

            if (error) {
                reject(error);
            } else if (data) {
                resolve(data);
            } else {
                reject("User-Tenant association not found");
            }
        } catch (error) {
            reject(error);
        }
    });
}

function getUserTenantAssoByTenantId({ uid, tenantId }) {
    return new Promise(async (resolve, reject) => {
        // let snapshot2 = await firebase.db.collection(userTenantCollectionName).where("tenantId", "==", tenantId).where("statusId", "==", 1).get();
        // const userTenantAssoList = snapshot2.docs.map((doc) => doc.data());
        // resolve(userTenantAssoList);

        try {
            const { data, error } = await supabase.from(userTenantCollectionName).select("*").eq("tenantUid", tenantId).eq("statusId", 1);

            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            reject(error);
        }
    });
}

function createUserTenantAsso({ asso }) {
    return new Promise(async (resolve, reject) => {
        // let newRef = firebase.db.collection(userTenantCollectionName).doc();
        // asso.uid = newRef.id;
        // await newRef.set(asso);
        // resolve(asso);

        try {
            const { data, error } = await supabase.from(userTenantCollectionName).insert(asso).select("*").single();

            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            reject(error);
        }
    });
}

function createTenant({ tenant }) {
    return new Promise(async (resolve, reject) => {
        // let newRef = firebase.db.collection(tenantCollectionName).doc();
        // tenant.uid = newRef.id;
        // await newRef.set(tenant);
        // resolve(tenant);

        try {
            const { data, error } = await supabase.from(tenantCollectionName).insert(tenant).select("*").single();

            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            reject(error);
        }
    });
}

function getAllRoles() {
    return new Promise(async (resolve, reject) => {
        // let snapshot = await firebase.db.collection(roleCollectionName).where("statusId", "==", 1).get();

        // const list = snapshot.docs.map((doc) => doc.data());
        // resolve(list);

        try {
            const { data, error } = await supabase
                .from(roleTable)
                .select("*")
                .eq("statusId", 1)
                // .or(`tenantId.eq.${tenantId},tenantId.eq.${DEFAULT_SYSTEM_TENANT}`)
                .order("roleId");

            if (error) {
                if (!data) {
                    reject("Data not found");
                }
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            reject(error);
        }
    });
}

function getPermissionByUserId({ userUid, tenantId }) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.from("permission").select("*").eq("userUid", userUid).eq("tenantId", tenantId).eq("statusId", 1).order("module");

            if (error) {
                reject(error);
            }
            if (data && data.length > 0) {
                resolve(data);
            } else {
                reject("Permission not found for the user and tenant");
            }
        } catch (error) {
            console.error("Error fetching permission by user ID:", error);
            reject(error);
        }
    });
}

function createPermission({ permission }) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.from("permission").insert(permission).select("*").single();
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            console.error("Error creating permission:", error);
            reject(error);
        }
    });
}

function updatePermission({ permission }) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase
                .from("permission")
                .update(permission)
                .eq("userUid", permission.userUid)
                .eq("tenantId", permission.tenantId)
                .eq("module", permission.module)
                .eq("statusId", 1)
                .select("*")
                .single();

            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            // console.error("Error updating permission:", error);
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
    createUserSetting,
    getUserSetting,
    updateUser,
    getTenantById,
    getUserTenantAssoByUserId,
    getUserTenantAssoByUserIdAndTenantId,
    getUserTenantAssoByTenantId,
    createUserTenantAsso,
    createTenant,
    getAllRoles,
    updateUserSetting,
    getPermissionByUserId,
    createPermission,
    updatePermission,
};
