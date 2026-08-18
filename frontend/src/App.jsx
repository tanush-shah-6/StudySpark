import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header/Header';
import Hero from './components/Home/Hero';
import FeatureSection from './components/Home/Features';
import Footer from './components/Footer/Footer';
import Tools from './pages/Tools';
import Login from './pages/Login';
import Register from './pages/Register';
import StudyRoom from './pages/StudyRoom';
import 'font-awesome/css/font-awesome.min.css';
import ChatRoom from './components/StudyRoom/ChatRoom';
import './App.css';

// Helper to check if a JWT token is expired
const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.exp) return false;
        return Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
};

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    // Check token validity on mount and periodically
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !isTokenExpired(token)) {
            setIsAuthenticated(true);
        } else {
            handleLogout();
        }
        setAuthChecked(true);

        // Check token expiration every minute
        const interval = setInterval(() => {
            const currentToken = localStorage.getItem('token');
            if (currentToken && isTokenExpired(currentToken)) {
                handleLogout();
            }
        }, 60 * 1000);

        return () => clearInterval(interval);
    }, [handleLogout]);

    // Axios global response interceptor to auto-logout on any 401 response
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    handleLogout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [handleLogout]);

    if (!authChecked) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <Router>
            <div className="App">
                <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
                <Routes>
                    <Route path="/" element={<><Hero /><FeatureSection /></>} />
                    <Route path="/tools" element={isAuthenticated ? <Tools /> : <Navigate to="/login" state={{ from: '/tools' }} />} />
                    <Route path="/studyrooms" element={isAuthenticated ? <StudyRoom /> : <Navigate to="/login" state={{ from: '/studyrooms' }} />} />
                    <Route path="/login" element={<Login setIsAuthenticated={handleLogin} />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/chat-room/:roomId" element={isAuthenticated ? <ChatRoom /> : <Navigate to="/login" state={{ from: window.location.pathname }} />} />
                </Routes>
                <Footer />
            </div>
        </Router>
    );
};

export default App;
