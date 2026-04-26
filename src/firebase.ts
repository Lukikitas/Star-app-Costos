import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBsFNM5ipgN96JB2foe3Xm2szc72E1lq80",
  authDomain: "star-app-costos.firebaseapp.com",
  projectId: "star-app-costos",
  storageBucket: "star-app-costos.firebasestorage.app",
  messagingSenderId: "34634121244",
  appId: "1:34634121244:web:91da78f6dc069bac97dfd9",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
