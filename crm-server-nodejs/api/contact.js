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

const collectionName = "contact";

// get all contacts
router.get("/", async (req, res) => {
  try {
    const q = query(
      collection(db.default.db, collectionName),
      orderBy("createdDate"),
      where("statusId", "==", 1)
    );
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
    let qu = query(doc(db.default.db, collectionName, id));
    const snapshot = await getDoc(qu);
    const contact = snapshot.data().statusId == 1 ? snapshot.data() : {};

    res.status(200).json(contact);
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// create new contact
router.post("/", async (req, res) => {
  try {
    const contactList = JSON.parse(JSON.stringify(req.body.contactList));
    let createdContactList = [];
    contactList.forEach((contact) => {
      contact.uid = doc(collection(db.default.db, collectionName)).id;
      contact.createdDate = new Date();
      contact.modifiedDate = new Date();
      contact.statusId = 1;

      createdContactList.push(contact);

      new setDoc(doc(db.default.db, collectionName, contact.uid), contact);
    });

    res.status(200).json(createdContactList);
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// delete contact by id
router.delete("/", async (req, res) => {
  // const id = req.params.id;
  // const user = auth.currentUser;
  // try {
  //   await deleteUser(user);
  //   res.status(200).json("User deleted");
  // } catch (error) {
  //   console.log("error", error);
  //   res.status(400).json(error);
  // }
});

// delete contact
router.put("/delete", async (req, res) => {
  try {
    req.body.contactList.forEach(async (contact) => {
      let ref = doc(db.default.db, collectionName, contact.uid);
      await updateDoc(ref, {
        statusId: 2,
      });
    });

    res.status(200).json({
      message: "Deleted successfully",
    });

    // res.status(200).json(req.body.contactList);
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
      const docRef = doc(db.default.db, collectionName, contact.uid);
      const updatedContact = await updateDoc(docRef, contact);
      updatedContactList.push(updatedContact);
    });

    res.status(200).json(updatedContactList);
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

function convertFirebaseDateFormat(date) {
  return date.toDate();
}

export default router;
