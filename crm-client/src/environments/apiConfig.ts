import env from './environment.json';

const isDev = false;
const apiConfig = {
    baseUrl: isDev ? env.localBaseUrl : env.serverBaseUrl
};
export default apiConfig;