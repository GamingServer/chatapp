import React, { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";
export const useAuthContext = () => {
  return useContext(AuthContext);
};

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(
    JSON.parse(localStorage.getItem("user-data")) || null
  );
  const [isAdmin, setIsAdmin] = useState(Cookies.get("admin") || null);
  const [adminRole, setAdminRole] = useState(Cookies.get("role") || null);
  
  return (
    <AuthContext.Provider
      value={{ authUser, setAuthUser, isAdmin, setIsAdmin, adminRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};
