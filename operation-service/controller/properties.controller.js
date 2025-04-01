import { Router } from "express";
import express from "express";
const router = Router();
import * as func from "../shared/function.js";
import * as propertyImp from "../implementation/properties.js";
import * as API from "../shared/service.js";

router.use(express.json());

const logModule = "property";

const propertiesCollection = "properties";

// create properties
router.post("/" + propertiesCollection, async (req, res) => {
  try {
    const moduleCode = func.body(req).headers.modulecode;
    const tenantId = func.body(req).tenantId;
    const userId = func.body(req).userId;
    const list = JSON.parse(JSON.stringify(func.body(req).data));

    propertyImp
      .createProperty({
        userId: userId,
        tenantId: tenantId,
        propertyList: list,
      })
      .then((l) => {
        res.status(200).json(
          func.responseModel({
            data: l,
            responseMessage: `Created ${l.length} record(s) successfully.`,
          })
        );
      })
      .catch((error) => {
        API.createLog(error, req, res, 500, logModule);
        res.status(501).json(
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
