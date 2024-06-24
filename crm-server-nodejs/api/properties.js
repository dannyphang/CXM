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
} from "firebase/firestore";

router.use(express.json());

const collectionName = "properties";

// get all properties
router.get("/", async (req, res) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const list = snapshot.docs.map((doc) => doc.data());
    // sort item list by date
    list.sort((a, b) => {
      return new Date(a.CreatedDate) - new Date(b.CreatedDate);
    });
    res.status(200).json(list);
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// create properties
router.post("/", async (req, res) => {
  //const sfDocRef = doc(db, collectionName);

  try {
    const newPopulation = await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.set(doc(db, collectionName), req.body);
      if (!sfDoc.exists()) {
        throw "Document does not exist!";
      }
    });

    res.status(200).json(list);
  } catch (e) {
    // This will be a "population is too big" error.
    console.error(e);
  }
});
