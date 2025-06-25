import { Router } from "express";
import express from "express";
const router = Router();
import * as func from "../shared/function.js";
import * as companyImp from "../implementation/company.js";
import * as API from "../shared/service.js";

router.use(express.json());

const logModule = "company";

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
            API.createLog(error, req, res, 500, logModule);
            res.status(500).json(
                func.responseModel({
                    isSuccess: false,
                    responseMessage: error,
                })
            );
        });
});

// get company by id
router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        let tenantId = func.body(req).tenantId;
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

// get contact by filter
router.post("/filter", async (req, res) => {
    try {
        const filterList = func.body(req).data.filterList;
        let tenantId = func.body(req).tenantId;
        companyImp
            .getCompanyByFilter({
                tenantId: tenantId,
                filterList: filterList,
            })
            .then((companyList) => {
                res.status(200).json(func.responseModel({ data: companyList }));
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

// create new company
router.post("/", async (req, res) => {
    try {
        const companyList = JSON.parse(JSON.stringify(func.body(req).data.companyList));
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

// remove asso moved to asso controller

export default router;
