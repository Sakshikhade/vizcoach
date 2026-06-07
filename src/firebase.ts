// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDyDJlH9yGKF4fyyGRt8Q-qFL-2_va-EqQ',
  authDomain: 'vizcoach-1fa0b.firebaseapp.com',
  projectId: 'vizcoach-1fa0b',
  storageBucket: 'vizcoach-1fa0b.firebasestorage.app',
  messagingSenderId: '494204424864',
  appId: '1:494204424864:web:4728e85da856e51586afc5',
  measurementId: 'G-9XGLM0P048',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics =
  typeof window !== 'undefined' ? getAnalytics(app) : null;
