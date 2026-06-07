
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  

  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "ai-interview-c6d15.firebaseapp.com",
  projectId: "ai-interview-c6d15",
  storageBucket: "ai-interview-c6d15.firebasestorage.app",
  messagingSenderId: "296050376532",
  appId: "1:296050376532:web:1a23f5874ea3f1e907d2c1"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app)

const provider = new GoogleAuthProvider()
console.log(import.meta.env.VITE_FIREBASE_APIKEY)
export { auth, provider, app }