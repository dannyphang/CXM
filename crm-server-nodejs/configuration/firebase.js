import config from "./config.js";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { initializeApp } from "firebase-admin/app";

const app = initializeApp(config.firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);

export default { app, db, storage };
