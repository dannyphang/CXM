import { Router } from "express";
import express from "express";
const router = Router();
import config from "../configuration/config.js";

// get token
router.get("/", async (req, res) => {
  try {
    res.status(200).json(config.firebaseConfig);
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
  }
});

export default router;
