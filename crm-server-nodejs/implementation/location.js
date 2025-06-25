import * as locationRepo from "../repository/location.repository.js";

function getAllCountry() {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await locationRepo.getAllCountry();
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
            const data = await locationRepo.getAllState();
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
            const data = await locationRepo.getStateByCountry({ countryId: countryId });
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}

function getCityByState({ stateId }) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await locationRepo.getCityByState({ stateId });
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}

function getStateByName({ stateName }) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await locationRepo.getStateByName({ stateName });
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}

function getCityByName({ cityName }) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await locationRepo.getCityByName({ cityName });
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}

export { getAllCountry, getAllState, getStateByCountry, getCityByState, getStateByName, getCityByName };
