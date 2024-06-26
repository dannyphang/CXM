import { Router } from "express";
import express from "express";
const router = Router();
import db from "../firebase.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  runTransaction,
  setDoc,
  query,
  where,
} from "firebase/firestore";

router.use(express.json());

const propertiesCollection = "properties";
const propertiesLookupCollection = "propertiesLookup";
const moduleCodeCollection = "moduleCode";

// get all properties
router.get("/" + propertiesCollection, async (req, res) => {
  try {
    const snapshot = await getDocs(collection(db, propertiesCollection));
    const list = snapshot.docs.map((doc) => doc.data());

    list.sort((a, b) => {
      return a.propertyId - b.propertyId;
    });

    res.status(200).json(list);
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// get all properties with lookup
router.get("/" + propertiesCollection + "/module", async (req, res) => {
  const moduleCode = req.body.moduleCode;

  try {
    const q = query(
      collection(db, propertiesCollection),
      where("moduleCode", "==", moduleCode)
    );

    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((doc) => doc.data());

    list.sort((a, b) => {
      return a.propertyId - b.propertyId;
    });

    res.status(200).json(list);
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// create properties
router.post("/" + propertiesCollection, async (req, res) => {
  const list = JSON.parse(JSON.stringify(req.body));

  try {
    const createDoc = [];

    list.forEach((prop) => {
      prop.uid = doc(collection(db, propertiesCollection)).id;
      prop.CreatedDate = new Date();
      prop.ModifiedDate = new Date();

      createDoc.push(prop);

      new setDoc(doc(db, propertiesCollection, prop.uid), prop);
    });

    res.status(200).json(createDoc);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

// get all properties lookup
router.get("/" + propertiesLookupCollection, async (req, res) => {
  try {
    const snapshot = await getDocs(collection(db, propertiesLookupCollection));
    const list = snapshot.docs.map((doc) => doc.data());

    list.sort((a, b) => {
      return a.propertityLookupId - b.propertityLookupId;
    });
    res.status(200).json(list);
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// create properties lookup
router.post("/" + propertiesLookupCollection, async (req, res) => {
  const list = JSON.parse(JSON.stringify(req.body));

  try {
    const createDoc = [];

    list.forEach((prop) => {
      prop.uid = doc(collection(db, propertiesLookupCollection)).id;
      prop.CreatedDate = new Date();
      prop.ModifiedDate = new Date();

      createDoc.push(prop);

      new setDoc(doc(db, propertiesLookupCollection, prop.uid), prop);
    });

    res.status(200).json(createDoc);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

// get all module code
router.get("/" + moduleCodeCollection, async (req, res) => {
  try {
    const snapshot = await getDocs(collection(db, moduleCodeCollection));
    const list = snapshot.docs.map((doc) => doc.data());

    list.sort((a, b) => {
      return a.moduleId - b.moduleId;
    });
    res.status(200).json(list);
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// create module code
router.post("/" + moduleCodeCollection, async (req, res) => {
  const list = JSON.parse(JSON.stringify(req.body));

  try {
    const createDoc = [];

    list.forEach((prop) => {
      prop.uid = doc(collection(db, moduleCodeCollection)).id;
      prop.CreatedDate = new Date();
      prop.ModifiedDate = new Date();

      createDoc.push(prop);

      new setDoc(doc(db, moduleCodeCollection, prop.uid), prop);
    });

    res.status(200).json(createDoc);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

export default router;
