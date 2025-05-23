// Import the functions you need from the SDKs you need
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBd0xoqTlMRA1AFtlKNKjcxmeHbM_U8Z84",
  authDomain: "chatapp-a8048.firebaseapp.com",
  databaseURL: "https://chatapp-a8048-default-rtdb.firebaseio.com",
  projectId: "chatapp-a8048",
  storageBucket: "chatapp-a8048.firebasestorage.app",
  messagingSenderId: "776404544864",
  appId: "1:776404544864:web:a8377efd21df05e74cc205",
  measurementId: "G-P5SBCDXXM5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const generateToken = async ({ userId ,role}) => {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.warn("Notification permission not granted.");
    return;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    throw new Error("No service worker registration found.");
  }

  const token = await getToken(messaging, {
    vapidKey:
      "BGHuqZxg0N6FtRWa8GoU4YcjG6ZYYuqmXT9LIhK5Al5xYLn-OGJuYqz3F97yLGEK_J_pDoZflfK6xVIHIexTwYA",
    serviceWorkerRegistration: registration,
  });

  if (token && role) {
    await fetch("http://localhost:8080/api/user/getMessageToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, token, role:role }),
    });
  } else if(token){
    await fetch("http://localhost:8080/api/user/getMessageToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, token }),
    });
  }
  
  else {
    throw new Error("Failed to get FCM token.");
  }
};

export { generateToken, messaging };
