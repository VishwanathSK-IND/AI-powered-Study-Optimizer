
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBQZLOCbrBaY4kGKmJ6pGRvrsoGfpi5H-c",
  authDomain: "study-optimizer-eaf1d.firebaseapp.com",
  projectId: "study-optimizer-eaf1d",
  storageBucket: "study-optimizer-eaf1d.firebasestorage.app",
  messagingSenderId: "906629430167",
  appId: "1:906629430167:web:ccbe2d380ee8f32f8e22d2",
  measurementId: "G-FQ7XBQ15E6"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
