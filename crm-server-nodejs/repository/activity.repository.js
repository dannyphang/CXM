import * as firebase from "../configuration/firebase-admin.js";
import { Filter } from "firebase-admin/firestore";

const activityCollection = "activity";

// get all activities by profile id
function getAllActivityByProfileId({ tenantId, profileUid }) {
  return new Promise(async (resolve, reject) => {
    const snapshot = await firebase.db
      .collection(activityCollection)
      .where(
        Filter.or(
          Filter.where("activityContactedIdList", "array-contains", profileUid),
          Filter.where("associationContactUidList", "array-contains", profileUid),
          Filter.where("associationCompanyUidList", "array-contains", profileUid)
        )
      )
      .where("statusId", "==", 1)
      .where("tenantId", "==", tenantId)
      .orderBy("modifiedDate", "desc")
      .get();

    const list = snapshot.docs.map((doc) => doc.data());
    resolve(list);
  });
}

function createActivity({ activity }) {
  return new Promise(async (resolve, reject) => {
    let newRef = firebase.db.collection(activityCollection).doc();
    activity.uid = newRef.id;
    await newRef.set(activity);
    resolve(activity);
  });
}

function updateActivity({ activity }) {
  return new Promise(async (resolve, reject) => {
    try {
      let actRef = firebase.db.collection(activityCollection).doc(activity.uid);

      await actRef.update(activity);

      resolve(activity);
    } catch (error) {
      reject(error);
    }
  });
}

export { getAllActivityByProfileId, createActivity, updateActivity };
