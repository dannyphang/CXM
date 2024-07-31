import { Router } from "express";
import express from "express";
const router = Router();
import * as firebase from "../firebase.js";
import { ref, uploadBytes } from "firebase/storage";
import multer from "multer";

// Setting up multer as a middleware to grab photo uploads
const upload = multer({ storage: multer.memoryStorage() }).single("file");

// const bucket = storage.default.storage.bucket();
// const storageRef = ref(firebase.default.storage, 'some-child');

router.post("/file", upload, async (req, res) => {
  try {
    // new uploadBytes(storageRef, )
    console.log(req.body);
    res.status(200).json(req.body);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

export default router;
