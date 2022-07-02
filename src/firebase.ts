import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";

export const app = initializeApp({
  apiKey: "AIzaSyACUimWf0kayHhGEc8UE1YoizPwUq5aR50",
  authDomain: "syoch-site.firebaseapp.com",
  projectId: "syoch-site",
  storageBucket: "syoch-site.appspot.com",
  messagingSenderId: "588723008557",
  appId: "1:588723008557:web:652eb514c39b0e3c3e34a4",
  measurementId: "G-589H0RDJQP"
});
export const analytics = getAnalytics(app);