import { Router } from "express";
const router = Router();
import * as firebase from "../firebase.js";
import { ref, uploadBytes, getDownloadURL, listAll, uploadString } from "firebase/storage";
import multer from "multer";
import { Bucket } from "@google-cloud/storage";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fieldSize: 25 * 1024 * 1024 },
}).single("file");
const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fieldSize: 25 * 1024 * 1024 },
}).single("image");

// const bucket = firebase.default.storage.bucket();

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

// upload profile image
router.post("/image", uploadImage, async (req, res) => {
  console.log(req.body);
  try {
    let imgFile = req.file;
    let blobImgFile = req.body.imageBlob;
    // console.log(imgFile);

    // const storageRef = ref(
    //   firebase.default.storage,
    //   `${req.body.folderName}${imgFile.originalname}`
    // );

    // let bucket = Bucket(storageRef)
    // console.log(bucket);

    if (imgFile == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }

    const metadata = {
      contentType: imgFile.mimetype,
    };

    // const blob = bucket.file(imgFile.originalname);
    // console.log(blob);
    // const blobStream = blob.createWriteStream({
    //   metadata: metadata,
    //   gzip: true,
    // });
    // console.log(blobStream);
    // blobStream.on("error", (err) => {
    //   console.log(err);
    //   return res.status(500).send({ message: err });
    // });

    // blobStream.on("finish", async () => {
    //   const downloadUrl = await getDownloadURL(blob);
    //   return res.status(201).send({
    //     file: req.file,
    //     type: req.file.mimetype,
    //     downloadURL: downloadUrl,
    //   });
    // });

    const storageRef = ref(
      firebase.default.storage,
      `${req.body.folderName}${imgFile.originalname}`
    );

    uploadBytes(storageRef, blobImgFile, metadata).then((up) => {
      console.log(up);
      getDownloadURL(storageRef).then((url) => {
        res.status(200).json({
          file: req.file,
          downloadUrl: url,
          metadata: up.metadata,
        });
      });
    });

    // blobStream.end(req.file.buffer);
  } catch (err) {
    res.status(401).json(err);
  }
});

export default router;
