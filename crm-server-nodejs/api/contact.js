import { Router } from "express";
import express from "express";
const router = Router();
import db from "../firebase.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";

router.use(express.json());

const collectionName = "contact";

// get all contacts
router.get("/", async (req, res) => {
  try {
    const q = query(collection(db, collectionName), orderBy("createdDate"));
    const snapshot = await getDocs(q);
    const contactList = snapshot.docs.map((doc) => {
      return doc.data();
    });

    contactList.forEach((item) => {
      item.createdDate = convertFirebaseDateFormat(item.createdDate);
      item.modifiedDate = convertFirebaseDateFormat(item.modifiedDate);
    });

    res.status(200).json(contactList);
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// get contact by id
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const snapshot = await getDoc(doc(db, collectionName, id));
    const contactList = snapshot.data();

    res.status(200).json(contactList);
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// create new contact
router.post("/", async (req, res) => {
  const contactList = JSON.parse(JSON.stringify(req.body));

  try {
    let createdContactList = [];
    contactList.forEach((contact) => {
      contact.uid = doc(collection(db, collectionName)).id;
      contact.createdDate = new Date();
      contact.modifiedDate = new Date();

      createdContactList.push(contact);

      new setDoc(doc(db, collectionName, contact.uid), contact);
    });

    res.status(200).json(createdContactList);
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// delete user
router.delete("/delete-user", async (req, res) => {
  const id = req.params.id;
  const user = auth.currentUser;
  try {
    await deleteUser(user);
    res.status(200).json("User deleted");
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

function convertFirebaseDateFormat(date) {
  return date.toDate();
}

export default router;
