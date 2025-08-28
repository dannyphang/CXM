import { Router } from "express";
import express from "express";
const router = Router();
import * as func from "../shared/function.js";
import * as bingoImp from "../implementation/bingo.js";
import * as API from "../shared/service.js";

router.use(express.json());

const logModule = "bingo";

router.get("/data", async (req, res) => {
  try {
    bingoImp
      .getBingoData()
      .then((data) => {
        res.status(200).json(
          func.responseModel({
            data: data,
          })
        );
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
    API.createLog(error, req, res, 500, logModule);

    res.status(500).json(
      func.responseModel({
        isSuccess: false,
        responseMessage: error,
      })
    );
  }
});

router.get("/data/:uid", async (req, res) => {
  try {
    bingoImp
      .getBingoDataByUid(req.params.uid)
      .then((data) => {
        res.status(200).json(
          func.responseModel({
            data: data,
          })
        );
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
    bingoImp
      .createUser(req.body)
      .then((data) => {
        res.status(200).json(
          func.responseModel({
            data: data,
            responseMessage: "User created successfully",
          })
        );
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
    API.createLog(error, req, res, 500, logModule);
    res.status(500).json(
      func.responseModel({
        isSuccess: false,
        responseMessage: error,
      })
    );
  }
});

// get user
router.get("/user", async (req, res) => {
  try {
    bingoImp
      .getUser(func.body(req).headers.name)
      .then((data) => {
        res.status(200).json(
          func.responseModel({
            data: data,
          })
        );
      })
      .catch((error) => {
        API.createLog(error, req, res, 500, logModule);
        res.status(200).json(
          func.responseModel({
            isSuccess: false,
            responseMessage: error,
          })
        );
      });
  } catch (error) {
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
router.put("/user", async (req, res) => {
  try {
    bingoImp
      .updateUser(func.body(req).data)
      .then((data) => {
        res.status(200).json(
          func.responseModel({
            data: data,
            responseMessage: "User updated successfully",
          })
        );
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
