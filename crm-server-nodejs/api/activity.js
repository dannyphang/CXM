import { Router } from "express";
import express from "express";
const router = Router();
import * as db from "../firebase.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";

router.use(express.json());

const activityCollection = "activity";
const attachmentCollection = "attachment";
const moduleCodeCollection = "moduleCode";

// get all activities
router.get("/", async (req, res) => {
  try {
    const query1 = query(
      collection(db.default.db, activityCollection),
      where("statusId", "==", 1),
      orderBy("modifiedDate", "desc")
    );
    const snapshot = await getDocs(query1);
    const list = snapshot.docs.map((doc) => doc.data());

    if (list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        list[i].activityDatetime = convertFirebaseDateFormat(list[i].activityDatetime);
        list[i].createdDate = convertFirebaseDateFormat(list[i].createdDate);
        list[i].modifiedDate = convertFirebaseDateFormat(list[i].modifiedDate);

        const query2 = query(
          collection(db.default.db, attachmentCollection),
          where("activityUid", "==", list[i].uid),
          where("statusId", "==", 1)
        );
        const snapshot2 = await getDocs(query2);
        const attachmentList = snapshot2.docs.map((doc) => doc.data());
        list[i].attachmentList = attachmentList;

        // return status at the last loop
        if (i === list.length - 1) {
          res.status(200).json(list);
        }
      }
    } else {
      res.status(200).json(list);
    }
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
    const snapshot = await getDocs(collection(db.default.db, activityCollection));
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
    const subActivityControlList = subActCtrSnapshot.docs.map((doc) => doc.data());

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

// create activity
router.post("/", async (req, res) => {
  try {
    const list = JSON.parse(JSON.stringify(req.body.createdActivitiesList));
    const createDoc = [];

    list.forEach((prop) => {
      prop.uid = doc(collection(db.default.db, activityCollection)).id;
      prop.createdDate = new Date();
      prop.modifiedDate = new Date();
      prop.statusId = 1;

      createDoc.push(prop);

      new setDoc(doc(db.default.db, activityCollection, prop.uid), prop);
    });
    res.status(200).json(list);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

// upload attachment to activity
router.post("/upload", async (req, res) => {
  try {
    const list = JSON.parse(JSON.stringify(req.body.attachmentList));
    const createDoc = [];

    list.forEach((prop) => {
      prop.uid = doc(collection(db.default.db, attachmentCollection)).id;
      prop.createdDate = new Date();
      prop.modifiedDate = new Date();
      prop.statusId = 1;

      createDoc.push(prop);

      new setDoc(doc(db.default.db, attachmentCollection, prop.uid), prop);
    });
    res.status(200).json(list);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

// delete activity (update status to 2)
router.delete("/:uid", async (req, res) => {
  const uid = req.params.uid;
  let actRef = doc(db.default.db, activityCollection, uid);
  await updateDoc(actRef, {
    statusId: 2,
  });

  res.status(200).json({
    uid: uid,
  });
});

// update activity
router.put("/:uid", async (req, res) => {
  const uid = req.params.uid;
  let updateBody = req.body;
  let actRef = doc(db.default.db, activityCollection, uid);
  await updateDoc(actRef, updateBody);
  // console.log(updateBody);
  res.status(200).json({
    uid: uid,
  });
});

function convertFirebaseDateFormat(date) {
  try {
    return date ? date.toDate() : date;
  } catch {
    return date;
  }
}

export default router;
