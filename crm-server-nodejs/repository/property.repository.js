import * as firebase from "../configuration/firebase-admin.js";
import { Filter } from "firebase-admin/firestore";
import { DEFAULT_SYSTEM_TENANT } from "../shared/constant.js";
import { supabase } from "../configuration/supabase.js";

const propertiesCollection = "properties";
const propertiesLookupCollection = "propertiesLookup";
const moduleCodeCollection = "moduleCode";
const propertyTable = "properties";

function getSingleProperty() {
  return new Promise(async (resolve, reject) => {
    try {
      const { data, error } = await supabase.from(propertyTable).select("*").limit(1).single();
      if (error) {
        if (!data) {
          reject("Data not found");
        }
        reject(error);
      } else {
        resolve(data);
      }
    } catch (error) {
      reject(error);
    }
  });
}

function getAllModuleByModuleType({ tenantId, moduleType }) {
  return new Promise(async (resolve, reject) => {
    try {
      const snapshot = await firebase.db
        .collection(moduleCodeCollection)
        // .where(Filter.or(Filter.where("tenantId", "==", tenantId), Filter.where("tenantId", "==", DEFAULT_SYSTEM_TENANT)))
        .where("statusId", "==", 1)
        .where("moduleType", "==", moduleType)
        .orderBy("moduleId")
        .get();

      const list = snapshot.docs.map((doc) => doc.data());
      resolve(list);
    } catch (error) {
      reject(error);
    }
  });
}

function getAllModuleBySubModule({ tenantId, subModuleCode }) {
  return new Promise(async (resolve, reject) => {
    try {
      const snapshot = await firebase.db
        .collection(moduleCodeCollection)
        // .where(Filter.or(Filter.where("tenantId", "==", tenantId), Filter.where("tenantId", "==", DEFAULT_SYSTEM_TENANT)))
        .where("statusId", "==", 1)
        .where("moduleType", "==", "SUBMODULE")
        .where("moduleSubCode", "==", subModuleCode)
        .orderBy("moduleId")
        .get();

      const list = snapshot.docs.map((doc) => doc.data());
      resolve(list);
    } catch (error) {
      reject(error);
    }
  });
}

function createModule({ module }) {
  return new Promise(async (resolve, reject) => {
    try {
      let newRef = firebase.db.collection(moduleCodeCollection).doc();
      module.uid = newRef.id;

      await newRef.set(module);
      resolve(module);
    } catch (error) {
      reject(error);
    }
  });
}

function getAllPropertiesByModule({ moduleCode, tenantId }) {
  return new Promise(async (resolve, reject) => {
    try {
      const snapshot = await firebase.db
        .collection(propertiesCollection)
        .where("moduleCode", "==", moduleCode)
        .where("statusId", "==", 1)
        .where(
          Filter.or(
            Filter.where("tenantId", "==", tenantId),
            Filter.where("tenantId", "==", DEFAULT_SYSTEM_TENANT)
          )
        )
        .orderBy("order")
        .get();

      const propertyList = snapshot.docs.map((doc) => doc.data());

      resolve(propertyList);
    } catch (error) {
      reject(error);
    }
  });
}

function getModuleByModuleType({ moduleType }) {
  return new Promise(async (resolve, reject) => {
    try {
      const snapshotModule = await firebase.db
        .collection(moduleCodeCollection)
        .where("moduleType", "==", moduleType)
        .where("statusId", "==", 1)
        .orderBy("moduleId")
        .get();

      const moduleList = snapshotModule.docs.map((doc) => doc.data());

      resolve(moduleList);
    } catch (error) {
      reject(error);
    }
  });
}

function getAllModuleSub({ moduleCode }) {
  return new Promise(async (resolve, reject) => {
    try {
      const snapshotModule = await firebase.db
        .collection(moduleCodeCollection)
        .where("moduleSubCode", "==", moduleCode)
        .where("statusId", "==", 1)
        .get();

      const moduleList = snapshotModule.docs.map((doc) => doc.data());

      resolve(moduleList);
    } catch (error) {
      reject(error);
    }
  });
}

function getAllPropertyLookUpList({ moduleCode }) {
  return new Promise(async (resolve, reject) => {
    try {
      const snapshotPL = await firebase.db
        .collection(propertiesLookupCollection)
        .where("moduleCode", "==", moduleCode)
        .where("statusId", "==", 1)
        .get();
      const propertyLookupList = snapshotPL.docs.map((doc) => doc.data());
      resolve(propertyLookupList);
    } catch (error) {
      reject(error);
    }
  });
}

function createProperty({ property }) {
  return new Promise(async (resolve, reject) => {
    try {
      const snapshot = await firebase.db
        .collection(propertiesCollection)
        .orderBy("propertyId", "desc")
        .limit(1)
        .get();

      let newId = (snapshot.docs.map((doc) => doc.data())[0].propertyId ?? 0) + 1;

      let newRef = firebase.db.collection(propertiesCollection).doc();
      property.propertyId = newId;
      property.uid = newRef.id;
      property.order = newId;

      await newRef.set(property);
      resolve(property);
    } catch (error) {
      reject(error);
    }
  });
}

function updateProperty({ property }) {
  return new Promise(async (resolve, reject) => {
    try {
      let newRef = firebase.db.collection(propertiesCollection).doc(property.uid);

      await newRef.update(property);
      resolve(property);
    } catch (error) {
      reject(error);
    }
  });
}

function createPropertyLookUp({ property }) {
  return new Promise(async (resolve, reject) => {
    try {
      const snapshot = await firebase.db
        .collection(propertiesLookupCollection)
        .orderBy("propertyLookupId", "desc")
        .limit(1)
        .get();

      let newId = (snapshot.docs.map((doc) => doc.data())[0].propertyLookupId ?? 0) + 1;

      let newRef = firebase.db.collection(propertiesLookupCollection).doc();
      property.propertyLookupId = newId;
      property.uid = newRef.id;

      await newRef.set(property);
      resolve(property);
    } catch (error) {
      reject(error);
    }
  });
}

function updatePropertyLookUp({ property }) {
  return new Promise(async (resolve, reject) => {
    try {
      let newRef = firebase.db.collection(propertiesLookupCollection).doc(property.uid);

      await newRef.update(property);
      resolve(property);
    } catch (error) {
      reject(error);
    }
  });
}

function getActivityModuleList() {
  return new Promise(async (resolve, reject) => {
    try {
      const snapshot = firebase.db
        .collection(moduleCodeCollection)
        .where("moduleType", "==", "ACTIVITY_TYPE")
        .where("statusId", "==", 1)
        .orderBy("moduleId")
        .get();

      const activityModuleList = snapshot.docs.map((doc) => doc.data());

      resolve(activityModuleList);
    } catch (error) {
      reject(error);
    }
  });
}

function getActivityControlList() {
  return new Promise(async (resolve, reject) => {
    try {
      const snapshot = firebase.db
        .collection(moduleCodeCollection)
        .where("moduleType", "==", "ACTIVITY_CONTROL")
        .where("statusId", "==", 1)
        .orderBy("moduleId")
        .get();

      const activityControlList = snapshot.docs.map((doc) => doc.data());

      resolve(activityControlList);
    } catch (error) {
      reject(error);
    }
  });
}

function getActivitySubControlList() {
  return new Promise(async (resolve, reject) => {
    try {
      const snapshot = firebase.db
        .collection(moduleCodeCollection)
        .where("moduleType", "==", "SUB_ACTIVITY_CONTROL")
        .where("statusId", "==", 1)
        .get();

      const subActivityControlList = snapshot.docs.map((doc) => doc.data());

      resolve(subActivityControlList);
    } catch (error) {
      reject(error);
    }
  });
}

export {
  getSingleProperty,
  getAllModuleByModuleType,
  getAllModuleBySubModule,
  createModule,
  getAllPropertiesByModule,
  getModuleByModuleType,
  getAllModuleSub,
  getAllPropertyLookUpList,
  createProperty,
  updateProperty,
  createPropertyLookUp,
  updatePropertyLookUp,
  getActivityModuleList,
  getActivityControlList,
  getActivitySubControlList,
};
