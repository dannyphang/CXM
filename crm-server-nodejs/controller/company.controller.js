import { Router } from "express";
import express from "express";
const router = Router();
import * as func from "../shared/function.js";
import * as companyImp from "../implementation/company.js";

router.use(express.json());

// get all companies
router.get("/", async (req, res) => {
    let tenantId = func.body(req).tenantId;
    companyImp
        .getAllCompanies({
            tenantId: tenantId,
        })
        .then((companyList) => {
            res.status(200).json(func.responseModel({ data: companyList }));
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
});

// get company by id
router.get("/:id", async (req, res) => {
    const id = req.params.id;
    let tenantId = func.body(req).tenantId;
    try {
        companyImp
            .getCompanyById({
                tenantId: tenantId,
                companyUid: id,
            })
            .then((companyData) => {
                res.status(200).json(func.responseModel({ data: companyData }));
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

// create new company
router.post("/", async (req, res) => {
    try {
        const contactList = JSON.parse(JSON.stringify(func.body(req).data.companyList));
        let tenantId = func.body(req).tenantId;
        let userId = func.body(req).userId;

        companyImp
            .createCompany({
                tenantId: tenantId,
                userId: userId,
                companyDataList: companyList,
            })
            .then((cList) => {
                res.status(200).json(func.responseModel({ data: cList }));
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

// delete company
router.put("/delete", async (req, res) => {
    try {
        let companyList = func.body(req).data.companyList;
        let userId = func.body(req).userId;

        companyImp
            .deleteCompany({
                userId: userId,
                companyDataList: companyList,
            })
            .then((cList) => {
                res.status(200).json(func.responseModel({ responseMessage: "Deleted successfully" }));
            });
    } catch (e) {
        console.log(e);
        res.status(400).json(e);
    }
});

// update company
router.put("/", async (req, res) => {
    try {
        let companyList = func.body(req).data.companyList;
        let userId = func.body(req).userId;

        companyImp
            .updateCompany({
                userId: userId,
                companyDataList: companyList,
            })
            .then((cList) => {
                res.status(200).json(func.responseModel({ data: cList }));
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

// remove asso moved to asso controller

export default router;
