import { supabase } from "../configuration/supabase.js";

const stateTableName = "state";
const cityTableName = "city";

function getAllCountry() {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.from("country").select("*").eq("statusId", 1);
            if (error) {
                if (!data) {
                    reject("Data not found");
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

// get all state
function getAllState() {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.from(stateTableName).select("*").eq("statusId", 1);
            if (error) {
                if (!data) {
                    reject("Data not found");
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

// get state by country id
function getStateByCountry({ countryId }) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.from(stateTableName).select("*").eq("statusId", 1).eq("countryId", countryId).order("name");
            if (error) {
                if (!data) {
                    reject("Data not found");
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

// get city by state id
function getCityByState({ stateId }) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.from(cityTableName).select("*").eq("statusId", 1).eq("stateId", stateId).order("name");
            if (error) {
                if (!data) {
                    reject("Data not found");
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

// get state by name
function getStateByName({ stateName }) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.from(stateTableName).select("*").eq("statusId", 1).eq("name", stateName);
            if (error) {
                if (!data) {
                    reject("Data not found");
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

// get city by name
function getCityByName({ cityName }) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, error } = await supabase.from(cityTableName).select("*").eq("statusId", 1).eq("name", cityName);
            if (error) {
                if (!data) {
                    reject("Data not found");
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

export { getAllCountry, getAllState, getStateByCountry, getCityByState, getStateByName, getCityByName };
