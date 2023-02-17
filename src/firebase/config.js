// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.DATABASE_KEY,
  authDomain: process.env.DATABASE_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.DATABASE_DOMAIN,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: "80088627873",
  appId: process.env.APP_ID,
  measurementId: "G-3BV8HNSH7G",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
