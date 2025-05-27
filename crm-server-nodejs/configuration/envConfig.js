import env from "./environment.json" with { type: "json" };
import envProd from "./environment.prod.json" with { type: "json" };
import * as config from "./config.js";

let isLogServerConnect = true;
let isServerConnect = false;
let isClientServerConnect = false;

const logBaseUrl = config.default.environment === "Production" || isLogServerConnect ? envProd.log : env.log;
const baseUrl = config.default.environment === "Production" || isServerConnect ? envProd.base : env.base;
const clientUrl = config.default.environment === "Production" || isClientServerConnect ? envProd.client : env.client;

export { logBaseUrl, baseUrl, clientUrl };
