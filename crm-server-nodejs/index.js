//import { createServer } from "http";
import express from "express";
import ContactRouter from "./api/routes/contact.js";
import cors from "cors";

const app = express();
app.use(express.json());

const port = process.env.PORT || 1113;

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

app.listen(port, () => {
  console.log(`server is running at port: ${port}...`);
});
