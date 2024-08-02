import config from "./config.js";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const app = initializeApp(config.firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);

export default { db, storage };
