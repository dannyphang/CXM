import env from './environment.json';
import { isDevMode } from '@angular/core';

const isProd = !isDevMode();
const isServerConnect = false;
const isAuthServerConnect = true;

const apiConfig = {
    baseUrl: isProd || isServerConnect ? env.serverBaseUrl : env.localBaseUrl,
    authUrl: isProd || isAuthServerConnect ? env.serverAuthUrl : env.localAuthUrl,
};
export default apiConfig;