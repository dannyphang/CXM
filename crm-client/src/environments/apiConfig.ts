import env from './environment.json';
import { isDevMode } from '@angular/core';

const isDev = isDevMode();
const apiConfig = {
    baseUrl: isDev ? env.localBaseUrl : env.serverBaseUrl
};
export default apiConfig;