import { supabase } from "../configuration/supabase.js";

function createToken({ token }) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.from("token").insert([token]).select();

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

function getTokenByEmail({ email, module }) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!email) {
                reject(new Error("Email is required to get token"));
            }
            const { data, error } = await supabase.from("token").select("*").eq("email", email).eq("module", module).eq("statusId", 1).single();

            if (error) {
                if (!data) {
                    resolve(null);
                }
                reject(error);
            } else {
                resolve(data);
            }
        } catch (error) {
            reject(error);
        }
    });
}

function updateToken({ token }) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.from("token").update(token).eq("email", token.email).eq("module", token.module).select();

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

export { createToken, getTokenByEmail, updateToken };
