// Fill these from your Firebase project settings
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const messagesRef = collection(db, "messages");
export const latestMessagesQuery = query(messagesRef, orderBy("createdAt", "asc"), limit(200));
export const addMessage = (message) => addDoc(messagesRef, {
  ...message,
  createdAt: serverTimestamp(),
});
export const subscribeMessages = (callback) => onSnapshot(latestMessagesQuery, callback);



