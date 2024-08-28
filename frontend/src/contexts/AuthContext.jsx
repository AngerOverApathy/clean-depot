import React, { createContext, useState, useContext } from 'react';

// Create a Context for authentication
const AuthContext = createContext();

// Custom hook to use the AuthContext
const useAuth = () => useContext(AuthContext);

// AuthProvider component that will wrap the app or part of it
const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Function to log in the user
    const login = () => setIsLoggedIn(true);

    // Function to log out the user
    const logout = () => setIsLoggedIn(false);

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Consolidate the exports at the bottom
export { AuthProvider, useAuth, AuthContext };