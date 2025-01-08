import * as firebase from "../firebase-admin.js";
import { Filter } from "firebase-admin/firestore";
import { DEFAULT_SYSTEM_TENANT } from "../shared/constant.js";

const companyCollectionName = "company";
const associationCollection = "association";

// get all companies
function getAllCompanies({ tenantId }) {
    return new Promise(async (resolve, reject) => {
        try {
            const snapshot = await firebase.db
                .collection(companyCollectionName)
                .orderBy("createdDate")
                .where(Filter.or(Filter.where("tenantId", "==", tenantId), Filter.where("tenantId", "==", DEFAULT_SYSTEM_TENANT)))
                .where("statusId", "==", 1)
                .get();

            const companyList = snapshot.docs.map((doc) => {
                return doc.data();
            });

            resolve(companyList);
        } catch (error) {
            console.log("error", error);
            reject(error);
        }
    });
}

function getCompanyById({ tenantId, companyUid }) {
    return new Promise(async (resolve, reject) => {
        try {
            const snapshot = await firebase.db.collection(companyCollectionName).doc(companyUid).get();

            if (snapshot.data()?.statusId == 1 && snapshot.data().tenantId == tenantId) {
                resolve(snapshot.data());
            } else {
                console.log(`Company (${companyUid}) not found`);
                resolve({});
            }
        } catch (error) {
            console.log("error", error);
            reject(error);
        }
    });
}

function getCompanyAssoList({ companyUid }) {
    return new Promise(async (resolve, reject) => {
        try {
            const assoSnapshot = await firebase.db.collection(associationCollection).orderBy("createdDate").where("statusId", "==", 1).where("profileUid", "==", companyUid).get();

            const assoSnapshot2 = await firebase.db.collection(associationCollection).orderBy("createdDate").where("statusId", "==", 1).where("assoProfileUid", "==", companyUid).get();

            const assoList = assoSnapshot.docs.map((doc) => {
                return doc.data();
            });
            const assoList2 = assoSnapshot2.docs.map((doc) => {
                return doc.data();
            });

            resolve({
                assoList,
                assoList2,
            });
        } catch (error) {
            console.log("error", error);
            reject(error);
        }
    });
}

function createCompany({ company }) {
    return new Promise(async (resolve, reject) => {
        let newRef = firebase.db.collection(companyCollectionName).doc();
        company.uid = newRef.id;
        await newRef.set(company);

        resolve(company);
    });
}

function updateCompany({ company }) {
    return new Promise(async (resolve, reject) => {
        let newRef = firebase.db.collection(companyCollectionName).doc(company.uid);
        await newRef.update(company);

        resolve(company);
    });
}

export { getAllCompanies, getCompanyById, getCompanyAssoList, createCompany, updateCompany };
