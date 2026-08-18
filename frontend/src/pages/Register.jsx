import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import './Auth.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); 
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        if (e) e.preventDefault();
        if (!username || !password) {
            setError('Please provide both username and password.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axios.post(`${API_BASE_URL}/register`, { username, password });
            setSuccessMessage('Registration successful! Redirecting to login...'); 
            
            setTimeout(() => {
                navigate('/login'); 
            }, 1200);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="background">
            <div className="register-form">
                <h2>Join StudySpark</h2>
                <form onSubmit={handleRegister}>
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
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>
                {successMessage && <p className="success-message">{successMessage}</p>} 
                {error && <p className="error-message">{error}</p>}
                <p className="auth-switch-text">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
