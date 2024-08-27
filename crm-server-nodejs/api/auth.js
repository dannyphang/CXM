import { Router } from "express";
import express from "express";
const router = Router();
import * as firebase from "../firebase-admin.js";
import pkg from "firebase-admin";
const { auth } = pkg;

router.use(express.json());

const listAllUsers = async (nextPageToken) => {
  try {
    const listUsersResult = await auth(db.default.app).listUsers(
      1000,
      nextPageToken
    );
    if (listUsersResult.pageToken) {
      // List next batch of users.
      listAllUsers(listUsersResult.pageToken);
    }
  } catch (error) {
    console.log("Error listing users:", error);
  }
};

router.get("/allUser", async (req, res) => {
  try {
    let list = await firebase.default.auth.listUsers();
    res.status(200).json(list);
  } catch (error) {
    console.log("Error listing users:", error);
  }
});

export default router;
