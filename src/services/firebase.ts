import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCX0BYVq3qQtFxrGxl0F2JyfmiLsen1-9w",
  authDomain: "unreal-scraper.firebaseapp.com",
  projectId: "unreal-scraper",
  storageBucket: "unreal-scraper.firebasestorage.app",
  messagingSenderId: "942473199743",
  appId: "1:942473199743:web:e8f05ee7be6904956b7f4a",
  measurementId: "G-LDZ7L86CPB",
  databaseURL: "https://unreal-scraper-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);
export default app;
