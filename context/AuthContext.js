'use client'

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('secret-santa-login-token');
        if (token) {
            setIsLoggedIn(true);
            const storedUserData = JSON.parse(localStorage.getItem('secret-santa-user-data'));
            setUserData(storedUserData);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    // Create a function to update user data if needed
    const updateUserData = (newUserData) => {
        setUserData(newUserData);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, userData, updateUserData }}>
            {children}
        </AuthContext.Provider>
    );
}
