import { Router } from "express";
import express from "express";
const router = Router();
import * as db from "../firebase-admin.js";
import { Filter } from "firebase-admin/firestore";
import * as func from "../shared/function.js";
import emailjs from "@emailjs/nodejs";
import config from "../config.js";

router.use(express.json());

const activityCollection = "activity";
const contactCollection = "contact";
const companyCollection = "company";
const attachmentCollection = "attachment";
const moduleCodeCollection = "moduleCode";

// get all activities
router.get("/", async (req, res) => {
    try {
        const snapshot = await db.default.db.collection(activityCollection).where("statusId", "==", 1).where("tenantId", "==", func.body(req).tenantId).orderBy("modifiedDate", "desc").get();

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
                    res.status(200).json(func.responseModel({ data: list }));
                }
            }
        } else {
            res.status(200).json(func.responseModel({ data: list }));
        }
    } catch (error) {
        console.log("error", error);
        func.responseModel({
            isSuccess: false,
            responseMessage: error,
        });
    }
});

// get all activities by profile id
router.post("/getActivitiesByProfileId", async (req, res) => {
    try {
        let profileUid = func.body(req).data.profileUid;

        const snapshot = await db.default.db
            .collection(activityCollection)
            .where(
                Filter.or(
                    Filter.where("activityContactedIdList", "array-contains", profileUid),
                    Filter.where("associationContactUidList", "array-contains", profileUid),
                    Filter.where("associationCompanyUidList", "array-contains", profileUid)
                )
            )
            .where("statusId", "==", 1)
            .where("tenantId", "==", func.body(req).tenantId)
            .orderBy("modifiedDate", "desc")
            .get();

        const list = snapshot.docs.map((doc) => doc.data());

        if (list.length > 0) {
            // Process all activities with Promise.all
            await Promise.all(
                list.map(async (act) => {
                    act.createdDate = convertFirebaseDateFormat(act.createdDate);
                    act.modifiedDate = convertFirebaseDateFormat(act.modifiedDate);
                    act.association = {
                        companyList: [],
                        contactList: [],
                    };

                    // Fetch company details
                    const companyPromises = act.associationCompanyUidList?.map(async (uid) => {
                        const ss = await db.default.db.collection(companyCollection).doc(uid).get();
                        return ss.data()?.statusId == 1 ? ss.data() : {};
                    });
                    if (companyPromises) {
                        act.association.companyList = await Promise.all(companyPromises);
                    }

                    // Fetch contact details
                    const contactPromises = act.associationContactUidList?.map(async (uid) => {
                        const ss = await db.default.db.collection(contactCollection).doc(uid).get();
                        return ss.data()?.statusId == 1 ? ss.data() : {};
                    });
                    if (contactPromises) {
                        act.association.contactList = await Promise.all(contactPromises);
                    }

                    // Fetch attachment list
                    if (act.attachmentUid && act.attachmentUid.length > 0) {
                        const attachmentPromises = act.attachmentUid?.map(async (uid) => {
                            const ss = await db.default.db.collection(attachmentCollection).doc(uid).get();
                            return ss.data()?.statusId == 1 ? ss.data() : {};
                        });
                        if (attachmentPromises) {
                            act.attachmentList = await Promise.all(attachmentPromises);
                        }
                    }
                })
            );

            res.status(200).json(func.responseModel({ data: list }));
        } else {
            res.status(200).json(func.responseModel({ data: list }));
        }
    } catch (error) {
        console.log("error", error);
        res.status(500).json(
            func.responseModel({
                isSuccess: false,
                responseMessage: error.message || "An error occurred.",
            })
        );
    }
});

// get all activities code by module code
router.get("/activityModule", async (req, res) => {
    try {
        const snapshot = await db.default.db.collection(moduleCodeCollection).where("moduleType", "==", "ACTIVITY_TYPE").where("statusId", "==", 1).orderBy("moduleId").get();
        const subModuleSnapshot = await db.default.db.collection(moduleCodeCollection).where("moduleType", "==", "SUB_ACTIVITY_TYPE").where("statusId", "==", 1).orderBy("moduleId").get();
        const actCtrSnapshot = await db.default.db.collection(moduleCodeCollection).where("moduleType", "==", "ACTIVITY_CONTROL").where("statusId", "==", 1).orderBy("moduleId").get();
        const subActCtrSnapshot = await db.default.db.collection(moduleCodeCollection).where("moduleType", "==", "SUB_ACTIVITY_CONTROL").where("statusId", "==", 1).get();

        const activityModuleList = snapshot.docs.map((doc) => doc.data());
        const subActivityModuleList = subModuleSnapshot.docs.map((doc) => doc.data());
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

        res.status(200).json(
            func.responseModel({
                data: {
                    activityModuleList,
                    activityControlList,
                    subActivityModuleList,
                },
            })
        );
    } catch (error) {
        console.log("error", error);
        func.responseModel({
            isSuccess: false,
            responseMessage: error,
        });
    }
});

// create activity
router.post("/", async (req, res) => {
    try {
        const list = JSON.parse(JSON.stringify(func.body(req).data.createdActivitiesList));
        const tenantId = func.body(req).tenantId;
        const createDoc = [];

        list.forEach(async (prop) => {
            let newRef = db.default.db.collection(activityCollection).doc();
            prop.uid = newRef.id;
            prop.createdDate = new Date();
            prop.modifiedDate = new Date();
            prop.statusId = 1;
            prop.tenantId = tenantId;

            createDoc.push(prop);

            await newRef.set(prop);
        });
        res.status(200).json(func.responseModel({ data: list }));
    } catch (error) {
        console.log(error);
        func.responseModel({
            isSuccess: false,
            responseMessage: error,
        });
    }
});

// upload attachment to activity
router.post("/upload", async (req, res) => {
    try {
        const list = JSON.parse(JSON.stringify(func.body(req).data.attachmentList));
        const createDoc = [];

        list.forEach(async (prop) => {
            let newRef = db.default.db.collection(attachmentCollection).doc();
            prop.uid = newRef.id;
            prop.createdDate = new Date();
            prop.modifiedDate = new Date();
            prop.statusId = 1;

            createDoc.push(prop);

            await newRef.set(prop);
        });
        res.status(200).json(func.responseModel({ data: list }));
    } catch (error) {
        console.log(error);
        func.responseModel({
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
            modifiedBy: func.body(req).data.user ?? "",
        });

        res.status(200).json(
            func.responseModel({
                data: {
                    uid: uid,
                },
            })
        );
    } catch (error) {
        console.log(error);
        func.responseModel({
            isSuccess: false,
            responseMessage: error,
        });
    }
});

// update activity
router.put("/:uid", async (req, res) => {
    try {
        const uid = req.params.uid;
        let updateBody = func.body(req).data.updateActivity;

        updateBody.modifiedDate = new Date();

        let actRef = db.default.db.collection(activityCollection).doc(uid);

        const updatedContact = await actRef.update(updateBody);

        res.status(200).json(func.responseModel({ data: updatedContact }));
    } catch (error) {
        console.log(error);
        func.responseModel({
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

router.post("/email", async (req, res) => {
    try {
        const emailData = func.body(req).data.data;
        const activityModule = func.body(req).data.activityModule;
        const emailConfig = config.emailjs;
        const tenantId = func.body(req).tenantId;

        // Initialize emailjs
        emailjs.init({
            publicKey: emailConfig.publicKey,
            privateKey: emailConfig.privateKey,
        });

        // Extract and validate the toEmail array
        const toEmailList = emailData.toEmail;
        const validEmails = toEmailList.filter((email) => email && email.trim() !== "");

        if (validEmails.length === 0) {
            return res.status(400).json(
                func.responseModel({
                    isSuccess: false,
                    responseMessage: "No valid email addresses provided",
                })
            );
        }

        // Prepare email sending promises
        const emailPromises = validEmails.map(async (email, index) => {
            let newRef = db.default.db.collection(activityCollection).doc();
            let prop = {};
            prop.uid = newRef.id;

            prop.activityModuleCode = activityModule.moduleCode;
            prop.activityModuleSubCode = activityModule.moduleSubCode;
            prop.activityModuleId = activityModule.uid;
            prop.activityContactedIdList = [emailData.toEmailUid[index]];
            prop.activityDatetime = new Date();
            prop.activityContent = emailData.content;

            prop.createdDate = new Date();
            prop.modifiedDate = new Date();
            prop.statusId = 1;
            prop.tenantId = tenantId;

            await newRef.set(prop);

            // send email
            return emailjs.send(emailConfig.serviceId, emailConfig.templateId, {
                toEmail: email,
                fromEmail: emailData.fromEmail,
                subject: emailData.subject,
                content: emailData.content,
            });
        });

        // Execute all promises and wait for them to complete
        const results = await Promise.all(
            emailPromises.map(
                (p) => p.catch((err) => ({ error: err })) // Catch individual promise rejections
            )
        );

        // Check for errors in the results
        const errors = results.filter((result) => result.error);
        if (errors.length > 0) {
            console.log(results);
            return res.status(500).json(
                func.responseModel({
                    isSuccess: false,
                    responseMessage: errors,
                })
            );
        }

        // If all emails succeeded
        res.status(200).json(
            func.responseModel({
                isSuccess: true,
                data: emailData,
                responseMessage: "Emails sent successfully",
            })
        );
    } catch (error) {
        console.error(error);
        res.status(500).json(
            func.responseModel({
                isSuccess: false,
                responseMessage: "An error occurred while sending emails",
                error,
            })
        );
    }
});

export default router;
