import { Router } from "express";
import express from "express";
const router = Router();
import * as func from "../shared/function.js";
import * as activityImp from "../implementation/activity.js";
import * as API from "../shared/service.js";

router.use(express.json());

const logModule = "activity";

// get all activities by profile id
router.post("/getActivitiesByProfileId", async (req, res) => {
    try {
        activityImp
            .getAllActivityByProfileId({
                tenantId: func.body(req).tenantId,
                profileUid: func.body(req).data.profileUid,
            })
            .then((list) => {
                res.status(200).json(func.responseModel({ data: list }));
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

// get all activities code by module code
router.get("/activityModule", async (req, res) => {
    try {
        activityImp
            .getActivityCodeByModuleCode()
            .then((list) => {
                res.status(200).json(func.responseModel({ data: list }));
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

// create activity
router.post("/", async (req, res) => {
    try {
        activityImp
            .createActivity({
                userId: func.body(req).userId,
                tenantId: func.body(req).tenantId,
                activitiesList: JSON.parse(JSON.stringify(func.body(req).data.createdActivitiesList)),
            })
            .then((list) => {
                res.status(200).json(func.responseModel({ data: list }));
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

// update activity
router.put("/", async (req, res) => {
    try {
        activityImp
            .updateActivity({
                userId: func.body(req).userId,
                activityList: func.body(req).data.updateActivityList,
            })
            .then((list) => {
                res.status(200).json(func.responseModel({ data: list }));
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

// send email
router.post("/email", async (req, res) => {
    try {
        activityImp
            .sendEmail({
                tenantId: func.body(req).tenantId,
                createActivity: func.body(req).data.createActivity,
            })
            .then((list) => {
                res.status(200).json(func.responseModel({ data: list }));
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
