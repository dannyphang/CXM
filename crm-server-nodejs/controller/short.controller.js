import { Router } from "express";
import express from "express";
const router = Router();
import * as func from "../shared/function.js";
import * as shortImp from "../implementation/short.js";
import * as API from "../shared/service.js";

router.use(express.json());

const logModule = "urlShortener";

// Shorten a URL
router.post("/", async (req, res) => {
    try {
        const url = func.body(req).data.url;
        const expiry = func.body(req).data.expiry;
        const password = func.body(req).data.password;
        shortImp
            .createShortenUrl({ url: url, expiry: expiry, password: password })
            .then((shortUrl) => {
                res.status(200).json(func.responseModel({ data: shortUrl }));
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

// Get a shortened URL
router.get("/url", async (req, res) => {
    try {
        const path = func.body(req).headers.path;
        shortImp
            .getShortenUrl({ path: path, useragent: req.useragent, ip: req.ip })
            .then((shortUrl) => {
                res.status(200).json(func.responseModel({ data: shortUrl }));
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

// Get a shortened URL
router.get("/all", async (req, res) => {
    try {
        shortImp
            .getAllUrl()
            .then((shortUrl) => {
                res.status(200).json(func.responseModel({ data: shortUrl }));
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

// Get a shortened URL
router.get("/title", async (req, res) => {
    try {
        shortImp
            .getTitle({ url: func.body(req).headers.url })
            .then((title) => {
                res.status(200).json(func.responseModel({ data: title }));
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

// check password URL
router.get("/check-password", async (req, res) => {
    try {
        const uid = func.body(req).headers.uid;
        const password = func.body(req).headers.password;

        shortImp
            .checkUrlPassword({ uid: uid, password: password })
            .then((isMatch) => {
                res.status(200).json(func.responseModel({ data: isMatch }));
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

export default router;
