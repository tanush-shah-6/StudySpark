import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import './CreateRoom.css';

const CreateRoom = ({ onRoomCreated }) => {
    const [roomName, setRoomName] = useState('');
    const [topic, setTopic] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleCreateRoom = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            setError('You need to be logged in to create a room.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data } = await axios.post(
                `${API_BASE_URL}/api/studyrooms/create`,
                { name: roomName, topic },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccessMessage('Room created successfully! Redirecting...');
            setRoomName('');
            setTopic('');

            setTimeout(() => {
                if (onRoomCreated) {
                    onRoomCreated();
                } else {
                    navigate('/studyrooms');
                }
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.error || 'Error creating the room. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-room-form">
            <h2>Create Study Room</h2>
            <form onSubmit={handleCreateRoom}>
                <div className="form-group">
                    <label htmlFor="roomName">Room Name</label>
                    <input
                        type="text"
                        id="roomName"
                        placeholder="Enter Room Name"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="topic">Topic</label>
                    <input
                        type="text"
                        id="topic"
                        placeholder="Enter Topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <button type="submit" disabled={loading || !roomName}>
                    {loading ? 'Creating...' : 'Create Room'}
                </button>

                {successMessage && <p className="success-message">{successMessage}</p>}
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
};

export default CreateRoom;
