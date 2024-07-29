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

const activityCollection = "activity";
const moduleCodeCollection = "moduleCode";

// get all activities
router.get("/", async (req, res) => {
  try {
    const snapshot = await getDocs(collection(db, activityCollection));
    const list = snapshot.docs.map((doc) => doc.data());

    // list.sort((a, b) => {
    //   return a.propertyId - b.propertyId;
    // });

    list.forEach((act) => {
      act.activityDatetime = convertFirebaseDateFormat(act.activityDatetime);
      act.createdDate = convertFirebaseDateFormat(act.createdDate);
      act.modifiedDate = convertFirebaseDateFormat(act.modifiedDate);
    });

    res.status(200).json(list);
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// get all activities by profile id
router.post("/getActivitiesByProfileId", async (req, res) => {
  let profileId = "";
  if (req.body.contactId) {
    profileId = req.body.contactId;
  } else {
    profileId = req.body.companyId;
  }

  try {
    const snapshot = await getDocs(collection(db, activityCollection));
    const list = snapshot.docs.map((doc) => doc.data());

    // list.sort((a, b) => {
    //   return a.propertyId - b.propertyId;
    // });

    res.status(200).json(list);
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// create properties
// router.post("/" + propertiesCollection, async (req, res) => {
//   const list = JSON.parse(JSON.stringify(req.body));

//   try {
//     const createDoc = [];

//     list.forEach((prop) => {
//       prop.uid = doc(collection(db, propertiesCollection)).id;
//       prop.createdDate = new Date();
//       prop.modifiedDate = new Date();

//       createDoc.push(prop);

//       new setDoc(doc(db, propertiesCollection, prop.uid), prop);
//     });

//     res.status(200).json(createDoc);
//   } catch (e) {
//     console.log(e);
//     res.status(400).json(e);
//   }
// });

// get all activities code by module code
router.get("/activityModule", async (req, res) => {
  try {
    const query1 = query(
      collection(db, moduleCodeCollection),
      where("moduleType", "==", "ACTIVITY_TYPE"),
      where("statusId", "==", 1)
    );
    const actCtrQuery = query(
      collection(db, moduleCodeCollection),
      where("moduleType", "==", "ACTIVITY_CONTROL"),
      where("statusId", "==", 1)
    );
    const subActCtrQuery = query(
      collection(db, moduleCodeCollection),
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

    activityModuleList.sort((a, b) => {
      return a.moduleId - b.moduleId;
    });

    activityControlList.sort((a, b) => {
      return a.moduleId - b.moduleId;
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

function convertFirebaseDateFormat(date) {
  try {
    return date ? date.toDate() : date;
  } catch {
    return;
  }
}

export default router;
