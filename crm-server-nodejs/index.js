//import { createServer } from "http";
import express from "express";
import ContactRouter from "./api/contact.js";
import commonRouter from "./api/common.js";
import activityRouter from "./api/activity.js";
import storageRouter from "./api/storage.js";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

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

app.use("/contact", ContactRouter);
app.use("/common", commonRouter);
app.use("/activity", activityRouter);
app.use("/storage", storageRouter);

app.listen(port, () => {
  console.log(`server is running at port: ${port}...`);
});
