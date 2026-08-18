import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ isAuthenticated, onLogout }) => {
    return (
        <header className="header">
            <Link to="/" className="logo-link">
                <img src="/images/logo.png" alt="StudySpark" className="logo" />
            </Link>
            <nav className="nav">
                <Link to="/">Home</Link>
                {isAuthenticated && (
                    <>
                        <Link to="/studyrooms">Study Rooms</Link>
                        <Link to="/tools">Study Tools</Link>
                    </>
                )}
            </nav>
            <div className="auth-buttons">
                {isAuthenticated ? (
                    <button onClick={onLogout} className="logout-link">Logout</button>
                ) : (
                    <>
                        <Link to="/login" className="login-link">Login</Link>
                        <Link to="/register" className="signup-link">Sign Up</Link>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;
