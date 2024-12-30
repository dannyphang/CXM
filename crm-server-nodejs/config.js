import dotenv from "dotenv";
import assert from "assert";

dotenv.config();

const {
    PORT,
    HOST,
    HOST_URL,
    FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID,
    type,
    project_id,
    private_key_id,
    private_key,
    client_email,
    client_id,
    auth_uri,
    token_uri,
    auth_provider_x509_cert_url,
    client_x509_cert_url,
    universe_domain,
    EMAILJS_PUBLIC_KEY,
    EMAILJS_PRIVATE_KEY,
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
} = process.env;

assert(PORT, "Port is required");
assert(HOST, "Host is required");

export default {
    port: PORT,
    host: HOST,
    hostUrl: HOST_URL,
    firebaseConfig: {
        apiKey: FIREBASE_API_KEY,
        authDomain: FIREBASE_AUTH_DOMAIN,
        projectId: FIREBASE_PROJECT_ID,
        storageBucket: FIREBASE_STORAGE_BUCKET,
        messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
        appId: FIREBASE_APP_ID,
        measurementId: FIREBASE_MEASUREMENT_ID,
    },
    serviceAcc: {
        type: type,
        project_id: project_id,
        private_key_id: private_key_id,
        private_key: private_key.replace(/\\n/g, "\n"),
        client_email: client_email,
        client_id: client_id,
        auth_uri: auth_uri,
        token_uri: token_uri,
        auth_provider_x509_cert_url: auth_provider_x509_cert_url,
        client_x509_cert_url: client_x509_cert_url,
        universe_domain: universe_domain,
    },
    emailjs: {
        publicKey: EMAILJS_PUBLIC_KEY,
        privateKey: EMAILJS_PRIVATE_KEY,
        serviceId: EMAILJS_SERVICE_ID,
        templateId: EMAILJS_TEMPLATE_ID,
    },
};
