import * as firebase from "../firebase-admin.js";

function getAllUsers() {
    return firebase.auth.listUsers();
}

export { getAllUsers };
