import * as firebase from "../configuration/firebase-admin.js";

const userCollectionName = "user";
const roleCollectionName = "role";
const tenantCollectionName = "tenant";
const userTenantCollectionName = "userTenantAsso";

function getAllUsers() {
  return firebase.auth.listUsers();
}

function createUser({ user }) {
  return new Promise(async (resolve, reject) => {
    let newRef = firebase.db.collection(userCollectionName).doc(user.uid);
    user.uid = newRef.id;
    await newRef.set(user);
    resolve(user);
  });
}

function getUserByEmail({ email }) {
  return new Promise(async (resolve, reject) => {
    const snapshot = await firebase.db
      .collection(userCollectionName)
      .where("email", "==", email)
      .where("statusId", "==", 1)
      .get();
    if (snapshot.docs.length > 0) {
      const user = snapshot.docs[0].data()?.statusId == 1 ? snapshot.docs[0].data() : {};
      resolve(user);
    } else {
      reject("User not found");
    }
  });
}

function getUserById({ uid }) {
  return new Promise(async (resolve, reject) => {
    const snapshot = await firebase.db.collection(userCollectionName).doc(uid).get();
    if (snapshot.data()?.statusId == 1) {
      resolve(snapshot.data());
    } else {
      reject("User not found");
    }
  });
}

function getUserByAuthId({ uid }) {
  return new Promise(async (resolve, reject) => {
    const snapshot = await firebase.db
      .collection(userCollectionName)
      .where("authUid", "==", uid)
      .where("statusId", "==", 1)
      .get();
    if (snapshot.docs.length > 0) {
      const user = snapshot.docs[0].data()?.statusId == 1 ? snapshot.docs[0].data() : {};
      resolve(user);
    } else {
      reject("User not found");
    }
  });
}

function updateUser({ user }) {
  return new Promise(async (resolve, reject) => {
    let newRef = firebase.db.collection(userCollectionName).doc(user.uid);

    const updatedUser = await newRef.update(user);

    resolve(updatedUser);
  });
}

function getTenantById({ uid }) {
  return new Promise(async (resolve, reject) => {
    let snapshot2 = await firebase.db.collection(tenantCollectionName).doc(uid).get();

    resolve(snapshot2.data());
  });
}

function getUserTenantAssoByUserId({ uid }) {
  return new Promise(async (resolve, reject) => {
    let snapshot2 = await firebase.db
      .collection(userTenantCollectionName)
      .where("userId", "==", uid)
      .where("statusId", "==", 1)
      .get();
    const userTenantAssoList = snapshot2.docs.map((doc) => doc.data());
    resolve(userTenantAssoList);
  });
}

function getUserTenantAssoByUserIdAndTenantId({ uid, tenantId }) {
  return new Promise(async (resolve, reject) => {
    let snapshot2 = await firebase.db
      .collection(userTenantCollectionName)
      .where("userId", "==", uid)
      .where("tenantId", "==", tenantId)
      .where("statusId", "==", 1)
      .get();
    const userTenantAssoList = snapshot2.docs.map((doc) => doc.data());
    resolve(userTenantAssoList);
  });
}

function getUserTenantAssoByTenantId({ uid, tenantId }) {
  return new Promise(async (resolve, reject) => {
    let snapshot2 = await firebase.db
      .collection(userTenantCollectionName)
      .where("tenantId", "==", tenantId)
      .where("statusId", "==", 1)
      .get();
    const userTenantAssoList = snapshot2.docs.map((doc) => doc.data());
    resolve(userTenantAssoList);
  });
}

function createUserTenantAsso({ asso }) {
  return new Promise(async (resolve, reject) => {
    let newRef = firebase.db.collection(userTenantCollectionName).doc();
    asso.uid = newRef.id;
    await newRef.set(asso);
    resolve(asso);
  });
}

function createTenant({ tenant }) {
  return new Promise(async (resolve, reject) => {
    let newRef = firebase.db.collection(tenantCollectionName).doc();
    tenant.uid = newRef.id;
    await newRef.set(tenant);
    resolve(tenant);
  });
}

function getAllRoles() {
  return new Promise(async (resolve, reject) => {
    let snapshot = await firebase.db
      .collection(roleCollectionName)
      .where("statusId", "==", 1)
      .get();

    const list = snapshot.docs.map((doc) => doc.data());
    resolve(list);
  });
}

export {
  getAllUsers,
  createUser,
  getUserByEmail,
  getUserById,
  getUserByAuthId,
  updateUser,
  getTenantById,
  getUserTenantAssoByUserId,
  getUserTenantAssoByUserIdAndTenantId,
  getUserTenantAssoByTenantId,
  createUserTenantAsso,
  createTenant,
  getAllRoles,
};
