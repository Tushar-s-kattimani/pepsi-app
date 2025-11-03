import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// IMPORTANT: Replace this with your actual Firebase config object
export const firebaseConfig = {
  "projectId": "studio-3745565586-76d44",
  "appId": "1:177076218719:web:2b9f12a0c428ba655464ea",
  "apiKey": "AIzaSyCvs2ETUW_d2xOdu7Dszu6GKErhUgaDi9g",
  "authDomain": "studio-3745565586-76d44.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "177076218719"
};


// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { db };
