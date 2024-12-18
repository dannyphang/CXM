import { Router } from "express";
import express from "express";
const router = Router();
import * as firebase from "../firebase-admin.js";
import pkg from "firebase-admin";
const { auth } = pkg;
import * as func from "../shared/function.js";

router.use(express.json());

const userCollectionName = "user";
const roleCollectionName = "role";
const tenantCollectionName = "tenant";
const userTenantCollectionName = "userTenantAsso";

const listAllUsers = async (nextPageToken) => {
    try {
        const listUsersResult = await auth(firebase.default.app).listUsers(1000, nextPageToken);
        if (listUsersResult.pageToken) {
            // List next batch of users.
            listAllUsers(listUsersResult.pageToken);
        }
    } catch (error) {
        console.log("Error listing users:", error);
    }
};

router.get("/allUser", async (req, res) => {
    try {
        let list = await firebase.default.auth.listUsers();
        res.status(200).json(list);
    } catch (error) {
        console.log("Error listing users:", error);
    }
});

// create user in firestore
router.post("/user", async (req, res) => {
    const list = JSON.parse(JSON.stringify(func.body(req).data.user));

    try {
        const createDoc = [];

        list.forEach(async (user, index) => {
            let newRef = firebase.default.db.collection(userCollectionName).doc(user.uid);
            user.uid = newRef.id;
            user.statusId = 1;
            user.createdBy = func.body(req).userId;
            user.modifiedBy = func.body(req).userId;
            user.createdDate = new Date();
            user.modifiedDate = new Date();

            createDoc.push(user);

            await newRef.set(user);
            if (index === list.length - 1) {
                res.status(200).json(
                    func.responseModel({
                        data: createDoc,
                        responseMessage: `Created ${list.length} record(s) successfully.`,
                    })
                );
            }
        });
    } catch (error) {
        console.log(error);
        res.status(400).json(
            func.responseModel({
                isSuccess: false,
                responseMessage: error,
            })
        );
    }
});

// get user by email
router.get("/user/email", async (req, res) => {
    const email = func.body(req).headers.email;

    try {
        const snapshot = await firebase.default.db.collection(userCollectionName).where("email", "==", email).where("statusId", "==", 1).get();

        if (snapshot.docs.length > 0) {
            const user = snapshot.docs[0].data()?.statusId == 1 ? snapshot.docs[0].data() : {};
            let userData = user;
            userData.createdDate = convertFirebaseDateFormat(userData.createdDate);
            userData.modifiedDate = convertFirebaseDateFormat(userData.modifiedDate);

            res.status(200).json(func.responseModel({ data: userData }));
        } else {
            res.status(400).json(
                func.responseModel({
                    isSuccess: false,
                    responseMessage: "User not found",
                })
            );
        }
    } catch (error) {
        console.log("error", error);
        res.status(400).json(
            func.responseModel({
                isSuccess: false,
                responseMessage: error,
            })
        );
    }
});

// get user by id
router.get("/user/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const snapshot = await firebase.default.db.collection(userCollectionName).doc(id).get();

        if (snapshot.data()) {
            const user = snapshot.data()?.statusId == 1 ? snapshot.data() : {};
            let userData = user;
            userData.createdDate = convertFirebaseDateFormat(userData.createdDate);
            userData.modifiedDate = convertFirebaseDateFormat(userData.modifiedDate);

            res.status(200).json(func.responseModel({ data: userData }));
        } else {
            // console.log(snapshot.data());
            res.status(400).json(
                func.responseModel({
                    isSuccess: false,
                    responseMessage: "User not found",
                })
            );
        }
    } catch (error) {
        console.log("error", error);
        res.status(400).json(
            func.responseModel({
                isSuccess: false,
                responseMessage: error,
            })
        );
    }
});

// update user
router.put("/user/update", async (req, res) => {
    const userList = func.body(req).data.user;

    try {
        let updatedUserList = [];

        userList.forEach(async (user, index) => {
            user.modifiedDate = new Date();

            let newRef = firebase.default.db.collection(userCollectionName).doc(user.uid);

            user.modifiedBy = func.body(req).userId;

            const updatedUser = await newRef.update(user);
            updatedUserList.push(updatedUser);
        });

        res.status(200).json(func.responseModel({ data: `Updated ${updatedUserList.length} record(s).` }));
    } catch (error) {
        console.log("error", error);
        res.status(400).json(
            func.responseModel({
                isSuccess: false,
                responseMessage: error,
            })
        );
    }
});

// get all tenant by userId
router.get("/tenant/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const snapshot = await firebase.default.db.collection(userTenantCollectionName).where("userId", "==", id).where("statusId", "==", 1).get();

        const userTenantAssoList = snapshot.docs.map((doc) => doc.data());
        let list = [];

        userTenantAssoList.forEach(async (t, index) => {
            let snapshot2 = await firebase.default.db.collection(tenantCollectionName).doc(t.tenantId).get();

            list.push(snapshot2.data());

            if (index === userTenantAssoList.length - 1) {
                res.status(200).json(func.responseModel({ data: list }));
            }
        });

        if (userTenantAssoList.length === 0) {
            res.status(200).json(func.responseModel({ responseMessage: "No tenant records." }));
        }
    } catch (error) {
        console.log("error", error);
        res.status(400).json(
            func.responseModel({
                isSuccess: false,
                responseMessage: error,
            })
        );
    }
});

// create tenant
router.post("/tenant/create", async (req, res) => {
    const list = JSON.parse(JSON.stringify(func.body(req).data.tenant));

    try {
        const createDoc = [];

        list.forEach(async (user, index) => {
            let newRef = firebase.default.db.collection(tenantCollectionName).doc();
            user.uid = newRef.id;
            user.statusId = 1;
            user.createdBy = func.body(req).userId;
            user.modifiedBy = func.body(req).userId;
            user.createdDate = new Date();
            user.modifiedDate = new Date();

            createDoc.push(user);

            await newRef.set(user);
            if (index === list.length - 1) {
                res.status(200).json(
                    func.responseModel({
                        data: createDoc,
                        responseMessage: `Created ${list.length} record(s) successfully.`,
                    })
                );
            }
        });
    } catch (error) {
        console.log(error);
        res.status(400).json(
            func.responseModel({
                isSuccess: false,
                responseMessage: error,
            })
        );
    }
});

// get all roles
router.get("/role", async (req, res) => {
    try {
        let snapshot = await firebase.default.db.collection(roleCollectionName).where("statusId", "==", 1).get();

        const list = snapshot.docs.map((doc) => doc.data());

        res.status(200).json(func.responseModel({ data: list }));
    } catch (error) {
        console.log("error", error);
        res.status(400).json(
            func.responseModel({
                isSuccess: false,
                responseMessage: error,
            })
        );
    }
});

// update user role and tenant
router.put("/userRole/update", async (req, res) => {
    const updateList = func.body(req).data.updateList;

    try {
        let updatedUserList = [];

        updateList.forEach(async (u, index) => {
            const snapshot = await firebase.default.db.collection(userCollectionName).where("email", "==", u.email).where("statusId", "==", 1).where("tenantId", "==", func.body(req).tenantId).get();

            if (snapshot.docs.length > 0) {
                let user = snapshot.docs[0].data()?.statusId == 1 ? snapshot.docs[0].data() : {};
                user.modifiedDate = new Date();
                user.modifiedBy = func.body(req).userId;
                user.roleId = u.roleId;
                user.defaultTenantId = u.tenantId;

                let newRef = firebase.default.db.collection(userCollectionName).doc(user.uid);
                const updatedUser = await newRef.update(user);
                updatedUserList.push(updatedUser);

                // create tenant user asso
                const snapshot2 = await firebase.default.db.collection(userTenantCollectionName).where("userId", "==", user.uid).where("tenantId", "==", u.tenantId).where("statusId", "==", 1).get();

                // only create the document when user is not associated to this tenant
                if (snapshot2.docs.length === 0) {
                    let newRef = firebase.default.db.collection(userTenantCollectionName).doc();
                    await newRef.set({
                        uid: newRef.id,
                        tenantId: u.tenantId,
                        userId: user.uid,
                        statusId: 1,
                    });
                }

                if (index == updateList.length - 1) {
                    res.status(200).json(func.responseModel({ responseMessage: `Updated ${updatedUserList.length} record(s).` }));
                }
            } else {
                res.status(400).json(
                    func.responseModel({
                        isSuccess: false,
                        responseMessage: "User not found",
                    })
                );
            }
        });
    } catch (error) {
        console.log("error", error);
        res.status(400).json(
            func.responseModel({
                isSuccess: false,
                responseMessage: error,
            })
        );
    }
});

function convertFirebaseDateFormat(date) {
    return date.toDate();
}

export default router;
