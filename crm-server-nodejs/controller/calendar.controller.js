import { Router } from "express";
import express from "express";
const router = Router();
import * as func from "../shared/function.js";
import { google } from "googleapis";
import * as config from "../configuration/config.js";
import * as envConfig from "../configuration/envConfig.js";
import * as calendarImpl from "../implementation/calendar.js";

router.use(express.json());

const oauth2Client = new google.auth.OAuth2(config.default.calendar.google.clientId, config.default.calendar.google.clientSecret, `${envConfig.baseUrl}/calendar/callback`);

router.get("/", async (req, res) => {
    try {
        const customParams = {
            userId: func.body(req).headers.userid,
        };
        const url = oauth2Client.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: [
                "https://www.googleapis.com/auth/calendar",
                "https://www.googleapis.com/auth/calendar.events",
                "https://www.googleapis.com/auth/calendar.readonly",
                "https://www.googleapis.com/auth/userinfo.email",
            ],
            state: encodeURIComponent(JSON.stringify(customParams)),
        });
        res.status(200).json(
            func.responseModel({
                isSuccess: true,
                responseMessage: "Google Calendar authentication URL generated successfully",
                data: url,
            })
        );
    } catch (error) {
        console.log("error", error);
        func.createLog(error, req, res, 500, "calendar");
        res.status(500).json(
            func.responseModel({
                isSuccess: false,
                responseMessage: error,
            })
        );
    }
});

router.get("/callback", async (req, res) => {
    try {
        const code = req.query.code;
        const state = JSON.parse(decodeURIComponent(req.query.state));

        calendarImpl
            .calendarCallback({ code: code, userId: state.userId })
            .then((query) => {
                res.redirect(`${envConfig.clientUrl}/callback${query}`);
            })
            .catch((error) => {
                console.error("Error in calendar callback:", error);
                return res.status(500).json(
                    func.responseModel({
                        isSuccess: false,
                        responseMessage: "Error in calendar callback",
                    })
                );
            });
    } catch (error) {
        console.log("error", error);
        func.createLog(error, req, res, 500, "calendar");
        res.status(500).json(
            func.responseModel({
                isSuccess: false,
                responseMessage: error,
            })
        );
    }
});

router.get("/fetch", async (req, res) => {
    try {
        const calendarEmail = func.body(req).headers.calendaremail;
        calendarImpl
            .fetchCalendar({ calendarEmail: calendarEmail })
            .then((data) => {
                res.status(200).json(
                    func.responseModel({
                        isSuccess: true,
                        responseMessage: "Calendar fetched successfully",
                        data: data,
                    })
                );
            })
            .catch((error) => {
                console.error("Error fetching calendar:", error);
                res.status(500).json(
                    func.responseModel({
                        isSuccess: false,
                        responseMessage: "Error fetching calendar",
                    })
                );
            });
    } catch (error) {
        console.log("error", error);
        func.createLog(error, req, res, 500, "calendar");
        res.status(500).json(
            func.responseModel({
                isSuccess: false,
                responseMessage: error,
            })
        );
    }
});

router.get("/events", async (req, res) => {
    try {
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });
        const calendarId = req.query.calendar || "primary"; // Default to primary calendar if no ID is provided
        const timeMin = req.query.timeMin || new Date().toISOString(); // Default to current time if not provided

        calendar.events.list(
            {
                calendarId: calendarId,
                timeMin: timeMin,
                maxResults: 10,
                singleEvents: true,
                orderBy: "startTime",
            },
            (err, response) => {
                if (err) {
                    console.error("The API returned an error: " + err);
                    return res.status(500).json(
                        func.responseModel({
                            isSuccess: false,
                            responseMessage: "Error fetching events",
                        })
                    );
                }

                const events = response.data.items;
                res.status(200).json(
                    func.responseModel({
                        isSuccess: true,
                        responseMessage: "Events fetched successfully",
                        data: events,
                    })
                );
            }
        );
    } catch (error) {
        console.log("error", error);
        func.createLog(error, req, res, 500, "calendar");
        res.status(500).json(
            func.responseModel({
                isSuccess: false,
                responseMessage: error,
            })
        );
    }
});

export default router;
