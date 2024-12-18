import { Router } from "express";
import express from "express";
const router = Router();
import * as db from "../firebase-admin.js";
import responseModel from "../shared/function.js";
import { Filter } from "firebase-admin/firestore";
import { DEFAULT_SYSTEM_TENANT } from "../shared/constant.js";

router.use(express.json());

const contactCollectionName = "contact";
const companyCollectionName = "company";
const associationCollection = "association";

// get all contacts
router.get("/", async (req, res) => {
    let tenantId = req.headers.tenantid;
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

        res.status(200).json(responseModel({ data: contactList }));
    } catch (error) {
        console.log("error", error);
        res.status(400).json(
            responseModel({
                isSuccess: false,
                responseMessage: error,
            })
        );
    }
});

// get contact by id
router.get("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const snapshot = await db.default.db.collection(contactCollectionName).doc(id).get();

        const assoSnapshot = await db.default.db.collection(associationCollection).orderBy("createdDate").where("statusId", "==", 1).where("profileUid", "==", id).get();

        const assoSnapshot2 = await db.default.db.collection(associationCollection).orderBy("createdDate").where("statusId", "==", 1).where("assoProfileUid", "==", id).get();

        const contact = snapshot.data().statusId == 1 ? snapshot.data() : {};
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

                    let cont = contactSnapshot.data()?.statusId == 1 ? contactSnapshot.data() : {};
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

                    let cont2 = contactSnapshot2.data()?.statusId == 1 ? contactSnapshot2.data() : {};
                    contactData.association.companyList.push(cont2);
                    count++;

                    if (assoList2.length == count) {
                        resolve();
                    }
                });
            });

            Promise.all([p1, p2]).then((_) => {
                res.status(200).json(responseModel({ data: contactData }));
            });
        } else {
            res.status(200).json(responseModel({ data: contactData }));
        }
    } catch (error) {
        console.log("error", error);
        res.status(400).json(
            responseModel({
                isSuccess: false,
                responseMessage: error,
            })
        );
    }
});

// create new contact
router.post("/", async (req, res) => {
    try {
        const contactList = JSON.parse(JSON.stringify(req.body.contactList));
        let createdContactList = [];

        contactList.forEach(async (contact, index) => {
            if (checkUnique(contact)) {
            }

            let newRef = db.default.db.collection(contactCollectionName).doc();
            contact.uid = newRef.id;
            contact.createdDate = new Date();
            contact.modifiedDate = new Date();
            contact.statusId = 1;

            createdContactList.push(contact);

            await newRef.set(contact);
        });

        res.status(200).json(responseModel({ data: createdContactList }));
    } catch (error) {
        console.log("error", error);
        res.status(400).json(
            responseModel({
                isSuccess: false,
                responseMessage: error,
            })
        );
    }
});

function checkUnique(contact) {}

// delete contact
router.put("/delete", async (req, res) => {
    try {
        req.body.contactList.forEach(async (contact) => {
            let newRef = db.default.db.collection(contactCollectionName).doc(contact.uid);

            await newRef.update({
                statusId: 2,
                modifiedDate: new Date(),
                modifiedBy: req.body.user,
            });
        });

        res.status(200).json(responseModel({ responseMessage: "Deleted successfully" }));
    } catch (e) {
        console.log(e);
        res.status(400).json(e);
    }
});

// update contact
router.put("/", async (req, res) => {
    const contactList = req.body.contactList;

    try {
        let updatedContactList = [];

        contactList.forEach(async (contact) => {
            contact.modifiedDate = new Date();

            let newRef = db.default.db.collection(contactCollectionName).doc(contact.uid);

            contact.modifiedBy = req.body.user;

            const updatedContact = await newRef.update(contact);
            updatedContactList.push(updatedContact);
        });

        res.status(200).json(responseModel({ data: updatedContactList }));
    } catch (error) {
        console.log("error", error);
        res.status(400).json(
            responseModel({
                isSuccess: false,
                responseMessage: error,
            })
        );
    }
});

// remove asso
router.put("/removeAsso", async (req, res) => {
    const data = req.body.data;

    try {
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

            let newRef = db.default.db.collection(associationCollection).doc(assoList[0].uid);
            await newRef.update(assoList[0]);

            res.status(200).json(responseModel({ data: null }));
        } else {
            res.status(200).json(
                responseModel({
                    isSuccess: false,
                    responseMessage: "Association not found",
                })
            );
        }
    } catch (error) {
        console.log("error", error);
        res.status(400).json(
            responseModel({
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
