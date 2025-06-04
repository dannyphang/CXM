import * as calendarRepo from "../repository/calendar.repository.js";
import { google } from "googleapis";
import * as config from "../configuration/config.js";
import * as envConfig from "../configuration/envConfig.js";
import * as func from "../shared/function.js";

function createToken({ accessToken, refreshToken, expiryDate, email }) {
    return new Promise(async (resolve, reject) => {
        try {
            let token = {
                createdDateTime: new Date().toISOString(),
                modifiedDateTime: new Date().toISOString(),
                module: "calendar",
                accessToken: accessToken,
                refreshToken: refreshToken,
                expiry_date: expiryDate,
                email: email,
                statusId: 1,
            };
            calendarRepo
                .createToken({ token: token })
                .then((data) => {
                    resolve(data);
                })
                .catch((error) => {
                    reject(error);
                });
        } catch (error) {
            reject(error);
        }
    });
}

function getTokenByEmail(email) {
    return new Promise(async (resolve, reject) => {
        try {
            calendarRepo
                .getTokenByEmail({ email: email })
                .then((data) => {
                    resolve(data);
                })
                .catch((error) => {
                    reject(error);
                });
        } catch (error) {
            reject(error);
        }
    });
}

function fetchCalendar({ calendarEmail }) {
    return new Promise(async (resolve, reject) => {
        try {
            const token = await getTokenByEmail(calendarEmail);

            if (!token) {
                return reject(new Error("Token not found for the provided email."));
            }

            const oauth2Client = new google.auth.OAuth2(config.default.calendar.google.clientId, config.default.calendar.google.clientSecret, `${envConfig.baseUrl}/calendar/callback`);

            oauth2Client.setCredentials({
                access_token: token.accessToken,
                refresh_token: token.refreshToken,
                expiry_date: token.expiryDate,
            });

            const calendar = google.calendar({ version: "v3", auth: oauth2Client });

            // 🔁 Attempt to make API call
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const response = await calendar.events.list({
                calendarId: "primary",
                timeMin: startOfMonth.toISOString(),
                maxResults: 2500, // (optional) increase limit if needed
                singleEvents: true,
                orderBy: "startTime",
            });

            // ✅ If new tokens were used in background, update them here
            const newCredentials = oauth2Client.credentials;
            if (newCredentials.access_token !== token.accessToken) {
                const updateToken = {
                    accessToken: newCredentials.access_token,
                    refreshToken: newCredentials.refresh_token ?? token.refreshToken,
                    expiryDate: newCredentials.expiry_date,
                    email: calendarEmail,
                    module: "calendar",
                    statusId: 1,
                    modifiedDateTime: new Date().toISOString(),
                };

                await calendarRepo.updateToken({ token: updateToken });
            }

            resolve(response.data.items);
        } catch (error) {
            reject(error);
        }
    });
}

function calendarCallback({ code, userId }) {
    return new Promise(async (resolve, reject) => {
        try {
            const oauth2Client = new google.auth.OAuth2(config.default.calendar.google.clientId, config.default.calendar.google.clientSecret, `${envConfig.baseUrl}/calendar/callback`);

            oauth2Client.getToken(code, async (err, tokens) => {
                if (err) {
                    console.error("Error retrieving access token", err);
                    return res.status(500).json(
                        func.responseModel({
                            isSuccess: false,
                            responseMessage: "Error retrieving access token",
                        })
                    );
                }
                oauth2Client.setCredentials(tokens);

                const oauth2 = google.oauth2({
                    auth: oauth2Client,
                    version: "v2",
                });

                const userinfo = await oauth2.userinfo.get();
                const email = userinfo.data.email;

                let newToken = {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiryDate: tokens.expiry_date,
                    email: email,
                    module: "calendar",
                    statusId: 1,
                };

                const query = func.returnParamDataUrl({
                    token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    expiry_date: tokens.expiry_date,
                    token_type: tokens.token_type,
                    calendarEmail: email,
                    module: "calendar",
                    userId: userId,
                });
                calendarRepo
                    .updateToken({ token: newToken, email: email })
                    .then(() => {
                        resolve(query);
                    })
                    .catch((error) => {
                        calendarRepo
                            .createToken({ token: newToken })
                            .then(() => {
                                resolve(query);
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    });

                // calendarRepo
                //     .createToken({ token: newToken })
                //     .then(() => {
                //         console.log("Token created successfully");
                //         resolve(query);
                //     })
                //     .catch((err) => {
                //         calendarRepo
                //             .updateToken({ token: newToken })
                //             .then(() => {
                //                 console.log("Token updated successfully");
                //                 resolve(query);
                //             })
                //             .catch((err) => {
                //                 reject(err);
                //             });
                //     });
            });
        } catch (error) {
            reject(error);
        }
    });
}

export { createToken, getTokenByEmail, fetchCalendar, calendarCallback };
