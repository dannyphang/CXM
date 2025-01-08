import * as actRepo from "../repository/activity.repository.js";
import * as contactRepo from "../repository/contact.repository.js";
import * as companyRepo from "../repository/company.repository.js";
import * as propertyRepo from "../repository/property.repository.js";
import * as attachmentRepo from "../repository/attachment.repository.js";
import config from "../config.js";
import emailjs from "@emailjs/nodejs";
import * as func from "../shared/function.js";

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
                                act.attachmentList = await Promise.all(attachmentPromises);
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
            let activityModuleList = await propertyRepo.getModuleByModuleType({ moduleType: "ACTIVITY_TYPE" });
            let subActivityModuleList = await propertyRepo.getModuleByModuleType({ moduleType: "SUB_ACTIVITY_TYPE" });
            let activityControlList = await propertyRepo.getModuleByModuleType({ moduleType: "ACTIVITY_CONTROL" });
            let subActivityControlList = await propertyRepo.getModuleByModuleType({ moduleType: "SUB_ACTIVITY_CONTROL" });

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
            let list = [];
            activityList.forEach((activity, index) => {
                activity.modifiedDate = new Date();
                activity.modifiedBy = userId;
                activity.statusId = 2;

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

function sendEmail({ tenantId, createActivity }) {
    return new Promise(async (resolve, reject) => {
        try {
            const emailConfig = config.emailjs;

            // Initialize emailjs
            emailjs.init({
                publicKey: emailConfig.publicKey,
                privateKey: emailConfig.privateKey,
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

                // send email
                return emailjs.send(emailConfig.serviceId, emailConfig.templateId, {
                    toEmail: email,
                    fromEmail: createActivity.activityType.email.fromEmail,
                    subject: createActivity.activityType.email.subject,
                    content: createActivity.activityType.email.content,
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

export { getAllActivityByProfileId, getActivityCodeByModuleCode, createActivity, deleteActivity, updateActivity, sendEmail };
