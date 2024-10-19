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
import responseModel from "../shared/function.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fieldSize: 25 * 1024 * 1024 },
}).single("file");

// upload files
router.post("/file", upload, async (req, res) => {
  try {
    if (req.file == undefined) {
      return res.status(400).json(
        responseModel({
          isSuccess: false,
          responseMessage: "Please upload a file!",
        })
      );
    }
    const storageRef = ref(
      firebase.default.storage,
      `${req.body.folderName}/${req.file.originalname}`
    );
    uploadBytes(storageRef, req.file).then((up) => {
      getDownloadURL(storageRef).then((url) => {
        res.status(200).json(
          responseModel({
            data: {
              file: req.file,
              downloadUrl: url,
              metadata: up.metadata,
            },
          })
        );
      });
    });
  } catch (err) {
    console.log(error);
    res.status(400).json(
      responseModel({
        isSuccess: false,
        responseMessage: error,
      })
    );
  }
});

router.post("/filelist", async (req, res) => {
  listAll(storageRef).then((listRes) => {});
});

export default router;
