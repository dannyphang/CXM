import { supabase } from "../configuration/supabase.js";

const shortTable = "shortenUrl";

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

export { createShortUrl, getShortUrl };
