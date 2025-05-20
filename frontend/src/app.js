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
import { generateToken, messaging } from "./notification/firebase";
import { onMessage } from "firebase/messaging";


const App = () => {
  const { authUser } = useAuthContext();
  const token = Cookies.get("admin");
  useEffect(() => {
    if (!authUser) return;

    generateToken({ userId: authUser._id });

    onMessage( messaging ,(payload) => {
      toast(payload.notification?.body || "New notification", {
        duration: 3000,
      });
    });

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
