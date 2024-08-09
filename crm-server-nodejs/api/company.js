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

const collectionName = "company";

// get all companies
router.get("/", async (req, res) => {
  try {
    const q = query(
      collection(db.default.db, collectionName),
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
    let qu = query(doc(db.default.db, collectionName, id));
    const snapshot = await getDoc(qu);
    const company = snapshot.data().statusId == 1 ? snapshot.data() : {};

    res.status(200).json(company);
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
      company.uid = doc(collection(db.default.db, collectionName)).id;
      company.createdDate = new Date();
      company.modifiedDate = new Date();
      company.statusId = 1;

      createdCompanyList.push(company);

      new setDoc(doc(db.default.db, collectionName, company.uid), company);
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
      let ref = doc(db.default.db, collectionName, company.uid);
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
      const docRef = doc(db.default.db, collectionName, company.uid);
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
