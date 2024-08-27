import { Router } from "express";
const router = Router();
import * as firebase from "../firebase.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  uploadString,
} from "firebase/storage";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fieldSize: 25 * 1024 * 1024 },
}).single("file");

const bucket = firebase.default.bucket;

// upload files
router.post("/file", upload, async (req, res) => {
  try {
    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }
    const storageRef = ref(
      firebase.default.storage,
      `${req.body.folderName}/${req.file.originalname}`
    );
    uploadBytes(storageRef, req.file).then((up) => {
      getDownloadURL(storageRef).then((url) => {
        res.status(200).json({
          file: req.file,
          downloadUrl: url,
          metadata: up.metadata,
        });
      });
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post("/filelist", async (req, res) => {
  listAll(storageRef).then((listRes) => {});
});

export default router;
