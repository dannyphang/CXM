import { Router } from "express";
import express from "express";
const router = Router();
import * as db from "../firebase.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";

router.use(express.json());

const contactCollectionName = "contact";
const companyCollectionName = "company";
const associationCollection = "association";

// get all companies
router.get("/", async (req, res) => {
  try {
    const q = query(
      collection(db.default.db, companyCollectionName),
      orderBy("createdDate"),
      where("statusId", "==", 1)
    );
    const snapshot = await getDocs(q);
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
    let qu = query(doc(db.default.db, companyCollectionName, id));
    const assoQuery = query(
      collection(db.default.db, associationCollection),
      orderBy("createdDate"),
      where("statusId", "==", 1),
      where("profileUid", "==", id)
    );
    const assoQuery2 = query(
      collection(db.default.db, associationCollection),
      orderBy("createdDate"),
      where("statusId", "==", 1),
      where("assoProfileUid", "==", id)
    );

    const snapshot = await getDoc(qu);
    const assoSnapshot = await getDocs(assoQuery);
    const assoSnapshot2 = await getDocs(assoQuery2);

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
      companyData.associationList = [];

      let p1 = new Promise((resolve, reject) => {
        if (assoList.length == 0) {
          resolve();
        }
        let count = 0;
        assoList.forEach(async (item) => {
          let que = query(doc(db.default.db, contactCollectionName, item.assoProfileUid));
          let companySnapshot = await getDoc(que);
          let comp = companySnapshot.data()?.statusId == 1 ? companySnapshot.data() : {};
          companyData.associationList.push(comp);
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
          let que = query(doc(db.default.db, contactCollectionName, item.profileUid));
          let companySnapshot2 = await getDoc(que);
          let comp2 = companySnapshot2.data()?.statusId == 1 ? companySnapshot2.data() : {};
          companyData.associationList.push(comp2);
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
    companyList.forEach((company) => {
      company.uid = doc(collection(db.default.db, companyCollectionName)).id;
      company.createdDate = new Date();
      company.modifiedDate = new Date();
      company.statusId = 1;

      createdCompanyList.push(company);

      new setDoc(doc(db.default.db, companyCollectionName, company.uid), company);
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
      let ref = doc(db.default.db, companyCollectionName, company.uid);
      await updateDoc(ref, {
        statusId: 2,
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
      const docRef = doc(db.default.db, companyCollectionName, company.uid);
      const updatedCompany = await updateDoc(docRef, company);
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
