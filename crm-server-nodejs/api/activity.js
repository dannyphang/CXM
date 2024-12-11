import { Router } from "express";
import express from "express";
const router = Router();
import * as db from "../firebase-admin.js";
import { Filter } from "firebase-admin/firestore";
import responseModel from "../shared/function.js";

router.use(express.json());

const activityCollection = "activity";
const attachmentCollection = "attachment";
const moduleCodeCollection = "moduleCode";

// get all activities
router.get("/", async (req, res) => {
    try {
        const snapshot = await db.default.db.collection(activityCollection).where("statusId", "==", 1).orderBy("modifiedDate", "desc").get();

        const list = snapshot.docs.map((doc) => doc.data());

        if (list.length > 0) {
            for (let i = 0; i < list.length; i++) {
                list[i].activityDatetime = convertFirebaseDateFormat(list[i].activityDatetime);
                list[i].createdDate = convertFirebaseDateFormat(list[i].createdDate);
                list[i].modifiedDate = convertFirebaseDateFormat(list[i].modifiedDate);

                const snapshot2 = await db.default.db.collection(attachmentCollection).where("activityUid", "==", list[i].uid).where("statusId", "==", 1).get();
                const attachmentList = snapshot2.docs.map((doc) => doc.data());

                list[i].attachmentList = attachmentList;

                // return status at the last loop
                if (i === list.length - 1) {
                    res.status(200).json(responseModel({ data: list }));
                }
            }
        } else {
            res.status(200).json(responseModel({ data: list }));
        }
    } catch (error) {
        console.log("error", error);
        responseModel({
            isSuccess: false,
            responseMessage: error,
        });
    }
});

// get all activities by profile id
router.post("/getActivitiesByProfileId", async (req, res) => {
    let profileUid = req.body.profileUid;

    try {
        const snapshot = await db.default.db
            .collection(activityCollection)
            .where("statusId", "==", 1)
            .where(
                Filter.or(
                    Filter.where("activityContactedIdList", "array-contains", profileUid),
                    Filter.where("associationContactUidList", "array-contains", profileUid),
                    Filter.where("associationCompanyUidList", "array-contains", profileUid)
                )
            )
            .orderBy("modifiedDate", "desc")
            .get();
        const list = snapshot.docs.map((doc) => doc.data());

        res.status(200).json(responseModel({ data: list }));
    } catch (error) {
        console.log("error", error);
        responseModel({
            isSuccess: false,
            responseMessage: error,
        });
    }
});

// get all activities code by module code
router.get("/activityModule", async (req, res) => {
    try {
        const snapshot = await db.default.db.collection(moduleCodeCollection).where("moduleType", "==", "ACTIVITY_TYPE").where("statusId", "==", 1).orderBy("moduleId").get();
        const actCtrSnapshot = await db.default.db.collection(moduleCodeCollection).where("moduleType", "==", "ACTIVITY_CONTROL").where("statusId", "==", 1).orderBy("moduleId").get();
        const subActCtrSnapshot = await db.default.db.collection(moduleCodeCollection).where("moduleType", "==", "SUB_ACTIVITY_CONTROL").where("statusId", "==", 1).get();

        const activityModuleList = snapshot.docs.map((doc) => doc.data());
        const activityControlList = actCtrSnapshot.docs.map((doc) => doc.data());
        const subActivityControlList = subActCtrSnapshot.docs.map((doc) => doc.data());

        activityControlList.forEach((item) => {
            item.subActivityControl = [];
            subActivityControlList.forEach((subItem) => {
                if (item.moduleCode === subItem.moduleSubCode) {
                    item.subActivityControl.push(subItem);
                }
            });
        });

        activityModuleList.sort((a, b) => {
            return a.moduleId - b.moduleId;
        });

        activityControlList.sort((a, b) => {
            return a.moduleId - b.moduleId;
        });

        res.status(200).json(
            responseModel({
                data: {
                    activityModuleList,
                    activityControlList,
                },
            })
        );
    } catch (error) {
        console.log("error", error);
        responseModel({
            isSuccess: false,
            responseMessage: error,
        });
    }
});

// create activity
router.post("/", async (req, res) => {
    try {
        const list = JSON.parse(JSON.stringify(req.body.createdActivitiesList));
        const createDoc = [];

        list.forEach(async (prop) => {
            let newRef = db.default.db.collection(activityCollection).doc();
            prop.uid = newRef.id;
            prop.createdDate = new Date();
            prop.modifiedDate = new Date();
            prop.statusId = 1;

            createDoc.push(prop);

            await newRef.set(prop);
        });
        res.status(200).json(responseModel({ data: list }));
    } catch (error) {
        console.log(error);
        responseModel({
            isSuccess: false,
            responseMessage: error,
        });
    }
});

// upload attachment to activity
router.post("/upload", async (req, res) => {
    try {
        const list = JSON.parse(JSON.stringify(req.body.attachmentList));
        const createDoc = [];

        list.forEach(async (prop) => {
            let newRef = db.default.db.collection(attachmentCollection).doc();
            prop.uid = newRef.id;
            prop.createdDate = new Date();
            prop.modifiedDate = new Date();
            prop.statusId = 1;

            createDoc.push(prop);

            await newRef.set(prop).doc(prop.uid);
        });
        res.status(200).json(responseModel({ data: list }));
    } catch (error) {
        console.log(error);
        responseModel({
            isSuccess: false,
            responseMessage: error,
        });
    }
});

// delete activity (update status to 2)
router.delete("/:uid", async (req, res) => {
    try {
        const uid = req.params.uid;
        let actRef = db.default.db.collection(activityCollection).doc(uid);

        await actRef.update({
            statusId: 2,
            modifiedDate: new Date(),
            modifiedBy: req.body.user ?? "",
        });

        res.status(200).json(
            responseModel({
                data: {
                    uid: uid,
                },
            })
        );
    } catch (error) {
        console.log(error);
        responseModel({
            isSuccess: false,
            responseMessage: error,
        });
    }
});

// update activity
router.put("/:uid", async (req, res) => {
    try {
        const uid = req.params.uid;
        let updateBody = req.body;

        updateBody.modifiedDate = new Date();

        let actRef = db.default.db.collection(activityCollection).doc(uid);

        const updatedContact = await actRef.update(updateBody);

        res.status(200).json(responseModel({ data: updatedContact }));
    } catch (error) {
        console.log(error);
        responseModel({
            isSuccess: false,
            responseMessage: error,
        });
    }
});

function convertFirebaseDateFormat(date) {
    try {
        return date ? date.toDate() : date;
    } catch {
        return date;
    }
}

export default router;
