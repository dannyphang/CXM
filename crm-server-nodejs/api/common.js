import { Router } from "express";
import express from "express";
const router = Router();
import * as db from "../firebase.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  runTransaction,
  setDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";

router.use(express.json());

const propertiesCollection = "properties";
const propertiesLookupCollection = "propertiesLookup";
const moduleCodeCollection = "moduleCode";

// get all properties
router.get("/" + propertiesCollection, async (req, res) => {
  try {
    let query1 = query(
      collection(db.default.db, propertiesCollection),
      where("statusId", "==", 1),
      orderBy("propertyId")
    );
    const snapshot = await getDocs(query1);
    const list = snapshot.docs.map((doc) => doc.data());

    res.status(200).json(list);
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// get all properties with lookup by module
router.get("/" + propertiesCollection + "/module", async (req, res) => {
  const moduleCode = req.headers.modulecode;

  try {
    const propertiesQuery = query(
      collection(db.default.db, propertiesCollection),
      where("moduleCode", "==", moduleCode),
      where("statusId", "==", 1),
      orderBy("order")
    );
    const moduleQuery = query(
      collection(db.default.db, moduleCodeCollection),
      where("moduleSubCode", "==", moduleCode),
      where("statusId", "==", 1)
    );
    const propertiesLookupQuery = query(
      collection(db.default.db, propertiesLookupCollection),
      where("moduleCode", "==", moduleCode),
      where("statusId", "==", 1)
    );

    const snapshot = await getDocs(propertiesQuery);
    const snapshotModule = await getDocs(moduleQuery);
    const snapshotPL = await getDocs(propertiesLookupQuery);
    const propertyList = snapshot.docs.map((doc) => doc.data());
    const moduleList = snapshotModule.docs.map((doc) => doc.data());
    const propertyLookupList = snapshotPL.docs.map((doc) => doc.data());

    for (let i = 0; i < propertyList.length; i++) {
      propertyList[i].propertyLookupList = [];

      propertyList[i].createdDate = convertFirebaseDateFormat(
        propertyList[i].createdDate
      );
      propertyList[i].modifiedDate = convertFirebaseDateFormat(
        propertyList[i].modifiedDate
      );

      for (let j = 0; j < propertyLookupList.length; j++) {
        if (propertyList[i].propertyId === propertyLookupList[j].propertyId) {
          propertyLookupList[i].createdDate = convertFirebaseDateFormat(
            propertyLookupList[i].createdDate
          );
          propertyLookupList[i].modifiedDate = convertFirebaseDateFormat(
            propertyLookupList[i].modifiedDate
          );
          propertyList[i].propertyLookupList.push(propertyLookupList[j]);
        }
      }
    }

    moduleList.forEach((module) => {
      module.propertiesList = [];
      module.createdDate = convertFirebaseDateFormat(module.createdDate);
      module.modifiedDate = convertFirebaseDateFormat(module.modifiedDate);
      for (let i = 0; i < propertyList.length; i++) {
        if (module.moduleCode === propertyList[i].moduleCat) {
          module.propertiesList.push(propertyList[i]);
        }
      }
    });

    res.status(200).json(moduleList);
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// get all properties with lookup by module for create contact/company profile
router.get("/" + propertiesCollection + "/module/create", async (req, res) => {
  const moduleCode = req.headers.modulecode;

  try {
    const propertiesQuery = query(
      collection(db.default.db, propertiesCollection),
      where("moduleCode", "==", moduleCode),
      where("statusId", "==", 1),
      where("isMandatory", "==", true),
      where("isEditable", "==", true),
      orderBy("order")
    );
    const moduleQuery = query(
      collection(db.default.db, moduleCodeCollection),
      where("moduleSubCode", "==", moduleCode),
      where("statusId", "==", 1)
    );
    const propertiesLookupQuery = query(
      collection(db.default.db, propertiesLookupCollection),
      where("moduleCode", "==", moduleCode),
      where("statusId", "==", 1)
    );

    const snapshot = await getDocs(propertiesQuery);
    const snapshotModule = await getDocs(moduleQuery);
    const snapshotPL = await getDocs(propertiesLookupQuery);
    const propertyList = snapshot.docs.map((doc) => doc.data());
    const moduleList = snapshotModule.docs.map((doc) => doc.data());
    const propertyLookupList = snapshotPL.docs.map((doc) => doc.data());

    for (let i = 0; i < propertyList.length; i++) {
      propertyList[i].propertyLookupList = [];
      propertyList[i].createdDate = convertFirebaseDateFormat(
        propertyList[i].createdDate
      );
      propertyList[i].modifiedDate = convertFirebaseDateFormat(
        propertyList[i].modifiedDate
      );

      for (let j = 0; j < propertyLookupList.length; j++) {
        if (propertyList[i].propertyId === propertyLookupList[j].propertyId) {
          propertyList[i].propertyLookupList.push(propertyLookupList[j]);
        }
      }
    }

    moduleList.forEach((module) => {
      module.propertiesList = [];
      for (let i = 0; i < propertyList.length; i++) {
        if (module.moduleCode === propertyList[i].moduleCat) {
          module.propertiesList.push(propertyList[i]);
        }
      }
    });

    res.status(200).json(moduleList);
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
      prop.uid = doc(collection(db.default.db, propertiesCollection)).id;
      prop.createdDate = new Date();
      prop.modifiedDate = new Date();

      createDoc.push(prop);

      new setDoc(doc(db.default.db, propertiesCollection, prop.uid), prop);
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
    let q = query(
      collection(db.default.db, propertiesLookupCollection),
      where("statusId", "==", 1),
      orderBy("propertityLookupId")
    );
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((doc) => doc.data());

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
      prop.uid = doc(collection(db.default.db, propertiesLookupCollection)).id;
      prop.createdDate = new Date();
      prop.modifiedDate = new Date();

      createDoc.push(prop);

      new setDoc(
        doc(db.default.db, propertiesLookupCollection, prop.uid),
        prop
      );
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
    const snapshot = await getDocs(
      collection(db.default.db, moduleCodeCollection),
      where("statusId", "==", 1),
      orderBy("moduleId")
    );
    const list = snapshot.docs.map((doc) => doc.data());

    res.status(200).json(list);
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// get all activities code by module code
router.get("/activityModule", async (req, res) => {
  try {
    const query1 = query(
      collection(db.default.db, moduleCodeCollection),
      where("moduleType", "==", "ACTIVITY_TYPE"),
      where("statusId", "==", 1),
      orderBy("moduleId")
    );
    const actCtrQuery = query(
      collection(db.default.db, moduleCodeCollection),
      where("moduleType", "==", "ACTIVITY_CONTROL"),
      where("statusId", "==", 1),
      orderBy("moduleId")
    );
    const subActCtrQuery = query(
      collection(db.default.db, moduleCodeCollection),
      where("moduleType", "==", "SUB_ACTIVITY_CONTROL"),
      where("statusId", "==", 1)
    );

    const snapshot = await getDocs(query1);
    const actCtrSnapshot = await getDocs(actCtrQuery);
    const subActCtrSnapshot = await getDocs(subActCtrQuery);

    const activityModuleList = snapshot.docs.map((doc) => doc.data());
    const activityControlList = actCtrSnapshot.docs.map((doc) => doc.data());
    const subActivityControlList = subActCtrSnapshot.docs.map((doc) =>
      doc.data()
    );

    activityControlList.forEach((item) => {
      item.subActivityControl = [];
      subActivityControlList.forEach((subItem) => {
        if (item.moduleCode === subItem.moduleSubCode) {
          item.subActivityControl.push(subItem);
        }
      });
    });

    res.status(200).json({
      activityModuleList,
      activityControlList,
    });
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
      prop.uid = doc(collection(db.default.db, moduleCodeCollection)).id;
      prop.createdDate = new Date();
      prop.modifiedDate = new Date();

      createDoc.push(prop);

      new setDoc(doc(db.default.db, moduleCodeCollection, prop.uid), prop);
    });

    res.status(200).json(createDoc);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

function convertFirebaseDateFormat(date) {
  try {
    return date ? date.toDate() : date;
  } catch {
    return;
  }
}

export default router;
