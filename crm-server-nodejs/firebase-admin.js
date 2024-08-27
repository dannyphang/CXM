import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import config from "./config.js";

initializeApp({
  credential: cert("./crm-service-acc-key.json"),
  storageBucket: config.firebaseConfig.storageBucket,
});

const db = getFirestore();
const bucket = getStorage().bucket();

export default { db, bucket };
