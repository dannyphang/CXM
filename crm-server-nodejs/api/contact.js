import { Router } from "express";
import express from "express";
const router = Router();
import * as db from "../firebase-admin.js";
import * as func from "../shared/function.js";
import { Filter } from "firebase-admin/firestore";
import { DEFAULT_SYSTEM_TENANT } from "../shared/constant.js";

router.use(express.json());

const contactCollectionName = "contact";
const companyCollectionName = "company";
const associationCollection = "association";

// get all contacts
router.get("/", async (req, res) => {
    let tenantId = func.body(req).tenantId;
    try {
        const snapshot = await db.default.db
            .collection(contactCollectionName)
            .orderBy("createdDate")
            .where(Filter.or(Filter.where("tenantId", "==", tenantId), Filter.where("tenantId", "==", DEFAULT_SYSTEM_TENANT)))
            .where("statusId", "==", 1)
            .get();

        const contactList = snapshot.docs.map((doc) => {
            return doc.data();
        });

        contactList.forEach((item) => {
            item.createdDate = convertFirebaseDateFormat(item.createdDate);
            item.modifiedDate = convertFirebaseDateFormat(item.modifiedDate);
        });

        res.status(200).json(func.responseModel({ data: contactList }));
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

// get contact by id
router.get("/:id", async (req, res) => {
    const id = req.params.id;
    let tenantId = func.body(req).tenantId;
    try {
        const snapshot = await db.default.db.collection(contactCollectionName).doc(id).get();

        const assoSnapshot = await db.default.db.collection(associationCollection).orderBy("createdDate").where("statusId", "==", 1).where("profileUid", "==", id).get();

        const assoSnapshot2 = await db.default.db.collection(associationCollection).orderBy("createdDate").where("statusId", "==", 1).where("assoProfileUid", "==", id).get();

        const contact = snapshot.data().statusId == 1 && snapshot.data().tenantId == tenantId ? snapshot.data() : {};
        const assoList = assoSnapshot.docs.map((doc) => {
            return doc.data();
        });
        const assoList2 = assoSnapshot2.docs.map((doc) => {
            return doc.data();
        });

        let contactData = contact;
        contactData.createdDate = convertFirebaseDateFormat(contactData.createdDate);
        contactData.modifiedDate = convertFirebaseDateFormat(contactData.modifiedDate);

        if (assoList.length > 0 || assoList2.length > 0) {
            contactData.association = {};
            contactData.association.companyList = [];

            let p1 = new Promise((resolve, reject) => {
                if (assoList.length == 0) {
                    resolve();
                }
                let count = 0;
                assoList.forEach(async (item) => {
                    let contactSnapshot = await db.default.db.collection(companyCollectionName).doc(item.assoProfileUid).get();

                    let cont = contactSnapshot.data()?.statusId == 1 && contactSnapshot.data()?.tenantId === tenantId ? contactSnapshot.data() : {};
                    contactData.association.companyList.push(cont);
                    count++;

                    if (assoList.length == count) {
                        resolve();
                    }
                });
            });

            let p2 = new Promise((resolve, reject) => {
                if (assoList2.length == 0) {
                    resolve();
                }
                let count = 0;
                assoList2.forEach(async (item) => {
                    let contactSnapshot2 = await db.default.db.collection(companyCollectionName).doc(item.profileUid).get();

                    let cont2 = contactSnapshot2.data()?.statusId == 1 && contactSnapshot2?.tenantId === tenantId ? contactSnapshot2.data() : {};
                    contactData.association.companyList.push(cont2);
                    count++;

                    if (assoList2.length == count) {
                        resolve();
                    }
                });
            });

            Promise.all([p1, p2]).then((_) => {
                res.status(200).json(func.responseModel({ data: contactData }));
            });
        } else {
            res.status(200).json(func.responseModel({ data: contactData }));
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

// create new contact
router.post("/", async (req, res) => {
    let tenantId = func.body(req).tenantId;
    try {
        const contactList = JSON.parse(JSON.stringify(func.body(req).data.contactList));
        let createdContactList = [];

        contactList.forEach(async (contact) => {
            let newRef = db.default.db.collection(contactCollectionName).doc();
            contact.uid = newRef.id;
            contact.createdDate = new Date();
            contact.createdBy = func.body(req).userId;
            contact.modifiedDate = new Date();
            contact.modifiedBy = func.body(req).userId;
            contact.statusId = 1;
            contact.tenantId = tenantId;

            createdContactList.push(contact);

            await newRef.set(contact);
        });

        res.status(200).json(func.responseModel({ data: createdContactList }));
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

// delete contact
router.put("/delete", async (req, res) => {
    try {
        func.body(req)
            .data()
            .contactList.forEach(async (contact) => {
                let newRef = db.default.db.collection(contactCollectionName).doc(contact.uid);

                await newRef.update({
                    statusId: 2,
                    modifiedDate: new Date(),
                    modifiedBy: func.body(req).userId,
                });
            });

        res.status(200).json(func.responseModel({ responseMessage: "Deleted successfully" }));
    } catch (e) {
        console.log(e);
        res.status(400).json(e);
    }
});

// update contact
router.put("/", async (req, res) => {
    try {
        const contactList = func.body(req).data.contactList;

        let updatedContactList = [];

        contactList.forEach(async (contact) => {
            contact.modifiedDate = new Date();

            let newRef = db.default.db.collection(contactCollectionName).doc(contact.uid);

            contact.modifiedBy = func.body(req).userId;
            contact.modifiedDate = new Date();

            const updatedContact = await newRef.update(contact);
            updatedContactList.push(updatedContact);
        });

        res.status(200).json(func.responseModel({ data: updatedContactList }));
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

// remove asso
router.put("/removeAsso", async (req, res) => {
    try {
        const data = func.body(req).data.data;

        const assoSnapshot = await db.default.db
            .collection(associationCollection)
            .where("statusId", "==", 1)
            .where("profileUid", "==", data.uid)
            .where("module", "==", data.module)
            .where("assoProfileUid", "==", data.assoUid)
            .get();

        const assoList = assoSnapshot.docs.map((doc) => {
            return doc.data();
        });

        if (assoList[0]) {
            assoList[0].statusId = 2;
            assoList[0].modifiedDate = new Date();
            assoList[0].modifiedBy = func.body(req).userId;

            let newRef = db.default.db.collection(associationCollection).doc(assoList[0].uid);
            await newRef.update(assoList[0]);

            res.status(200).json(func.responseModel({ data: null }));
        } else {
            res.status(200).json(
                func.responseModel({
                    isSuccess: false,
                    responseMessage: "Association not found",
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

function convertFirebaseDateFormat(date) {
    return date.toDate();
}

export default router;
