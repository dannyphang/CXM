import env from './environment.json';
import { isDevMode } from '@angular/core';

const isProd = !isDevMode();
const isServerConnect = true;
const isAuthServerConnect = true;
const isLogServerConnect = true;

const apiConfig = {
    clientUrl: isProd || isServerConnect ? env.server.client : env.local.client,
    baseUrl: isProd || isServerConnect ? env.server.base : env.local.base,
    authUrl: isProd || isAuthServerConnect ? env.server.auth : env.local.auth,
    logUrl: isProd || isLogServerConnect ? env.server.log : env.server.log,
    authClient: isProd || isAuthServerConnect ? env.server.authClient : env.local.authClient,
};
export default apiConfig;