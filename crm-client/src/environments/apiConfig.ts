import env from './environment.json';

const isDev = true;
const apiConfig = {
    baseUrl: isDev ? env.localBaseUrl : env.serverBaseUrl
};
export default apiConfig;