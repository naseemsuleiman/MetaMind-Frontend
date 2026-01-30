import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api'; 

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem(ACCESS_KEY);
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // Set the header immediately if token exists
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const res = await api.get('/profiles/');
                const userData = Array.isArray(res.data) ? res.data[0] : res.data;
                setUser(userData);
            } catch (err) {
                console.warn('Auth session expired. Clearing storage.');
                localStorage.removeItem(ACCESS_KEY);
                localStorage.removeItem(REFRESH_KEY);
                delete api.defaults.headers.common['Authorization'];
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);
const registerUser = async (userData) => {
    try {
        const response = await api.post('register/', userData);
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Registration Error:", error.response?.data);
        return { 
            success: false, 
            error: error.response?.data?.error || error.response?.data || { detail: 'Registration failed' }
        };
    }
};

    // Student Login
    const login = async (username, password) => {
        try {
            const response = await api.post('/token/', { username, password });
            const { access, refresh } = response.data;
            localStorage.setItem(ACCESS_KEY, access);
            localStorage.setItem(REFRESH_KEY, refresh);
            api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

            const profileRes = await api.get('/profiles/');
            const userData = Array.isArray(profileRes.data) ? profileRes.data[0] : profileRes.data;
            setUser(userData);
            return true;
        } catch (error) {
            console.error("Login Error:", error.response?.data);
            return false;
        }
    };

    // ✅ FIXED: Added loginAdmin and included it in the Provider
    const loginAdmin = async (username, password) => {
    try {
        // We use the api instance we just fixed
        const res = await api.post('/admin/login/', { username, password });
        
        const { access, refresh } = res.data;
        localStorage.setItem(ACCESS_KEY, access);
        localStorage.setItem(REFRESH_KEY, refresh);
        
        // This is still good practice to set it for immediate following calls
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        
        setAdmin({ username, isAdmin: true });
        return { success: true }; 
    } catch (err) {
        // This return ensures Login.jsx doesn't explode
        return { 
            success: false, 
            error: err.response?.data || { detail: 'Server Error' } 
        };
    }
};
    const logout = () => {
        localStorage.clear();
        setUser(null);
        setAdmin(null);
        delete api.defaults.headers.common['Authorization'];
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, admin, loading, login, loginAdmin, logout, registerUser }}>
            {children}
        </AuthContext.Provider>
    );
};
