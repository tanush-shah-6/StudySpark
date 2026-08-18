import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Login = ({ setIsAuthenticated }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); 
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false); 
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }

        setLoading(true); 
        setError(''); 

        try {
            const response = await axios.post('http://localhost:5000/login', { username, password });
            localStorage.setItem('token', response.data.token);
            setSuccess(true);
            
            if (setIsAuthenticated) {
                setIsAuthenticated(true);
            }

            setTimeout(() => {
                navigate('/');
            }, 800); 
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed, please check your credentials'); 
        } finally {
            setLoading(false); 
        }
    };

    return (
        <div className="background">
            <div className="login-form">
                <h2>Login to StudySpark</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        autoFocus
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                {success && <p className="success-message">Login successful! Redirecting...</p>} 
                {error && <p className="error-message">{error}</p>}
                <p className="auth-switch-text">
                    Don't have an account? <Link to="/register">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
