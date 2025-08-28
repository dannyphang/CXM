import { supabase } from "../configuration/supabase.js";

const countryTableName = "country";
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
            supabase
                .from(countryTableName)
                .select("*")
                .eq("uid", countryId)
                .eq("statusId", 1)
                .single()
                .then(async (res) => {
                    if (res.error) {
                        reject(res.error);
                    } else {
                        supabase
                            .from(stateTableName)
                            .select("*")
                            .eq("statusId", 1)
                            .eq("countryId", res.data.countryId)
                            .order("name")
                            .then((res) => {
                                if (res.error) {
                                    if (!res.data) {
                                        reject("Data not found");
                                    }
                                    reject(res.error);
                                } else {
                                    resolve(res.data);
                                }
                            });
                    }
                });
        } catch (error) {
            reject(error);
        }
    });
}

// get city by state id
function getCityByState({ stateId }) {
    return new Promise(async (resolve, reject) => {
        try {
            supabase
                .from(stateTableName)
                .select("*")
                .eq("uid", stateId)
                .eq("statusId", 1)
                .single()
                .then(async (res) => {
                    if (res.error) {
                        reject(res.error);
                    } else {
                        supabase
                            .from(cityTableName)
                            .select("*")
                            .eq("statusId", 1)
                            .eq("stateId", res.data.stateId)
                            .order("name")
                            .then((res) => {
                                if (res.error) {
                                    if (!res.data) {
                                        reject("Data not found");
                                    }
                                    reject(res.error);
                                } else {
                                    resolve(res.data);
                                }
                            });
                    }
                });
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
