import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import RouteLoader from "../components/RouteLoader";

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const checkAuthentication = useCallback(async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/profile`, {
                method: "GET",
                credentials: "include",
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setIsAuthenticated(true);
                setUser(result.user); // Assuming the backend sends the user object in `result.user`
                if (location.pathname === "/auth") {
                    navigate("/", { replace: true });
                }
            } else {
                setIsAuthenticated(false);
                setUser(null);
                // Redirect logic for protected routes can be handled in a wrapper component
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            // A small delay to prevent UI flashing
            setTimeout(() => setIsLoading(false), 500);
        }
    }, [navigate, location.pathname]);

    useEffect(() => {
        checkAuthentication();
    }, [checkAuthentication]);

    const login = (userData) => {
        setIsAuthenticated(true);
        setUser(userData);
    };

    const logout = async () => {
        try {
            // It's more conventional to use POST for actions that change server state
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Logout API call failed, but logging out client-side anyway:", error);
        } finally {
            // This block runs regardless of whether the API call succeeded or failed
            setIsAuthenticated(false);
            setUser(null);
            navigate("/auth", { replace: true });
        }
    };

    if (isLoading) {
        return <RouteLoader message="Verifying authentication..." />;
    }

    const value = { isAuthenticated, user, login, logout, isLoading };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};