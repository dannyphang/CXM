import { Router } from "express";
import express from "express";
const router = Router();
import * as func from "../shared/function.js";
import * as generalImp from "../implementation/general.js";
import * as API from "../shared/service.js";

router.use(express.json());

router.get("/ping", async (req, res) => {
    try {
        generalImp
            .getSingleProperty()
            .then((property) => {
                res.status(200).json(
                    func.responseModel({
                        data: property,
                        responseMessage: "pong",
                    })
                );
            })
            .catch((error) => {
                if (error) {
                    API.createLog(error, req, res, 500, "general");
                    res.status(500).json(
                        func.responseModel({
                            isSuccess: false,
                            responseMessage: error,
                        })
                    );
                }
            });
    } catch (error) {
        console.log("error", error);
        API.createLog(error, req, res, 500, "general");
        res.status(500).json(
            func.responseModel({
                isSuccess: false,
                responseMessage: error,
            })
        );
    }
});

export default router;
