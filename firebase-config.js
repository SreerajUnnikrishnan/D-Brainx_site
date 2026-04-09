// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// using import.meta.env for Vite environment variables
const firebaseConfig = {
    apiKey: "AIzaSyC3fTqIbpHg9oZky63dhBDalgJ8b2WOaIw",
    authDomain: "brainx-sec.firebaseapp.com",
    projectId: "brainx-sec",
    storageBucket: "brainx-sec.firebasestorage.app",
    messagingSenderId: "144245050580",
    appId: "1:144245050580:web:20ed6dda4e8826042b3f41"
};

console.log("Initializing Firebase...");

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
