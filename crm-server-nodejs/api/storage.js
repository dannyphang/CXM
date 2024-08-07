import { Router } from "express";
const router = Router();
import * as firebase from "../firebase.js";
import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() }).single("file");
const uploadImage = multer({ storage: multer.memoryStorage() }).single("image");

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
  try {
    let imgFile = req.file;

    // console.log(req);
    // return res.status(400).json(imgFile);
    if (imgFile == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }
    // let getFileBlob = function (url, cb) {
    //   return new Promise((resolve, reject) => {
    //     let xhr = new XMLHttpRequest();
    //     xhr.onerror = reject;
    //     xhr.onreadystatechange = () => {
    //       if (xhr.readyState === 4) {
    //         resolve(xhr.response);
    //       }
    //     };
    //     xhr.open("GET", url);
    //     xhr.responseType = "blob"; // convert type
    //     xhr.send();
    //   });
    // };

    const storageRef = ref(
      firebase.default.storage,
      `${req.body.folderName}${imgFile.originalname}`
    );
    uploadBytes(storageRef, req.body.blobFile, {
      contentType: "image/png",
    }).then((up) => {
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

export default router;
