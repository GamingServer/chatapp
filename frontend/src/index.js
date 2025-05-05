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


const token = Cookies.get('admin');
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthContextProvider>
    <SocketContextProvider>
      <React.StrictMode>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={token ? <MainPage /> : <LoginPage />} />
            <Route path='/contect'element={<Contect/>}/>
          </Routes>
        </Router>
      </React.StrictMode>
    </SocketContextProvider>
  </AuthContextProvider>
);