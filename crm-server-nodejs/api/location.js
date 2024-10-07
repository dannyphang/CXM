import { Router } from "express";
import express from "express";
const router = Router();
import * as db from "../firebase-admin.js";
import bodyParser from "body-parser";

// router.use(express.json());
router.use(express.json({ limit: 5000000000 }));
router.use(
  express.urlencoded({
    limit: 5000000000,
    extended: true,
    parameterLimit: 5000000000000000,
  })
);

const countryCollectionName = "country";
const cityCollectionName = "city";
const stateCollectionName = "state";

// create new country
router.post("/country", async (req, res) => {
  try {
    const list = JSON.parse(JSON.stringify(req.body));
    let createdList = [];

    list.forEach(async (loc) => {
      let newRef = db.default.db.collection(countryCollectionName).doc();
      loc.uid = newRef.id;
      loc.createdDate = new Date();
      loc.modifiedDate = new Date();
      loc.statusId = 1;

      createdList.push(loc);

      await newRef.set(loc);
    });

    res.status(200).json(createdList);
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// get all country
router.get("/country", async (req, res) => {
  try {
    const snapshot = await db.default.db
      .collection(countryCollectionName)
      .orderBy("countryId")
      .where("statusId", "==", 1)
      .get();

    const list = snapshot.docs.map((doc) => {
      return doc.data();
    });

    list.forEach((item) => {
      item.createdDate = convertFirebaseDateFormat(item.createdDate);
      item.modifiedDate = convertFirebaseDateFormat(item.modifiedDate);
    });

    res.status(200).json(list);
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// create new state
router.post("/state", async (req, res) => {
  try {
    const list = JSON.parse(JSON.stringify(req.body));
    let createdList = [];

    list.forEach(async (loc) => {
      let newRef = db.default.db.collection(stateCollectionName).doc();
      loc.uid = newRef.id;
      loc.createdDate = new Date();
      loc.modifiedDate = new Date();
      loc.statusId = 1;

      createdList.push(loc);

      await newRef.set(loc);
    });

    res.status(200).json({ updatedLength: createdList.length });
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// get all state
router.get("/state", async (req, res) => {
  try {
    const snapshot = await db.default.db
      .collection(stateCollectionName)
      .orderBy("stateId")
      .where("statusId", "==", 1)
      .get();

    const list = snapshot.docs.map((doc) => {
      return doc.data();
    });

    list.forEach((item) => {
      item.createdDate = convertFirebaseDateFormat(item.createdDate);
      item.modifiedDate = convertFirebaseDateFormat(item.modifiedDate);
    });

    res.status(200).json(list);
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// get state by country id
router.get("/state/:id", async (req, res) => {
  try {
    const countryUid = req.params.id;

    const snapshot = await db.default.db.collection(countryCollectionName).doc(countryUid).get();

    if (snapshot.data().statusId === 1) {
      const snapshot2 = await db.default.db
        .collection(stateCollectionName)
        .orderBy("stateId")
        .where("countryId", "==", Number(snapshot.data().countryId))
        .where("statusId", "==", 1)
        .get();

      const list = snapshot2.docs.map((doc) => {
        return doc.data();
      });

      list.forEach((item) => {
        item.createdDate = convertFirebaseDateFormat(item.createdDate);
        item.modifiedDate = convertFirebaseDateFormat(item.modifiedDate);
      });

      res.status(200).json(list);
    } else {
      res.status(400).json({
        errorMessage: "The country is not available.",
      });
    }
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// create new city
router.post("/city", async (req, res) => {
  try {
    const count = req.params.id;

    const list = JSON.parse(JSON.stringify(req.body));
    let createdList = [];

    list.forEach(async (loc, index) => {
      if (index >= (count - 1) * 10000 && index <= count * 10000) {
        let newRef = db.default.db.collection(cityCollectionName).doc();
        loc.uid = newRef.id;
        loc.createdDate = new Date();
        loc.modifiedDate = new Date();
        loc.statusId = 1;

        createdList.push(loc);

        await newRef.set(loc);
      }
    });

    res.status(200).json({ updatedLength: createdList.length });
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// get city by state id
router.get("/city/:id", async (req, res) => {
  try {
    const stateUid = req.params.id;

    const snapshot = await db.default.db.collection(stateCollectionName).doc(stateUid).get();

    if (snapshot.data().statusId === 1) {
      const snapshot2 = await db.default.db
        .collection(cityCollectionName)
        .orderBy("stateId")
        .where("stateId", "==", Number(snapshot.data().stateId))
        .where("statusId", "==", 1)
        .get();

      const list = snapshot2.docs.map((doc) => {
        return doc.data();
      });

      list.forEach((item) => {
        item.createdDate = convertFirebaseDateFormat(item.createdDate);
        item.modifiedDate = convertFirebaseDateFormat(item.modifiedDate);
      });

      res.status(200).json(list);
    } else {
      res.status(400).json({
        errorMessage: "The state is not available.",
      });
    }
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// get state by name
router.get("/state/name/:stateName", async (req, res) => {
  try {
    const stateName = req.params.stateName;

    const snapshot = await db.default.db
      .collection(stateCollectionName)
      .where("name", "==", stateName)
      .where("statusId", "==", 1)
      .get();

    if (snapshot.docs.length > 0) {
      const list = snapshot.docs.map((doc) => {
        return doc.data();
      });

      list.forEach((item) => {
        item.createdDate = convertFirebaseDateFormat(item.createdDate);
        item.modifiedDate = convertFirebaseDateFormat(item.modifiedDate);
      });

      res.status(200).json(list);
    } else {
      res.status(400).json({
        errorMessage: "The state is not found.",
      });
    }
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

// get city by name
router.get("/city/name/:cityName", async (req, res) => {
  try {
    const cityName = req.params.cityName;

    const snapshot = await db.default.db
      .collection(cityCollectionName)
      .where("name", "==", cityName)
      .where("statusId", "==", 1)
      .get();

    if (snapshot.docs.length > 0) {
      const list = snapshot.docs.map((doc) => {
        return doc.data();
      });

      list.forEach((item) => {
        item.createdDate = convertFirebaseDateFormat(item.createdDate);
        item.modifiedDate = convertFirebaseDateFormat(item.modifiedDate);
      });

      res.status(200).json(list);
    } else {
      res.status(400).json({
        errorMessage: "The city is not found.",
      });
    }
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

function convertFirebaseDateFormat(date) {
  return date.toDate();
}

export default router;
