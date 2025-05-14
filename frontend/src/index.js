import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import HomePage from './components/homepage/homePage';
import LoginPage from './components/admin/loginpage/LoginPage';
import Cookies from 'js-cookie';
import MainPage from './components/admin/ChatBox/MainPage';
import { SocketContextProvider } from './context/SocketContext';
import { AuthContextProvider } from './context/AuthContext';
import Contect from './contect.js';
import GameMainPage from './components/admin/game/mainPage.js';


const token = Cookies.get('admin');
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <SocketContextProvider>
        <Router>
          <Routes>
            <Route path="*" index element={<HomePage />} />
            <Route path="/admin" element={token ? <MainPage /> : <LoginPage />} />
            <Route path="/admin/game" element={token ? <GameMainPage /> : <LoginPage />} />
            <Route path='/contect' element={<Contect />} />
          </Routes>
        </Router>
      </SocketContextProvider>
    </AuthContextProvider>
  </React.StrictMode>
);