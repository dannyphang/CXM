import { Router } from "express";
import express from "express";
const router = Router();
import * as func from "../shared/function.js";
import * as propertyImp from "../implementation/property.js";
import * as API from "../shared/service.js";

router.use(express.json());

const logModule = "property";

const propertiesCollection = "properties";
const propertiesLookupCollection = "propertiesLookup";
const moduleCodeCollection = "moduleCode";

// get all properties with lookup by module
router.get("/" + propertiesCollection + "/module", async (req, res) => {
  try {
    const moduleCode = func.body(req).headers.modulecode;
    const tenantId = func.body(req).tenantId;
    propertyImp
      .getAllProperty({
        moduleCode: moduleCode,
        tenantId: tenantId,
      })
      .then((list) => {
        res.status(200).json(func.responseModel({ data: list }));
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
        func.responseModel({
          data: createDoc,
          responseMessage: `Created ${l.length} record(s) successfully.`,
        });
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

// update properties
router.put("/" + propertiesCollection + "/update", async (req, res) => {
  try {
    const userId = func.body(req).userId;
    const list = func.body(req).data.propertyList;

    propertyImp
      .updateProperty({
        userId: userId,
        propertyList: list,
      })
      .then((l) => {
        res.status(200).json(func.responseModel({ responseMessage: "Updated successfully" }));
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

// delete properties
router.put("/" + propertiesCollection + "/delete", async (req, res) => {
  try {
    const userId = func.body(req).userId;
    const list = func.body(req).data.propertyList;

    propertyImp
      .deleteProperty({
        userId: userId,
        propertyList: list,
      })
      .then((l) => {
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

// create properties lookup
router.post("/" + propertiesLookupCollection, async (req, res) => {
  try {
    const userId = func.body(req).userId;
    const tenantId = func.body(req).tenantId;
    const list = JSON.parse(JSON.stringify(func.body(req).data));

    propertyImp
      .createPropertyLookUp({
        tenantId: tenantId,
        userId: userId,
        propertyList: list,
      })
      .then((l) => {
        res.status(200).json(
          func.responseModel({
            data: createDoc,
            responseMessage: `Created ${l.length} record(s) successfully.`,
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

// update properties lookup
router.put("/" + propertiesCollection + "/update", async (req, res) => {
  try {
    const userId = func.body(req).userId;
    const list = func.body(req).data.propertyList;

    propertyImp
      .updatePropertyLookUp({
        userId: userId,
        propertyList: list,
      })
      .then((l) => {
        res.status(200).json(func.responseModel({ responseMessage: "Updated successfully" }));
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

// get module by module type
router.get("/" + moduleCodeCollection + "/moduleType", async (req, res) => {
  try {
    const moduleType = func.body(req).headers.moduletype;
    const tenantId = req.headers.tenantid;

    propertyImp
      .getAllModuleCodeByModuleType({
        tenantId: tenantId,
        moduleType: moduleType,
      })
      .then((l) => {
        res.status(200).json(func.responseModel({ data: l }));
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

// get sub module by module type
router.get("/" + moduleCodeCollection + "/subModule/code", async (req, res) => {
  try {
    const submoduleCode = func.body(req).headers.submodulecode;
    const tenantId = func.body(req).tenantId;

    propertyImp
      .getAllModuleBySubModule({
        tenantId: tenantId,
        subModuleCode: submoduleCode,
      })
      .then((l) => {
        res.status(200).json(func.responseModel({ data: l }));
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

// get all activities code by module code
router.get("/activityModule", async (req, res) => {
  try {
    propertyImp
      .getAllActivityModule()
      .then((l) => {
        res.status(200).json(func.responseModel({ data: l }));
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

// create module code
router.post("/" + moduleCodeCollection, async (req, res) => {
  try {
    const userId = func.body(req).userId;
    const list = JSON.parse(JSON.stringify(func.body(req).data));

    propertyImp
      .createModule({
        userId: userId,
        moduleList: list,
      })
      .then((l) => {
        res.status(200).json(func.responseModel({ data: l }));
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

// check property unique
router.post("/checkUnique", async (req, res) => {
  try {
    const tenantId = func.body(req).tenantId;
    const data = JSON.parse(JSON.stringify(func.body(req).data));

    propertyImp
      .checkUnique({
        tenantId: tenantId,
        module: data.data.module,
        propertyDataList: data.data.propertyDataList,
        propertyList: data.data.propertyList,
      })
      .then((notUniqueProperties) => {
        res.status(200).json(
          func.responseModel({
            isSuccess: notUniqueProperties.length === 0,
            data: notUniqueProperties ?? null,
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
