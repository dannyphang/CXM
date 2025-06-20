import * as locationImpl from "../implementation/location.js";

function getAllCountry() {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await locationImpl.getAllCountry();
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}

// get all state
function getAllState() {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await locationImpl.getAllState();
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}

// get state by country id
function getStateByCountry({ countryId }) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await locationImpl.getStateByCountry({ countryId });
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}

function getCityByState({ stateId }) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await locationImpl.getCityByState({ stateId });
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}

function getStateByName({ stateName }) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await locationImpl.getStateByName({ stateName });
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}

function getCityByName({ cityName }) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await locationImpl.getCityByName({ cityName });
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}

export { getAllCountry, getAllState, getStateByCountry, getCityByState, getStateByName, getCityByName };
