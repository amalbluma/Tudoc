import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "my-project-31472-sure-mail",
  appId: "1:549742804341:web:a3c98fd5052491e996e73c",
  apiKey: "AIzaSyCOhpSvfVbcxYCw83QeUfWv-smXtxqjgTg",
  authDomain: "my-project-31472-sure-mail.firebaseapp.com",
  messagingSenderId: "549742804341",
  storageBucket: "my-project-31472-sure-mail.firebasestorage.app",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
