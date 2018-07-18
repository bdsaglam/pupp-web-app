import firebase from "firebase";

// Initialize Firebase
var config = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DB_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_URL,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGE_SENDER_ID
};

var firebaseApp = firebase.initializeApp(config);
export default firebaseApp;
