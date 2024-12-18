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

// get all companies
router.get("/", async (req, res) => {
    let tenantId = func.body(req).tenantId;
    try {
        const snapshot = await db.default.db
            .collection(companyCollectionName)
            .orderBy("createdDate")
            .where(Filter.or(Filter.where("tenantId", "==", tenantId), Filter.where("tenantId", "==", DEFAULT_SYSTEM_TENANT)))
            .where("statusId", "==", 1)
            .get();

        const companyList = snapshot.docs.map((doc) => {
            return doc.data();
        });

        companyList.forEach((item) => {
            item.createdDate = convertFirebaseDateFormat(item.createdDate);
            item.modifiedDate = convertFirebaseDateFormat(item.modifiedDate);
        });

        res.status(200).json(func.responseModel({ data: companyList }));
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

// get company by id
router.get("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const snapshot = await db.default.db.collection(companyCollectionName).doc(id).get();

        const assoSnapshot = await db.default.db.collection(associationCollection).orderBy("createdDate").where("statusId", "==", 1).where("profileUid", "==", id).get();

        const assoSnapshot2 = await db.default.db.collection(associationCollection).orderBy("createdDate").where("statusId", "==", 1).where("assoProfileUid", "==", id).get();

        const company = snapshot.data().statusId == 1 && snapshot.data().tenantId === tenantId ? snapshot.data() : {};
        const assoList = assoSnapshot.docs.map((doc) => {
            return doc.data();
        });
        const assoList2 = assoSnapshot2.docs.map((doc) => {
            return doc.data();
        });

        let companyData = company;
        companyData.createdDate = convertFirebaseDateFormat(companyData.createdDate);
        companyData.modifiedDate = convertFirebaseDateFormat(companyData.modifiedDate);

        if (assoList.length > 0 || assoList2.length > 0) {
            companyData.association = {};
            companyData.association.contactList = [];

            let p1 = new Promise((resolve, reject) => {
                if (assoList.length == 0) {
                    resolve();
                }
                let count = 0;
                assoList.forEach(async (item) => {
                    let companySnapshot = await db.default.db.collection(contactCollectionName).doc(item.assoProfileUid).get();

                    let comp = companySnapshot.data()?.statusId == 1 && companySnapshot.data()?.tenantId === tenantId ? companySnapshot.data() : {};
                    companyData.association.contactList.push(comp);
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
                    let companySnapshot2 = await db.default.db.collection(contactCollectionName).doc(item.profileUid).get();
                    let comp2 = companySnapshot2.data()?.statusId == 1 && companySnapshot2.data()?.tenantId === tenantId ? companySnapshot2.data() : {};
                    companyData.association.contactList.push(comp2);
                    count++;

                    if (assoList2.length == count) {
                        resolve();
                    }
                });
            });

            Promise.all([p1, p2]).then((_) => {
                res.status(200).json(func.responseModel({ data: companyData }));
            });
        } else {
            res.status(200).json(func.responseModel({ data: companyData }));
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

// create new company
router.post("/", async (req, res) => {
    try {
        const companyList = JSON.parse(JSON.stringify(func.body(req).data.companyList));
        let createdCompanyList = [];

        companyList.forEach(async (company) => {
            let newRef = db.default.db.collection(contactCollectionName).doc();
            company.uid = newRef.id;
            company.createdDate = new Date();
            company.createdBy = func.body(req).userId;
            company.modifiedDate = new Date();
            company.modifiedBy = func.body(req).userId;
            company.statusId = 1;
            company.tenantId = func.body(req).tenantId;

            createdCompanyList.push(company);

            await newRef.set(company);
        });

        res.status(200).json(func.responseModel({ data: createdCompanyList }));
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

// delete company
router.put("/delete", async (req, res) => {
    try {
        func.body(req).data.companyList.forEach(async (company) => {
            let newRef = db.default.db.collection(companyCollectionName).doc(company.uid);

            await newRef.update({
                statusId: 2,
                modifiedDate: new Date(),
                modifiedBy: func.body(req).userId,
            });
        });

        res.status(200).json(func.responseModel({ responseMessage: "Deleted successfully" }));

        // res.status(200).json(req.body.companyList);
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

// update company
router.put("/", async (req, res) => {
    const companyList = func.body(req).data.companyList;

    try {
        let updatedCompanyList = [];
        companyList.forEach(async (company) => {
            company.modifiedDate = new Date();
            company.modifiedBy = func.body(req).userId;

            let newRef = db.default.db.collection(companyCollectionName).doc(company.uid);

            const updatedCompany = await newRef.update(company);
            updatedCompanyList.push(updatedCompany);
        });

        res.status(200).json(func.responseModel({ data: updatedCompanyList }));
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
