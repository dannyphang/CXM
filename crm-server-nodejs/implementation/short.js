import * as shortRepo from "../repository/short.repository.js";
import * as func from "../shared/function.js";
import * as envConfig from "../configuration/envConfig.js";

function createShortenUrl({ url }) {
    return new Promise((resolve, reject) => {
        try {
            let obj = {
                originalUrl: url,
                shortUrl: "",
                path: "",
                expiry: 1,
            };

            // generate a random short 10 alphanumeric string
            obj.path = func.generateRandomString(10);
            obj.shortUrl = `${envConfig.clientUrl}/short/${obj.path}`;

            shortRepo
                .createShortUrl({ url: obj })
                .then((shortUrl) => resolve(shortUrl))
                .catch((error) => reject(error));
        } catch (error) {
            reject(error);
        }
    });
}

function getShortenUrl({ path }) {
    return new Promise((resolve, reject) => {
        try {
            shortRepo
                .getShortUrl({ path: path })
                .then((res) => resolve(res))
                .catch((error) => reject(error));
        } catch (error) {
            reject(error);
        }
    });
}

export { createShortenUrl, getShortenUrl };
