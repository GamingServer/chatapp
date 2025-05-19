import React, { useEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Cookies from "js-cookie";

import toast, { Toaster } from "react-hot-toast";

// Components
import MainPage from "./components/admin/ChatBox/MainPage";
import GameMainPage from "./components/admin/game/mainPage";
import LoginPage from "./components/admin/loginpage/LoginPage";
import HomePage from "./components/homepage/homePage";
import Contect from "./contect";
import { useAuthContext } from "./context/AuthContext";

// Notifications
import { generateToken, messaging, onMessage } from "./notification/firebase";
import {
  getDatabase,
  ref,
  onDisconnect,
  set,
  onValue,
} from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getApp } from "firebase/app";

const App = () => {
  const { authUser } = useAuthContext();
  useEffect(() => {
    if (!authUser) return;

    const db = getDatabase(getApp());
    const userStatusRef = ref(db, `/status/${authUser._id}`);
    const connectedRef = ref(db, ".info/connected");

    onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === false) return;

      onDisconnect(userStatusRef)
        .set({
          state: "offline",
          lastChanged: Date.now(),
        })
        .then(() => {
          set(userStatusRef, {
            state: "online",
            lastChanged: Date.now(),
          });
        });
    });
  }, [authUser]);
  const token = Cookies.get("admin");

  useEffect(() => {
    if (!authUser) return;

    generateToken({ userId: authUser._id });

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      toast(payload.notification?.body || "New notification", {
        duration: 3000,
      });
    });

    return () => unsubscribe();
  }, [authUser]);

  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="*" index element={<HomePage />} />
        <Route path="/admin" element={token ? <MainPage /> : <LoginPage />} />
        <Route
          path="/admin/game"
          element={token ? <GameMainPage /> : <LoginPage />}
        />
        <Route path="/contect" element={<Contect />} />
      </Routes>
    </Router>
  );
};

export default App;
