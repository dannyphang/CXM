import * as shortRepo from "../repository/short.repository.js";
import * as func from "../shared/function.js";
import * as envConfig from "../configuration/envConfig.js";
import * as constant from "../shared/constant.js";

function createShortenUrl({ url, expiry }) {
    return new Promise((resolve, reject) => {
        try {
            let obj = {
                originalUrl: url,
                shortUrl: "",
                path: "",
                expiry: expiry,
            };

            // generate a random short 10 alphanumeric string
            obj.path = func.generateRandomString(10);
            obj.shortUrl = `${envConfig.clientUrl}/su/${obj.path}`;

            shortRepo
                .createShortUrl({ url: obj })
                .then((shortUrl) => resolve(shortUrl))
                .catch((error) => reject(error));
        } catch (error) {
            reject(error);
        }
    });
}

function getShortenUrl({ path, useragent, ip }) {
    return new Promise((resolve, reject) => {
        try {
            shortRepo
                .getShortUrl({ path: path })
                .then((res) => {
                    let device = "";
                    if (useragent.isMobile) {
                        device = "mobile";
                    } else if (useragent.isTablet) {
                        device = "tablet";
                    } else if (useragent.isDesktop) {
                        device = "desktop";
                    }

                    let url = {
                        urlUid: res.uid,
                        device: device,
                        ipAddress: ip,
                    };

                    shortRepo
                        .createShortUrlAnalytics({ url: url })
                        .then((data) => {
                            resolve(res);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                })
                .catch((error) => reject(error));
        } catch (error) {
            reject(error);
        }
    });
}

function getAllUrl() {
    return new Promise(async (resolve, reject) => {
        try {
            shortRepo
                .getAllUrl()
                .then(async (res) => {
                    const urlsWithAnalytics = await Promise.all(
                        res.map(async (url) => {
                            const analytics = await shortRepo.getAnalyticsUrl({ urlUid: url.uid });
                            return { ...url, analytics };
                        })
                    );

                    resolve(urlsWithAnalytics);
                })
                .catch((error) => reject(error));
        } catch (error) {
            reject(error);
        }
    });
}

function getTitle({ url }) {
    return new Promise(async (resolve, reject) => {
        try {
            shortRepo
                .getTitle({ url: url })
                .then(async (res) => {
                    resolve(res);
                })
                .catch((error) => reject(error));
        } catch (error) {
            reject(error);
        }
    });
}

export { createShortenUrl, getShortenUrl, getAllUrl, getTitle };
