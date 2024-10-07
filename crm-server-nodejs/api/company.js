import { Router } from "express";
import express from "express";
const router = Router();
import * as db from "../firebase-admin.js";

router.use(express.json());

const contactCollectionName = "contact";
const companyCollectionName = "company";
const associationCollection = "association";

// get all companies
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.default.db
      .collection(companyCollectionName)
      .orderBy("createdDate")
      .where("statusId", "==", 1)
      .get();

    const companyList = snapshot.docs.map((doc) => {
      return doc.data();
    });

    companyList.forEach((item) => {
      item.createdDate = convertFirebaseDateFormat(item.createdDate);
      item.modifiedDate = convertFirebaseDateFormat(item.modifiedDate);
    });

    res.status(200).json(companyList);
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// get company by id
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const snapshot = await db.default.db.collection(companyCollectionName).doc(id).get();

    const assoSnapshot = await db.default.db
      .collection(associationCollection)
      .orderBy("createdDate")
      .where("statusId", "==", 1)
      .where("profileUid", "==", id)
      .get();

    const assoSnapshot2 = await db.default.db
      .collection(associationCollection)
      .orderBy("createdDate")
      .where("statusId", "==", 1)
      .where("assoProfileUid", "==", id)
      .get();

    const company = snapshot.data().statusId == 1 ? snapshot.data() : {};
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
          let companySnapshot = await db.default.db
            .collection(contactCollectionName)
            .doc(item.assoProfileUid)
            .get();

          let comp = companySnapshot.data()?.statusId == 1 ? companySnapshot.data() : {};
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
          let companySnapshot2 = await db.default.db
            .collection(contactCollectionName)
            .doc(item.profileUid)
            .get();
          let comp2 = companySnapshot2.data()?.statusId == 1 ? companySnapshot2.data() : {};
          companyData.association.contactList.push(comp2);
          count++;

          if (assoList2.length == count) {
            resolve();
          }
        });
      });

      Promise.all([p1, p2]).then((_) => {
        res.status(200).json(companyData);
      });
    } else {
      res.status(200).json(companyData);
    }
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// create new company
router.post("/", async (req, res) => {
  try {
    const companyList = JSON.parse(JSON.stringify(req.body.companyList));
    let createdCompanyList = [];

    companyList.forEach(async (company) => {
      let newRef = db.default.db.collection(contactCollectionName).doc();
      company.uid = newRef.id;
      company.createdDate = new Date();
      company.modifiedDate = new Date();
      company.statusId = 1;

      createdCompanyList.push(company);

      await newRef.set(company);
    });

    res.status(200).json(createdCompanyList);
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// delete company
router.put("/delete", async (req, res) => {
  try {
    req.body.companyList.forEach(async (company) => {
      let newRef = db.default.db.collection(companyCollectionName).doc(company.uid);

      await newRef.update({
        statusId: 2,
        modifiedDate: new Date(),
      });
    });

    res.status(200).json({
      message: "Deleted successfully",
    });

    // res.status(200).json(req.body.companyList);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

// update company
router.put("/", async (req, res) => {
  const companyList = req.body.companyList;

  try {
    let updatedCompanyList = [];
    companyList.forEach(async (company) => {
      company.modifiedDate = new Date();

      let newRef = db.default.db.collection(companyCollectionName).doc(company.uid);

      const updatedCompany = await newRef.update(company);
      updatedCompanyList.push(updatedCompany);
    });

    res.status(200).json(updatedCompanyList);
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

function convertFirebaseDateFormat(date) {
  return date.toDate();
}

export default router;
