import { Router } from "express";
import express from "express";
const router = Router();
import * as authImp from "../implementation/auth.js";
import * as API from "../shared/service.js";
import * as func from "../shared/function.js";

router.use(express.json());

const logModule = "auth";

router.get("/allUser", async (req, res) => {
    try {
        authImp
            .getAllUsers()
            .then((list) => {
                res.status(200).json(list);
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
        console.log("Error listing users:", error);
        API.createLog(error, req, res, 500, logModule);
        res.status(500).json(
            func.responseModel({
                isSuccess: false,
                responseMessage: error,
            })
        );
    }
});

// create user
router.post("/user", async (req, res) => {
    try {
        authImp
            .createUser({
                userId: func.body(req).userId,
                tenantId: func.body(req).tenantId,
                createUserList: JSON.parse(JSON.stringify(func.body(req).data.user)),
            })
            .then((list) => {
                res.status(200).json(
                    func.responseModel({
                        data: list,
                        responseMessage: `Created ${list.length} record(s) successfully.`,
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

// get user by email
router.get("/user/email", async (req, res) => {
    try {
        authImp
            .getUserByEmail({
                email: func.body(req).headers.email,
            })
            .then((userData) => {
                res.status(200).json(
                    func.responseModel({
                        data: userData,
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

// get user by id
router.get("/user/:id", async (req, res) => {
    try {
        authImp
            .getUserById({
                uid: req.params.id,
            })
            .then((userData) => {
                res.status(200).json(
                    func.responseModel({
                        data: userData,
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

// get user by id
router.get("/authUser/:id", async (req, res) => {
    try {
        authImp
            .getUserByAuthId({
                uid: req.params.id,
                email: func.body(req).headers.email,
            })
            .then((userData) => {
                res.status(200).json(
                    func.responseModel({
                        data: userData,
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

// update user
router.put("/user/update", async (req, res) => {
    try {
        authImp
            .updateUser({
                userId: func.body(req).userId,
                updateUserList: func.body(req).data.user,
            })
            .then((userData) => {
                res.status(200).json(
                    func.responseModel({
                        data: userData,
                        responseMessage: `Updated ${userData.length} record(s).`,
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

// get all tenant by userId
router.get("/tenant/:id", async (req, res) => {
    try {
        authImp
            .getTenantByUserId({
                userId: req.params.id,
            })
            .then((userData) => {
                res.status(200).json(
                    func.responseModel({
                        data: userData,
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

// create tenant
router.post("/tenant/create", async (req, res) => {
    try {
        authImp
            .createTenant({
                userId: func.body(req).userId,
                tenantList: JSON.parse(JSON.stringify(func.body(req).data.tenant)),
            })
            .then((userData) => {
                res.status(200).json(
                    func.responseModel({
                        data: userData,
                        responseMessage: `Created ${userData.length} record(s) successfully.`,
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

// get all roles
router.get("/role", async (req, res) => {
    try {
        authImp
            .getAllRoles()
            .then((userData) => {
                res.status(200).json(
                    func.responseModel({
                        data: userData,
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

// update user role and tenant
router.put("/userRole/update", async (req, res) => {
    try {
        authImp
            .updateUserRoleAndTenant({
                userId: func.body(req).userId,
                updateList: func.body(req).data.updateList,
            })
            .then((userData) => {
                res.status(200).json(
                    func.responseModel({
                        data: userData,
                        responseMessage: `Updated ${userData.length} record(s).`,
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

// get all user by tenantId
router.get("/user/tenant/:id", async (req, res) => {
    try {
        authImp
            .getUserByTenantId({
                tenantId: req.params.id,
            })
            .then((userData) => {
                res.status(200).json(
                    func.responseModel({
                        data: userData,
                    })
                );
            })
            .catch((error) => {
                console.log("error during get user by tenantId", error);
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

// update user last active date time
router.put("/user/userLastActive", async (req, res) => {
    try {
        authImp
            .updateUserLastActive({
                user: func.body(req).data.user,
            })
            .then((userData) => {
                res.status(200).json(
                    func.responseModel({
                        data: userData,
                        responseMessage: `Updated ${userData.length} record(s).`,
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

// send verify email
router.post("/user/sentVerifyEmail", async (req, res) => {
    try {
        authImp
            .sentVerifyEmail({
                user: func.body(req).data.user,
            })
            .then((userData) => {
                res.status(200).json(
                    func.responseModel({
                        data: userData,
                        responseMessage: `Email sent successfully.`,
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

// verify email
router.get("/verify-email", async (req, res) => {
    try {
        const token = req.query.token;
        if (!token) {
            return res.status(400).json(
                func.responseModel({
                    isSuccess: false,
                    responseMessage: "Token is required",
                })
            );
        }

        const email = req.query.email;
        const uid = req.query.uid;
        authImp
            .verifyEmail({
                token: token,
                email: email,
                uid: uid,
            })
            .then((result) => {
                res.status(200).json(
                    func.responseModel({
                        data: result.data,
                        responseMessage: "Email verified successfully.",
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

export default router;
