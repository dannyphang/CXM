import { Router } from "express";
import express from "express";
const router = Router();
import * as func from "../shared/function.js";
import * as attachmentImp from "../implementation/attachment.js";
import multer from "multer";
import * as API from "../shared/service.js";
import * as lang from "../shared/constant/language.js";

router.use(express.json());

const logModule = "attachment";

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
                        responseMessage: lang.UPLOADED_SUCCESSFULLY,
                    })
                );
            })
            .catch((error) => {
                console.log("error", error);
                API.createLog(error, req, res, 500, logModule);
                res.status(500).json(
                    func.responseModel({
                        isSuccess: false,
                        responseMessage: error,
                    })
                );
            });
    } catch (error) {
        console.log("error", error);
        API.createLog(error, req, res, 500, logModule);
        res.status(500).json(
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
                res.status(200).json(func.responseModel({ data: data, responseMessage: lang.UPLOADED_SUCCESSFULLY }));
            })
            .catch((error) => {
                API.createLog(error, req, res, 500, logModule);
                res.status(500).json(
                    func.responseModel({
                        isSuccess: false,
                        responseMessage: error,
                    })
                );
            });
    } catch (error) {
        console.log(error);
        API.createLog(error, req, res, 500, logModule);
        res.status(500).json(
            func.responseModel({
                isSuccess: false,
                responseMessage: error,
            })
        );
    }
});

// get all attachment by profile uid
router.get("/", async (req, res) => {
    try {
        const module = func.body(req).headers.module;
        const profileUid = func.body(req).headers.profileuid;
        attachmentImp
            .getAttachmentByProfileId({ module: module, profileUid: profileUid })
            .then((data) => {
                res.status(200).json(func.responseModel({ data: data }));
            })
            .catch((error) => {
                API.createLog(error, req, res, 500, logModule);
                res.status(500).json(
                    func.responseModel({
                        isSuccess: false,
                        responseMessage: error,
                    })
                );
            });
    } catch (error) {
        console.log(error);
        API.createLog(error, req, res, 500, logModule);
        res.status(500).json(
            func.responseModel({
                isSuccess: false,
                responseMessage: error,
            })
        );
    }
});

// delete attachment
router.put("/remove", async (req, res) => {
    try {
        const attachmentList = func.body(req).data.attachmentList;
        const userId = func.body(req).userId;

        attachmentImp
            .removeAttachment({ attachmentList: attachmentList, userId: userId })
            .then((data) => {
                res.status(200).json(func.responseModel({ data: data, responseMessage: lang.ATTACTMENT_DELETED_SUCCESSFULLY }));
            })
            .catch((error) => {
                API.createLog(error, req, res, 500, logModule);
                res.status(500).json(
                    func.responseModel({
                        isSuccess: false,
                        responseMessage: error,
                    })
                );
            });
    } catch (error) {
        console.log(error);
        API.createLog(error, req, res, 500, logModule);
        res.status(500).json(
            func.responseModel({
                isSuccess: false,
                responseMessage: error,
            })
        );
    }
});

export default router;
