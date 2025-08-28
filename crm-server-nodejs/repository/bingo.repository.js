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
            const { data, error } = await supabase.from(bingoTable).select("*").eq("uid", uid).single();
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
            const user = await supabase.from(bingoPlayerTable).insert(data);
            resolve(user);
        } catch (error) {
            reject(error);
        }
    });
}

function updateUser(uid, data) {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await supabase.from(bingoPlayerTable).update(data).eq("uid", uid);
            resolve(user);
        } catch (error) {
            reject(error);
        }
    });
}

function getUser(name) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.from(bingoPlayerTable).select("*").eq("name", name).single();
            if (error) {
                if (!data) {
                    reject(`User not found`);
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
