import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDdj2wDyRrckg8nLKN20eiKV1Snxjh6TKM",
  authDomain: "mucuripe-finance.firebaseapp.com",
  projectId: "mucuripe-finance",
  storageBucket: "mucuripe-finance.firebasestorage.app",
  messagingSenderId: "524788134673",
  appId: "1:524788134673:web:26c3a9012843135c3092b0"
};

// Se o app já estiver inicializado, usa o existente, senão inicializa um novo
// Isso evita o erro de "Firebase App named '[DEFAULT]' already exists"
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);