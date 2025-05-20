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
  const { authUser, isAdmin } = useAuthContext();
  const token = Cookies.get("admin");
  useEffect(() => {
    if (!authUser) return;

    generateToken({ userId: authUser._id });

    onMessage(messaging, (payload) => {
      // toast(payload.notification?.body || "New notification", {
      //   duration: 3000,
      // });
      toast.custom(
        <div className="flex flex-col bg-gray-900 bg-opacity-90 backdrop-blur-md rounded-xl px-6 py-4 shadow-lg max-w-sm w-full border border-gray-700 animate-slide-in">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-lg font-semibold text-white">
              {payload.notification?.title}
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-300">
            {payload.notification?.body}
          </div>
          <button
            className="mt-3 text-xs text-blue-400 hover:text-blue-300 self-end"
            onClick={(e) => e.target.closest(".animate-slide-in").remove()}
          >
            Dismiss
          </button>
        </div>,
        { duration: 3000 }
      );
    });
  }, [authUser]);

  useEffect(() => {
    if (!isAdmin) return;
    generateToken({ userId: "admin" });

    onMessage(messaging, (payload) => {
      // toast(payload.notification?.body || "New notification",{
      //   duration:3000,
      //   });
      toast.custom(
        <div className="flex flex-col bg-gray-900 bg-opacity-90 backdrop-blur-md rounded-xl px-6 py-4 shadow-lg max-w-sm w-full border border-gray-700 animate-slide-in">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-lg font-semibold text-white">
              {payload.notification?.title}
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-300">
            {payload.notification?.body}
          </div>
          <button
            className="mt-3 text-xs text-blue-400 hover:text-blue-300 self-end"
            onClick={(e) => e.target.closest(".animate-slide-in").remove()}
          >
            Dismiss
          </button>
        </div>,
        { duration: 3000 }
      );
    });
  }, [isAdmin]);

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
