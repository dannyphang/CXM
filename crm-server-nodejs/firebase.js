import config from "./config.js";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const app = initializeApp(config.firebaseConfig);

const db = getFirestore(app);

export default db;
