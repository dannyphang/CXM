import env from './environment.json';
import { isDevMode } from '@angular/core';

const isProd = !isDevMode();
const isServerConnect = false;

const apiConfig = {
    baseUrl: isProd || isServerConnect ? env.serverBaseUrl : env.localBaseUrl
};
export default apiConfig;