import { Router } from "express";
import express from "express";
const router = Router();
import db from "../firebase.js";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";

router.use(express.json());

const collectionName = "contact";

// get all contacts
router.get("/", async (req, res) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const contactList = snapshot.docs.map((doc) => doc.data());
    // sort item list by date
    contactList.sort((a, b) => {
      return new Date(a.createdDate) - new Date(b.createdDate);
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

export default router;
