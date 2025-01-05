// firebase-config.js

// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA50Q6ZCeUArjmKUFTl7X3xjRnG4n6kGCc",
    authDomain: "licensebanpickaov.firebaseapp.com",
    databaseURL: "https://licensebanpickaov-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "licensebanpickaov",
    storageBucket: "licensebanpickaov.appspot.com",
    messagingSenderId: "732035962867",
    appId: "1:732035962867:web:e8db7d2d370a8ec3ea2486",
    measurementId: "G-ZSD0RHPKL3"
};

// Initialize Firebase App
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(firebaseApp);

// Export Firebase app and database
export { firebaseApp, database };
