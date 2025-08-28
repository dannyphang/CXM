import * as propertyRepo from "../repository/property.repository.js";
import * as generalRepo from "../repository/general.repository.js";
import * as func from "../shared/function.js";

function getSingleProperty() {
  return new Promise(async (resolve, reject) => {
    try {
      propertyRepo
        .getSingleProperty()
        .then((property) => {
          if (!property) {
            reject("Data not found");
          }
          resolve(property);
        })
        .catch((error) => {
          if (error) {
            reject(error);
          }
        });
    } catch (error) {
      reject(error);
    }
  });
}

function getLanguage() {
  return new Promise(async (resolve, reject) => {
    try {
      generalRepo
        .getLanguage()
        .then((language) => {
          resolve(language);
        })
        .catch((error) => {
          if (error) {
            reject(error);
          }
        });
    } catch (error) {
      reject(error);
    }
  });
}

export { getSingleProperty, getLanguage };
