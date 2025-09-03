import { supabase } from "../configuration/supabase.js";
import axios from "axios";
import * as cheerio from "cheerio";

const shortTable = "shortenUrl";
const analyticsTable = "shortenUrlAnalytics";

function createShortUrl({ url }) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.from(shortTable).insert([url]).select();

            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            reject(error);
        }
    });
}

function getShortUrl({ path }) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.from(shortTable).select("*").eq("path", path).eq("statusId", 1).single();

            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            reject(error);
        }
    });
}

function createShortUrlAnalytics({ url }) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.from(analyticsTable).insert([url]).select();

            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            reject(error);
        }
    });
}

function getAllUrl() {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.from(shortTable).select("*").eq("statusId", 1).order("modifiedDate", { ascending: false });

            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            reject(error);
        }
    });
}

function getAnalyticsUrl({ urlUid }) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.from(analyticsTable).select("*").eq("statusId", 1).eq("urlUid", urlUid);

            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            reject(error);
        }
    });
}

function getTitle({ url }) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await axios.get(url);
            if (error) {
                reject(error);
            } else {
                const $ = cheerio.load(data);
                const title = $("title").text().trim();
                resolve(title);
            }
        } catch (error) {
            reject(error);
        }
    });
}

export { createShortUrl, getShortUrl, getAllUrl, getAnalyticsUrl, createShortUrlAnalytics, getTitle };
