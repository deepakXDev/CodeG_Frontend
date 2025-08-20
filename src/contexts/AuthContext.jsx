import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import RouteLoader from "../components/RouteLoader";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuthentication = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/profile`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      console.log(result);

      if (response.ok && result.success) {
        setIsAuthenticated(true);
        console.log(isAuthenticated);
        setUser(result.user);

        if (location.pathname === "/auth") {
          navigate("/", { replace: true });
        }
      } else {
        setIsAuthenticated(false);
        console.log(isAuthenticated);
        setUser(null);

        const protectedRoutes = [
          "/dashboard",
          "/profile",
          "/edit-profile",
          "/problems",
          "/problem",
          "/create-problem",
          "/edit-problem",
          "/my-problems",
          "/submissions",
        ];
        const isProtectedRoute = protectedRoutes.some((route) =>
          location.pathname.startsWith(route)
        );

        if (isProtectedRoute) {
          navigate("/auth", { replace: true });
        }
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    }
  };

  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
        method: "GET", //POST
        credentials: "include",
      });
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      console.log(user);

      navigate("/auth", { replace: true });
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, [location.pathname]);

  if (isLoading) {
    return <RouteLoader message="Verifying authentication..." />;
  }

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    isLoading,
    setIsLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
