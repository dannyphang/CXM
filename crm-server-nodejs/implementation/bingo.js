import * as bingoRepo from "../repository/bingo.repository.js";
import * as func from "../shared/function.js";

function getBingoData() {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await bingoRepo.getBingoData();
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}

function getBingoDataByUid(uid) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(uid);
            const data = await bingoRepo.getBingoDataByUid(uid);
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}

// create user
function createUser(data) {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await bingoRepo.createUser(data);
            resolve(user);
        } catch (error) {
            reject(error);
        }
    });
}

// update user
function updateUser(uid, data) {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await bingoRepo.updateUser(uid, data);
            resolve(user);
        } catch (error) {
            reject(error);
        }
    });
}

function getUser(name) {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await bingoRepo.getUser(name);
            resolve(user);
        } catch (error) {
            reject(error);
        }
    });
}

export { getBingoData, getBingoDataByUid, createUser, updateUser, getUser };
