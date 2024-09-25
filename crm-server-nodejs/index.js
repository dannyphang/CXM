//import { createServer } from "http";
import express from "express";
import commonRouter from "./api/common.js";
import contactRouter from "./api/contact.js";
import companyRouter from "./api/company.js";
import activityRouter from "./api/activity.js";
import locationRouter from "./api/location.js";
import storageRouter from "./api/storage.js";
import tokenRouter from "./api/token.js";
import authRouter from "./api/auth.js";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";
import bodyParser from "body-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
// app.use(express.json());

const port = process.env.PORT || 1113;

global.__basedir = __dirname;

app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  next();
});

// to resolve CORS issue
app.use(cors());

// increase file limit
app.use(express.json({ limit: 5000000000, type: "application/json" }));
app.use(
  express.urlencoded({
    limit: 5000000000,
    extended: true,
    parameterLimit: 5000000000000000,
    type: "application/json",
  })
);

app.use("/common", commonRouter);
app.use("/contact", contactRouter);
app.use("/company", companyRouter);
app.use("/activity", activityRouter);
app.use("/storage", storageRouter);
app.use("/token", tokenRouter);
app.use("/auth", authRouter);
app.use("/location", locationRouter);

app.listen(port, () => {
  console.log(`server is running at port: ${port}...`);
});
