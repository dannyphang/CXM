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
      const { uid, name, bingo, hiddenMission } = data;
      const user = await bingoRepo.createUser({
        name: name.toString().toLowerCase(),
        bingo,
        hiddenMission,
      });
      resolve(user);
    } catch (error) {
      reject(error);
    }
  });
}

// update user
function updateUser(user) {
  return new Promise(async (resolve, reject) => {
    try {
      const { uid, name, bingo, hiddenMission } = user;
      const res = await bingoRepo.updateUser({
        uid,
        name: name.toString().toLowerCase(),
        bingo,
        hiddenMission,
      });
      resolve(res);
    } catch (error) {
      reject(error);
    }
  });
}

function getUser(name) {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await bingoRepo.getUser(name.toString().toLowerCase());
      resolve(user);
    } catch (error) {
      console.log("get user error:", error);
      reject(error);
    }
  });
}

export { getBingoData, getBingoDataByUid, createUser, updateUser, getUser };
