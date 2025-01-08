import { Router } from "express";
import express from "express";
const router = Router();
import * as func from "../shared/function.js";
import * as assoImp from "../implementation/association.js";

router.use(express.json());

// add association
router.post("/add", async (req, res) => {
    const body = req.body.asso;

    try {
        assoImp
            .createAssociation({
                associate: body,
            })
            .then((list) => {
                res.status(200).json(func.responseModel({ data: list }));
            })
            .catch((error) => {
                console.log(error);
                res.status(400).json(
                    func.responseModel({
                        isSuccess: false,
                        responseMessage: error,
                    })
                );
            });
    } catch (error) {
        console.log(error);
        res.status(400).json(
            func.responseModel({
                isSuccess: false,
                responseMessage: error,
            })
        );
    }
});

// remove asso
router.put("/removeAsso", async (req, res) => {
    try {
        const data = func.body(req).data.data;
        const userId = func.body(req).userId;

        assoImp
            .removeAssociation({
                data: data,
                userId: userId,
            })
            .then((_) => {
                res.status(200).json(func.responseModel({ data: null }));
            })
            .catch((errorNotFound) => {
                func.responseModel({
                    isSuccess: false,
                    responseMessage: errorNotFound,
                });
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

export default router;
