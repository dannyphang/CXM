import { Router } from "express";
import express from "express";
const router = Router();
import * as db from "../firebase-admin.js";
import pkg from "firebase-admin";
import responseModel from "./shared.js";

router.use(express.json());

const propertiesCollection = "properties";
const propertiesLookupCollection = "propertiesLookup";
const moduleCodeCollection = "moduleCode";
const associationCollection = "association";

// get all properties
router.get("/" + propertiesCollection, async (req, res) => {
  try {
    let snapshot = await db.default.db
      .collection(propertiesCollection)
      .where("statusId", "==", 1)
      .orderBy("propertyId")
      .get();

    const list = snapshot.docs.map((doc) => doc.data());

    res.status(200).json(responseModel({ data: list }));
  } catch (error) {
    console.log("error", error);
    res.status(400).json(
      responseModel({
        isSuccess: false,
        responseMessage: error,
      })
    );
  }
});

// get all properties with lookup by module
router.get("/" + propertiesCollection + "/module", async (req, res) => {
  const moduleCode = req.headers.modulecode;

  try {
    const snapshot = await db.default.db
      .collection(propertiesCollection)
      .where("moduleCode", "==", moduleCode)
      .where("statusId", "==", 1)
      .orderBy("order")
      .get();
    const snapshotModule = await db.default.db
      .collection(moduleCodeCollection)
      .where("moduleSubCode", "==", moduleCode)
      .where("statusId", "==", 1)
      .get();
    const snapshotPL = await db.default.db
      .collection(propertiesLookupCollection)
      .where("moduleCode", "==", moduleCode)
      .where("statusId", "==", 1)
      .get();

    const propertyList = snapshot.docs.map((doc) => doc.data());
    const moduleList = snapshotModule.docs.map((doc) => doc.data());
    const propertyLookupList = snapshotPL.docs.map((doc) => doc.data());

    let list = await db.default.auth.listUsers();

    // add default value: SYSTEM
    list.users.push({
      uid: "SYSTEM",
      displayName: "SYSTEM",
    });

    for (let i = 0; i < propertyList.length; i++) {
      propertyList[i].propertyLookupList = [];

      propertyList[i].createdDate = convertFirebaseDateFormat(
        propertyList[i].createdDate
      );
      propertyList[i].modifiedDate = convertFirebaseDateFormat(
        propertyList[i].modifiedDate
      );

      // assign user list into lookup property
      if (propertyList[i].propertyType === "USR") {
        propertyList[i].propertyLookupList = list.users;
      }

      for (let j = 0; j < propertyLookupList.length; j++) {
        if (propertyList[i].propertyId === propertyLookupList[j].propertyId) {
          propertyLookupList[j].createdDate = convertFirebaseDateFormat(
            propertyLookupList[j].createdDate
          );
          propertyLookupList[i].modifiedDate = convertFirebaseDateFormat(
            propertyLookupList[j].modifiedDate
          );
          propertyList[i].propertyLookupList.push(propertyLookupList[j]);
        }
        if (propertyList[i].propertyType === "CBX_S") {
          if (propertyLookupList[j].propertyLookupCode === "true") {
            propertyLookupList[j].createdDate = convertFirebaseDateFormat(
              propertyLookupList[j].createdDate
            );
            propertyLookupList[j].modifiedDate = convertFirebaseDateFormat(
              propertyLookupList[j].modifiedDate
            );
            propertyList[i].propertyLookupList.push(propertyLookupList[j]);
          } else if (propertyLookupList[j].propertyLookupCode === "false") {
            propertyLookupList[j].createdDate = convertFirebaseDateFormat(
              propertyLookupList[j].createdDate
            );
            propertyLookupList[j].modifiedDate = convertFirebaseDateFormat(
              propertyLookupList[j].modifiedDate
            );
            propertyList[i].propertyLookupList.push(propertyLookupList[j]);
          }
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

    res.status(200).json(responseModel({ data: moduleList }));
  } catch (error) {
    console.log("error", error);
    res.status(400).json(
      responseModel({
        isSuccess: false,
        responseMessage: error,
      })
    );
  }
});

// get all properties with lookup by module for create contact/company profile
router.get("/" + propertiesCollection + "/module/create", async (req, res) => {
  const moduleCode = req.headers.modulecode;

  try {
    const snapshot = await db.default.db
      .collection(propertiesCollection)
      .where("moduleCode", "==", moduleCode)
      .where("statusId", "==", 1)
      .where("isMandatory", "==", true)
      .where("isEditable", "==", true)
      .orderBy("order")
      .get();
    const snapshotModule = await db.default.db
      .collection(moduleCodeCollection)
      .where("moduleSubCode", "==", moduleCode)
      .where("statusId", "==", 1)
      .get();
    const snapshotPL = await db.default.db
      .collection(propertiesLookupCollection)
      .where("moduleCode", "==", moduleCode)
      .where("statusId", "==", 1)
      .get();
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

    res.status(200).json(responseModel({ data: moduleList }));
  } catch (error) {
    console.log("error", error);
    res.status(400).json(
      responseModel({
        isSuccess: false,
        responseMessage: error,
      })
    );
  }
});

// create properties
router.post("/" + propertiesCollection, async (req, res) => {
  const list = JSON.parse(JSON.stringify(req.body));

  try {
    const createDoc = [];

    list.forEach(async (prop, index) => {
      // get max value of propertyId
      const snapshot = await db.default.db
        .collection(propertiesCollection)
        .orderBy("propertyId", "desc")
        .limit(1)
        .get();

      let newId =
        (snapshot.docs.map((doc) => doc.data())[0].propertyId ?? 0) + 1;

      let newRef = db.default.db.collection(propertiesCollection).doc();
      prop.propertyId = newId;
      prop.uid = newRef.id;
      prop.order = newId;
      prop.createdDate = new Date();
      prop.modifiedDate = new Date();

      createDoc.push(prop);

      await newRef.set(prop);
      if (index === list.length - 1) {
        res.status(200).json(
          responseModel({
            data: createDoc,
            responseMessage: `Created ${list.length} record(s) successfully.`,
          })
        );
      }
    });
  } catch (error) {
    console.log(error);
    res.status(400).json(
      responseModel({
        isSuccess: false,
        responseMessage: error,
      })
    );
  }
});

// update properties
router.put("/" + propertiesCollection + "/update", async (req, res) => {
  try {
    req.body.propertyList.forEach(async (prop) => {
      let newRef = db.default.db.collection(propertiesCollection).doc(prop.uid);

      await newRef.update({
        prop,
        modifiedDate: new Date(),
        modifiedBy: req.body.user,
      });
    });

    res
      .status(200)
      .json(responseModel({ responseMessage: "Updated successfully" }));
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

// delete properties
router.put("/" + propertiesCollection + "/delete", async (req, res) => {
  try {
    req.body.propertyList.forEach(async (prop) => {
      let newRef = db.default.db.collection(propertiesCollection).doc(prop.uid);

      await newRef.update({
        statusId: 2,
        modifiedDate: new Date(),
        modifiedBy: req.body.user,
      });
    });

    res
      .status(200)
      .json(responseModel({ responseMessage: "Deleted successfully" }));
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

// get all properties lookup
router.get("/" + propertiesLookupCollection, async (req, res) => {
  try {
    const snapshot = await db.default.db
      .collection(propertiesLookupCollection)
      .where("statusId", "==", 1)
      .orderBy("propertityLookupId")
      .get();
    const list = snapshot.docs.map((doc) => doc.data());

    res.status(200).json(responseModel({ data: list }));
  } catch (error) {
    console.log("error", error);
    res.status(400).json(
      responseModel({
        isSuccess: false,
        responseMessage: error,
      })
    );
  }
});

// create properties lookup
router.post("/" + propertiesLookupCollection, async (req, res) => {
  const list = JSON.parse(JSON.stringify(req.body));

  try {
    const createDoc = [];

    list.forEach(async (prop, index) => {
      // get max value of propertyLookupId
      const snapshot = await db.default.db
        .collection(propertiesLookupCollection)
        .orderBy("propertyLookupId", "desc")
        .limit(1)
        .get();

      let newId =
        (snapshot.docs.map((doc) => doc.data())[0].propertyLookupId ?? 0) + 1;

      let newRef = db.default.db.collection(propertiesLookupCollection).doc();
      prop.uid = newRef.id;
      prop.propertyLookupId = newId;
      prop.createdDate = new Date();
      prop.modifiedDate = new Date();

      createDoc.push(prop);

      await newRef.set(prop);

      if (index === list.length - 1) {
        res.status(200).json(
          responseModel({
            data: createDoc,
            responseMessage: `Created ${list.length} record(s) successfully.`,
          })
        );
      }
    });
  } catch (error) {
    console.log(error);
    res.status(400).json(
      responseModel({
        isSuccess: false,
        responseMessage: error,
      })
    );
  }
});

// update properties lookup
router.put("/" + propertiesCollection + "/update", async (req, res) => {
  try {
    req.body.propertyList.forEach(async (prop) => {
      let newRef = db.default.db
        .collection(propertiesLookupCollection)
        .doc(prop.uid);

      await newRef.update({
        prop,
        modifiedDate: new Date(),
        modifiedBy: req.body.user,
      });
    });

    res
      .status(200)
      .json(responseModel({ responseMessage: "Updated successfully" }));
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

// get all module code
router.get("/" + moduleCodeCollection, async (req, res) => {
  try {
    const snapshot = await db.default.db
      .collection(moduleCodeCollection)
      .where("statusId", "==", 1)
      .orderBy("moduleId")
      .get();

    const list = snapshot.docs.map((doc) => doc.data());

    res.status(200).json(responseModel({ data: list }));
  } catch (error) {
    console.log("error", error);
    res.status(400).json(
      responseModel({
        isSuccess: false,
        responseMessage: error,
      })
    );
  }
});

// get module code by module type
router.get("/" + moduleCodeCollection + "/moduleType", async (req, res) => {
  try {
    const moduleType = req.headers.moduletype;

    const snapshot = await db.default.db
      .collection(moduleCodeCollection)
      .where("statusId", "==", 1)
      .where("moduleType", "==", moduleType)
      .orderBy("moduleId")
      .get();

    const list = snapshot.docs.map((doc) => doc.data());

    res.status(200).json(responseModel({ data: list }));
  } catch (error) {
    console.log("error", error);
    res.status(400).json(
      responseModel({
        isSuccess: false,
        responseMessage: error,
      })
    );
  }
});

// get module code by module type
router.get("/" + moduleCodeCollection + "/subModule/code", async (req, res) => {
  try {
    const submoduleCode = req.headers.submodulecode;

    const snapshot = await db.default.db
      .collection(moduleCodeCollection)
      .where("statusId", "==", 1)
      .where("moduleType", "==", "SUBMODULE")
      .where("moduleSubCode", "==", submoduleCode)
      .orderBy("moduleId")
      .get();

    const list = snapshot.docs.map((doc) => doc.data());

    res.status(200).json(responseModel({ data: list }));
  } catch (error) {
    console.log("error", error);
    res.status(400).json(
      responseModel({
        isSuccess: false,
        responseMessage: error,
      })
    );
  }
});

// get all activities code by module code
router.get("/activityModule", async (req, res) => {
  try {
    const snapshot = db.default.db
      .collection(moduleCodeCollection)
      .where("moduleType", "==", "ACTIVITY_TYPE")
      .where("statusId", "==", 1)
      .orderBy("moduleId")
      .get();
    const actCtrSnapshot = db.default.db
      .collection(moduleCodeCollection)
      .where("moduleType", "==", "ACTIVITY_CONTROL")
      .where("statusId", "==", 1)
      .orderBy("moduleId")
      .get();
    const subActCtrSnapshot = db.default.db
      .collection(moduleCodeCollection)
      .where("moduleType", "==", "SUB_ACTIVITY_CONTROL")
      .where("statusId", "==", 1)
      .get();

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

    res.status(200).json(
      responseModel({
        data: {
          activityModuleList,
          activityControlList,
        },
      })
    );
  } catch (error) {
    console.log("error", error);
    res.status(400).json(
      responseModel({
        isSuccess: false,
        responseMessage: error,
      })
    );
  }
});

// create module code
router.post("/" + moduleCodeCollection, async (req, res) => {
  const list = JSON.parse(JSON.stringify(req.body));

  try {
    const createDoc = [];

    list.forEach(async (prop) => {
      let newRef = db.default.db.collection(moduleCodeCollection).doc();
      prop.uid = newRef.id;
      prop.createdDate = new Date();
      prop.modifiedDate = new Date();

      createDoc.push(prop);

      await newRef.set(prop);
    });

    res.status(200).json(responseModel({ data: createDoc }));
  } catch (error) {
    console.log(error);
    res.status(400).json(
      responseModel({
        isSuccess: false,
        responseMessage: error,
      })
    );
  }
});

function convertFirebaseDateFormat(date) {
  try {
    return date ? date.toDate() : date;
  } catch {
    return;
  }
}

router.post("/asso", async (req, res) => {
  const body = req.body.asso;
  console.log(body);
  try {
    const createDoc = [];
    if (body.module === "CONT") {
      body.companyAssoList.forEach((comp) => {
        let asso = {
          uid: doc(collection(db.default.db, associationCollection)).id,
          createdDate: new Date(),
          modifiedDate: new Date(),
          module: body.module,
          profileUid: body.profileUid,
          assoProfileUid: comp,
          statusId: 1,
        };

        createDoc.push(asso);
        new setDoc(doc(db.default.db, associationCollection, asso.uid), asso);
        console.log(asso);
      });
    } else if (body.module === "COMP") {
      body.contactAssoList.forEach((cont) => {
        let asso = {
          uid: doc(collection(db.default.db, associationCollection)).id,
          createdDate: new Date(),
          modifiedDate: new Date(),
          module: body.module,
          profileUid: body.profileUid,
          assoProfileUid: cont,
          statusId: 1,
        };

        createDoc.push(asso);
        new setDoc(doc(db.default.db, associationCollection, asso.uid), asso);
        console.log(asso);
      });
    }

    res.status(200).json(responseModel({ data: createDoc }));
  } catch (error) {
    console.log(error);
    res.status(400).json(
      responseModel({
        isSuccess: false,
        responseMessage: error,
      })
    );
  }
});

export default router;
