import { Router } from "express";
import express from "express";
const router = Router();
import * as authImp from "../implementation/auth.js";

import * as func from "../shared/function.js";

router.use(express.json());

router.get("/allUser", async (req, res) => {
  try {
    authImp.getAllUsers().then((list) => {
      res.status(200).json(list);
    });
  } catch (error) {
    console.log("Error listing users:", error);
  }
});

// create user in firestore
router.post("/user", async (req, res) => {
  try {
    authImp
      .createUser({
        userId: func.body(req).userId,
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

export default router;
