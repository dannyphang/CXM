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

// get all contacts
router.get("/", async (req, res) => {
  try {
    const q = query(
      collection(db.default.db, contactCollectionName),
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
    let qu = query(doc(db.default.db, contactCollectionName, id));
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
          let que = query(doc(db.default.db, companyCollectionName, item.assoProfileUid));
          let contactSnapshot = await getDoc(que);
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
          let que = query(doc(db.default.db, companyCollectionName, item.profileUid));
          let contactSnapshot2 = await getDoc(que);
          let cont2 = contactSnapshot2.data()?.statusId == 1 ? contactSnapshot2.data() : {};
          contactData.association.companyList.push(cont2);
          count++;

          if (assoList2.length == count) {
            resolve();
          }
        });
      });

      Promise.all([p1, p2]).then((_) => {
        res.status(200).json(contactData);
      });
    } else {
      res.status(200).json(contactData);
    }
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
      contact.uid = doc(collection(db.default.db, contactCollectionName)).id;
      contact.createdDate = new Date();
      contact.modifiedDate = new Date();
      contact.statusId = 1;

      createdContactList.push(contact);

      new setDoc(doc(db.default.db, contactCollectionName, contact.uid), contact);
    });

    res.status(200).json(createdContactList);
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// delete contact
router.put("/delete", async (req, res) => {
  try {
    req.body.contactList.forEach(async (contact) => {
      let ref = doc(db.default.db, contactCollectionName, contact.uid);
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
      const docRef = doc(db.default.db, contactCollectionName, contact.uid);
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
