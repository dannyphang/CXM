import * as firebase from "../configuration/firebase-admin.js";

const associationCollection = "association";

function getAssociation(data) {
  return new Promise(async (resolve, reject) => {
    const assoSnapshot = await firebase.db
      .collection(associationCollection)
      .where("statusId", "==", 1)
      .where("profileUid", "==", data.uid)
      .where("module", "==", data.module)
      .where("assoProfileUid", "==", data.assoUid)
      .get();

    const assoList = assoSnapshot.docs.map((doc) => {
      return doc.data();
    });

    resolve(assoList);
  });
}

function updateAssociation(associate) {
  return new Promise(async (resolve, reject) => {
    let newRef = firebase.db.collection(associationCollection).doc(associate.uid);
    await newRef.update(associate);
    resolve(associate);
  });
}

function createAssociation(associate) {
  return new Promise(async (resolve, reject) => {
    let newRef = firebase.db.collection(associationCollection).doc();
    associate.uid = newRef.id;
    await newRef.set(associate);

    resolve(associate);
  });
}

export { getAssociation, updateAssociation, createAssociation };
