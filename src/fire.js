import firebase from "firebase";

// Initialize Firebase
var config = {
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    databaseURL: process.env.REACT_APP_FIREBASE_CONTENTS_DB_URL,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_URL,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGE_SENDER_ID
};

var firebaseApp = firebase.initializeApp(config);
export default firebaseApp;
