import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

/**
 * Decode JWT payload without verification (for extracting user data)
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
const decodeJwtPayload = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken) {
      setToken(savedToken);

      // Try to restore user from localStorage first
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          // If parsing fails, try to decode from JWT
          const decoded = decodeJwtPayload(savedToken);
          if (decoded) {
            setUser({
              id: decoded.sub,
              email: decoded.email,
              role: decoded.role,
            });
          }
        }
      } else {
        // Fallback: decode user from JWT payload
        const decoded = decodeJwtPayload(savedToken);
        if (decoded) {
          setUser({
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role,
          });
        }
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
