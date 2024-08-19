// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBaKheB_Ab_yH1YiiVD4Q_XdURIy7AcboY",
  authDomain: "brain-wave-ai.firebaseapp.com",
  projectId: "brain-wave-ai",
  storageBucket: "brain-wave-ai.appspot.com",
  messagingSenderId: "862509130161",
  appId: "1:862509130161:web:27a658b68a252df1d59d90",
  measurementId: "G-B5C5FH0H6E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export {db}