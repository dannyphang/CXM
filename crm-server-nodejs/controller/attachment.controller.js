import { Router } from "express";
import express from "express";
const router = Router();
import * as func from "../shared/function.js";
import * as attachmentImp from "../implementation/attachment.js";
import multer from "multer";

router.use(express.json());

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fieldSize: 25 * 1024 * 1024 },
}).single("file");

router.post("/file", upload, async (req, res) => {
    try {
        attachmentImp
            .uploadFile({
                folderName: func.body(req).data.folderName,
                fileOriginalname: req.file.originalname,
                file: req.file,
            })
            .then((data) => {
                res.status(200).json(
                    func.responseModel({
                        data: data,
                    })
                );
            })
            .catch((error) => {
                console.log("error", error);
                res.status(400).json(
                    func.responseModel({
                        isSuccess: false,
                        responseMessage: error,
                    })
                );
            });
    } catch (error) {
        console.log("error", error);
        res.status(400).json(
            func.responseModel({
                isSuccess: false,
                responseMessage: error,
            })
        );
    }
});

// upload attachment to activity
router.post("/upload", async (req, res) => {
    try {
        const list = JSON.parse(JSON.stringify(func.body(req).data.attachmentList));

        attachmentImp
            .uploadAttachment({
                userId: func.body(req).userId,
                attachmentList: list,
            })
            .then((data) => {
                res.status(200).json(func.responseModel({ data: data }));
            });
    } catch (error) {
        console.log(error);
        func.responseModel({
            isSuccess: false,
            responseMessage: error,
        });
    }
});

export default router;
