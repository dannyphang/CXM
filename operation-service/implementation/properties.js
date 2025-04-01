import * as propertyRepo from "../repository/properties.repository.js";

function createProperty({ userId, tenantId, propertyList }) {
  return new Promise(async (resolve, reject) => {
    try {
      let list = [];
      propertyList.forEach((property, index) => {
        property.createdDate = new Date().toISOString();
        property.createdBy = userId;
        property.modifiedDate = new Date().toISOString();
        property.modifiedBy = userId;
        property.tenantId = tenantId;

        propertyRepo
          .createProperty({ property: property })
          .then((p) => {
            list.push(p);
            if (propertyList.length - 1 === index) {
              resolve(list);
            }
          })
          .catch((error) => {
            reject(error);
          });
      });
    } catch (error) {
      reject(error);
    }
  });
}

export { createProperty };
