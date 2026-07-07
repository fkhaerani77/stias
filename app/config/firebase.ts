import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDGGvUg02AivUtEDJHvJv38DhUzu4FaflI",
  authDomain: "appstias.firebaseapp.com",
  projectId: "appstias",
  storageBucket: "appstias.firebasestorage.app",
  messagingSenderId: "33654497679",
  appId: "1:33654497679:web:566bae14c2dd4d1bb56bfa",
  measurementId: "G-77QS2YQH0T"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);

const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
export const secondaryAuth = getAuth(secondaryApp);