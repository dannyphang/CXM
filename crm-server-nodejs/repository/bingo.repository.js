import { supabase } from "../configuration/supabase.js";

const bingoTable = "bingo";
const bingoPlayerTable = "bingoPlayer";

function getBingoData() {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.from(bingoTable).select("*");
            if (error) {
                if (!data) {
                    reject(`Bingo data not found`);
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

function getBingoDataByUid(uid) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.from(bingoTable).select("*").eq("uid", uid).eq("statusId", 1).single();
            if (error) {
                console.log(error);
                if (!data) {
                    reject(`Bingo data not found`);
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

function createUser(data) {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await supabase.from(bingoPlayerTable).insert(data).select().single();
            resolve(res.data);
        } catch (error) {
            reject(error);
        }
    });
}

function updateUser(user) {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await supabase.from(bingoPlayerTable).update(user).eq("uid", user.uid).eq("statusId", 1).select().single();
            resolve(res.data);
        } catch (error) {
            reject(error);
        }
    });
}

function getUser(name) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.from(bingoPlayerTable).select("*").eq("name", name).eq("statusId", 1).single();
            if (error) {
                if (!data) {
                    reject("User not found");
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

export { getBingoData, getBingoDataByUid, createUser, updateUser, getUser };
