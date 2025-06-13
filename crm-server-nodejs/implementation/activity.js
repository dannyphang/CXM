import * as actRepo from "../repository/activity.repository.js";
import * as contactRepo from "../repository/contact.repository.js";
import * as companyRepo from "../repository/company.repository.js";
import * as propertyRepo from "../repository/property.repository.js";
import * as attachmentRepo from "../repository/attachment.repository.js";
import config from "../configuration/config.js";
import * as func from "../shared/function.js";
import { google } from "googleapis";
import * as calendarImpl from "../implementation/calendar.js";
import * as contactImp from "../implementation/contact.js";
import * as attachmentImp from "../implementation/attachment.js";
import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js";

function getAllActivityByProfileId({ tenantId, profileUid }) {
    return new Promise(async (resolve, reject) => {
        try {
            const list = await actRepo.getAllActivityByProfileId({
                tenantId: tenantId,
                profileUid: profileUid,
            });
            if (list.length > 0) {
                // Process all activities with Promise.all
                await Promise.all(
                    list.map(async (act) => {
                        act.createdDate = func.convertFirebaseDateFormat(act.createdDate);
                        act.modifiedDate = func.convertFirebaseDateFormat(act.modifiedDate);
                        act.association = {
                            companyList: [],
                            contactList: [],
                        };

                        // Fetch company details
                        const companyPromises = act.associationCompanyUidList?.map(async (uid) => {
                            return await companyRepo.getCompanyById({
                                tenantId: tenantId,
                                companyUid: uid,
                            });
                        });
                        if (companyPromises) {
                            act.association.companyList = await Promise.all(companyPromises);
                        }

                        // Fetch contact details
                        const contactPromises = act.associationContactUidList?.map(async (uid) => {
                            return await contactRepo.getContactById({
                                tenantId: tenantId,
                                contactUid: uid,
                            });
                        });
                        if (contactPromises) {
                            act.association.contactList = await Promise.all(contactPromises);
                        }

                        // Fetch attachment list
                        if (act.attachmentUid && act.attachmentUid.length > 0) {
                            const attachmentPromises = act.attachmentUid?.map(async (uid) => {
                                return await attachmentRepo.getAttachmentByUid({ uid: uid });
                            });
                            if (attachmentPromises) {
                                const attachments = await Promise.all(attachmentPromises);

                                act.attachmentList = attachments.filter((attachment) => attachment !== null);
                            }
                        }
                    })
                );

                resolve(list);
            } else {
                resolve(list);
            }
        } catch (error) {
            reject(error);
        }
    });
}

// get all activities code by module code
function getActivityCodeByModuleCode() {
    return new Promise(async (resolve, reject) => {
        try {
            let activityModuleList = await propertyRepo.getModuleByModuleType({
                moduleType: "ACTIVITY_TYPE",
            });
            let subActivityModuleList = await propertyRepo.getModuleByModuleType({
                moduleType: "SUB_ACTIVITY_TYPE",
            });
            let activityControlList = await propertyRepo.getModuleByModuleType({
                moduleType: "ACTIVITY_CONTROL",
            });
            let subActivityControlList = await propertyRepo.getModuleByModuleType({
                moduleType: "SUB_ACTIVITY_CONTROL",
            });

            activityControlList.forEach((item) => {
                item.subActivityControl = [];
                subActivityControlList.forEach((subItem) => {
                    if (item.moduleCode === subItem.moduleSubCode) {
                        item.subActivityControl.push(subItem);
                    }
                });
            });

            resolve({
                activityModuleList,
                activityControlList,
                subActivityModuleList,
            });
        } catch (error) {
            reject(error);
        }
    });
}

function createActivity({ userId, tenantId, activitiesList }) {
    return new Promise((resolve, reject) => {
        try {
            let list = [];
            activitiesList.forEach((activity, index) => {
                activity.createdDate = new Date();
                activity.createdBy = userId;
                activity.modifiedDate = new Date();
                activity.modifiedBy = userId;
                activity.statusId = 1;
                activity.tenantId = tenantId;

                actRepo.createActivity({ activity: activity }).then((a) => {
                    list.push(a);

                    if (activitiesList.length - 1 === index) {
                        resolve(list);
                    }
                });
            });
        } catch (error) {
            reject(error);
        }
    });
}

function deleteActivity({ userId, activityList }) {
    return new Promise(async (resolve, reject) => {
        try {
            // Step 1: Update all activities
            const updatedActivities = await Promise.all(
                activityList.map((activity) => {
                    activity.modifiedDate = new Date();
                    activity.modifiedBy = userId;
                    activity.statusId = 2;
                    return actRepo.updateActivity({ activity });
                })
            );

            // Step 2: Remove all attachments (if any)
            const attachmentRemovals = [];

            for (const act of updatedActivities) {
                console.log(`Processing activity`, act);
                if (act.attachmentUid && act.attachmentUid.length > 0) {
                    for (const uid of act.attachmentUid) {
                        attachmentRemovals.push(attachmentImp.removeAttachmentById({ attachmentId: uid, userId: userId }));
                    }
                }
            }

            Promise.all(attachmentRemovals)
                .then((result) => {
                    resolve(result);
                })
                .catch((error) => {
                    console.error("Error removing attachments:", error);
                    reject(error);
                });
        } catch (error) {
            console.error("Error deleting activity:", error);
            reject(error);
        }
    });
}

function updateActivity({ userId, activityList }) {
    return new Promise(async (resolve, reject) => {
        try {
            let list = [];
            activityList.forEach((activity, index) => {
                activity.modifiedDate = new Date();
                activity.modifiedBy = userId;

                actRepo.updateActivity({ activity: activity }).then((a) => {
                    list.push(a);
                    if (activityList.length - 1 === index) {
                        resolve(list);
                    }
                });
            });
        } catch (error) {
            reject(error);
        }
    });
}

function sendEmail({ tenantId, createActivity, userId }) {
    return new Promise(async (resolve, reject) => {
        try {
            // send email
            const mailgun = new Mailgun(FormData);

            const mg = mailgun.client({
                username: "api",
                key: config.mailgun.apiKey,
            });

            // Extract and validate the toEmail array
            const toEmailList = createActivity.activityType.email.toEmail;
            const validEmails = toEmailList.filter((email) => email && email.trim() !== "");

            if (validEmails.length === 0) {
                reject("No valid email addresses provided");
            }

            // Prepare email sending promises
            const emailPromises = validEmails.map(async (email, index) => {
                createActivity.createdDate = new Date();
                createActivity.createdBy = userId;
                createActivity.modifiedDate = new Date();
                createActivity.modifiedBy = userId;
                createActivity.statusId = 1;
                createActivity.tenantId = tenantId;
                await actRepo.createActivity({ activity: createActivity });

                // send email (emailjs)
                // return emailjs.send(emailConfig.serviceId, emailConfig.templateId, {
                //     toEmail: email,
                //     fromEmail: createActivity.activityType.email.fromEmail,
                //     subject: createActivity.activityType.email.subject,
                //     content: createActivity.activityType.email.content,
                // });

                // mailgun
                return mg.messages
                    .create(config.mailgun.domain, {
                        from: createActivity.activityType.email.fromEmail,
                        to: email,
                        subject: createActivity.activityType.email.subject,
                        template: "activity_email",
                        "h:X-Mailgun-Variables": JSON.stringify({
                            content: createActivity.activityType.email.content,
                        }),
                    })
                    .then((msg) => {
                        resolve(msg);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });

            // Execute all promises and wait for them to complete
            const results = await Promise.all(
                emailPromises.map(
                    (p) => p.catch((err) => ({ error: err })) // Catch individual promise rejections
                )
            );

            // Check for errors in the results
            const errors = results.filter((result) => result.error);
            if (errors.length > 0) {
                console.log(results);
                reject(errors);
            }

            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

function createMeeting({ userId, tenantId, createActivityObj, calendarEmail }) {
    return new Promise(async (resolve, reject) => {
        try {
            const token = await calendarImpl.getTokenByEmail(calendarEmail);

            if (!token) {
                return reject(new Error("Token not found for the provided email."));
            }

            const oauth2Client = new google.auth.OAuth2(config.calendar.google.clientId, config.calendar.google.clientSecret);

            oauth2Client.setCredentials({
                access_token: token.accessToken,
                refresh_token: token.refreshToken,
                expiry_date: token.expiryDate,
            });

            const calendar = google.calendar({ version: "v3", auth: oauth2Client });

            const companyPromises =
                createActivityObj.associationCompanyUidList?.map(
                    async (uid) =>
                        await companyRepo.getCompanyById({
                            tenantId: tenantId,
                            companyUid: uid,
                        })
                ) || [];

            const contactPromises =
                createActivityObj.associationContactUidList?.map(
                    async (uid) =>
                        await contactRepo.getContactById({
                            tenantId: tenantId,
                            contactUid: uid,
                        })
                ) || [];

            // Run both company and contact fetches in parallel
            const [companyList, contactList] = await Promise.all([Promise.all(companyPromises), Promise.all(contactPromises)]);

            let attendeesList = [];
            if (contactList.length > 0) {
                contactList.forEach((contact) => {
                    attendeesList.push(contact.contactEmail);
                });
            }
            if (companyList.length > 0) {
                companyList.forEach((company) => {
                    if (company.companyEmail && company.companyEmail.trim() !== "") {
                        attendeesList.push(company.companyEmail);
                    }
                });
            }

            const attendees = attendeesList.filter((email) => email && email.trim() !== "").map((email) => ({ email }));

            calendar.events
                .insert({
                    calendarId: "primary",
                    requestBody: {
                        summary: createActivityObj.activityType.meeting.subject,
                        description: createActivityObj.activityType.meeting.description,
                        organizer: createActivityObj.activityType.meeting.organizer
                            ? {
                                  email: createActivityObj.activityType.meeting.organizer,
                              }
                            : null,
                        start: {
                            dateTime: createActivityObj.activityType.meeting.start,
                            timeZone: "UTC", // Adjust as necessary
                        },
                        end: {
                            dateTime: createActivityObj.activityType.meeting.end,
                            timeZone: "UTC", // Adjust as necessary
                        },
                        location: createActivityObj.activityType.meeting.location,
                        reminders:
                            createActivityObj.activityType.meeting.reminder > 0
                                ? {
                                      useDefault: false,
                                      overrides: [
                                          {
                                              method: "email",
                                              minutes: convertToMinutes({
                                                  reminderNumber: createActivityObj.activityType.meeting.reminder,
                                                  reminderType: createActivityObj.activityType.meeting.reminderType,
                                              }),
                                          }, // 1 day before
                                      ],
                                  }
                                : null,
                        attendees: attendees,
                    },
                })
                .then((event) => {
                    createActivity({
                        userId: userId,
                        tenantId: tenantId,
                        activitiesList: [createActivityObj],
                    })
                        .then((activityList) => {
                            resolve(activityList);
                        })
                        .catch((error) => {
                            console.error("Error creating activity:", error);
                            reject(error);
                        });
                })
                .catch((error) => {
                    console.error("Error creating calendar event:", error);
                    reject(error);
                });
        } catch (error) {
            reject(error);
        }
    });
}

function convertToMinutes(reminder) {
    const { reminderNumber, reminderType } = reminder;

    const typeToMinutes = {
        1: 1,
        2: 60,
        3: 1440,
        4: 10080,
    };

    return reminderNumber * (typeToMinutes[reminderType] || 0);
}

export { getAllActivityByProfileId, getActivityCodeByModuleCode, createActivity, deleteActivity, updateActivity, sendEmail, createMeeting };
