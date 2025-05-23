import env from './environment.json';
import { isDevMode } from '@angular/core';

const isProd = !isDevMode();
const isServerConnect = false;
const isAuthServerConnect = true;
const isLogServerConnect = true;

const apiConfig = {
    baseUrl: isProd || isServerConnect ? env.server.baseUrl : env.local.baseUrl,
    authUrl: isProd || isAuthServerConnect ? env.server.authUrl : env.local.authUrl,
    logUrl: isProd || isLogServerConnect ? env.server.logUrl : env.local.logUrl,
};
export default apiConfig;