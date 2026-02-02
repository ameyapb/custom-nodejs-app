import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { authAPI } from "../services/api";

export const useAuth = () => {
  const { login, logout, ...rest } = useContext(AuthContext);

  const register = async (email, password) => {
    try {
      const data = await authAPI.register(email, password);
      if (data.signedAuthenticationToken) {
        login(
          { email, id: data.userAccountId, role: data.assignedApplicationRole },
          data.signedAuthenticationToken
        );
        return { success: true };
      }
      return { success: false, error: data.message || "Registration failed" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const loginUser = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      if (data.signedAuthenticationToken) {
        login(
          { email, id: data.userAccountId, role: data.assignedApplicationRole },
          data.signedAuthenticationToken
        );
        return { success: true };
      }
      return { success: false, error: data.message || "Login failed" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return { register, login: loginUser, logout, ...rest };
};
