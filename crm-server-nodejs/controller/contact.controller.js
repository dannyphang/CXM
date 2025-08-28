import { Router } from "express";
import express from "express";
const router = Router();
import * as func from "../shared/function.js";
import * as contactImp from "../implementation/contact.js";
import * as API from "../shared/service.js";

router.use(express.json());

const logModule = "contact";

// get all contacts
router.get("/", async (req, res) => {
    let tenantId = func.body(req).tenantId;
    contactImp
        .getAllContacts({
            tenantId: tenantId,
        })
        .then((contactList) => {
            res.status(200).json(func.responseModel({ data: contactList }));
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

// get contact by id
router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        let tenantId = func.body(req).tenantId;
        contactImp
            .getContactById({
                tenantId: tenantId,
                contactUid: id,
            })
            .then((contactData) => {
                res.status(200).json(func.responseModel({ data: contactData }));
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
        contactImp
            .getContactByFilter({
                tenantId: tenantId,
                filterList: filterList,
            })
            .then((contactList) => {
                res.status(200).json(func.responseModel({ data: contactList }));
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

// create new contact
router.post("/", async (req, res) => {
    try {
        const contactList = JSON.parse(JSON.stringify(func.body(req).data.contactList));
        let tenantId = func.body(req).tenantId;
        let userId = func.body(req).userId;

        contactImp
            .createContact({
                tenantId: tenantId,
                userId: userId,
                contactDataList: contactList,
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

// delete contact
router.put("/delete", async (req, res) => {
    try {
        let contactList = func.body(req).data.contactList;
        let userId = func.body(req).userId;

        contactImp
            .deleteContact({
                userId: userId,
                contactDataList: contactList,
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

// update contact
router.put("/", async (req, res) => {
    try {
        let contactList = func.body(req).data.contactList;
        let userId = func.body(req).userId;

        contactImp
            .updateContact({
                userId: userId,
                contactDataList: contactList,
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
