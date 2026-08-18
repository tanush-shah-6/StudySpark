import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RoomList.css';

const RoomList = () => {
    const [joinedRooms, setJoinedRooms] = useState([]);
    const [message, setMessage] = useState('');
    const [editingRoomId, setEditingRoomId] = useState(null);
    const [editTopicValue, setEditTopicValue] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const fetchJoinedRooms = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get('http://localhost:5000/api/studyrooms/joined', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setJoinedRooms(response.data || []);
        } catch (err) {
            console.error('Error fetching joined rooms:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJoinedRooms();
    }, [token]);

    const handleGoToChatRoom = (roomId) => {
        navigate(`/chat-room/${roomId}`);
    };

    const startEditing = (room) => {
        setEditingRoomId(room._id);
        setEditTopicValue(room.topic || '');
        setMessage('');
    };

    const cancelEditing = () => {
        setEditingRoomId(null);
        setEditTopicValue('');
    };

    const handleSaveTopic = async (roomId) => {
        if (!editTopicValue.trim()) return;

        try {
            const response = await axios.patch(
                `http://localhost:5000/api/studyrooms/${roomId}/edit-topic`,
                { topic: editTopicValue },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setJoinedRooms((prevRooms) =>
                prevRooms.map((room) =>
                    room._id === roomId ? { ...room, topic: response.data.room.topic } : room
                )
            );
            setEditingRoomId(null);
            setEditTopicValue('');
        } catch (err) {
            if (err.response && err.response.status === 403) {
                setMessage('Unauthorized: Only the creator can edit this room topic');
            } else {
                console.error('Error updating topic:', err);
                setMessage('Failed to update topic');
            }
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (!window.confirm('Are you sure you want to delete this room?')) return;

        try {
            await axios.delete(`http://localhost:5000/api/studyrooms/${roomId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setJoinedRooms((prevRooms) => prevRooms.filter((room) => room._id !== roomId));
            setMessage('');
        } catch (err) {
            if (err.response && err.response.status === 403) {
                setMessage('Unauthorized: Only the creator can delete this room');
            } else {
                console.error('Error deleting room:', err);
                setMessage('Failed to delete room');
            }
        }
    };

    if (loading) {
        return <div className="room-list-loading">Loading your study rooms...</div>;
    }

    return (
        <div className="room-list">
            <h2>Your Joined Study Rooms</h2>
            {message && <p className="error-message">{message}</p>}
            {joinedRooms.length === 0 ? (
                <p className="room-list-text">No joined rooms available. Join a room or create one to start collaborating!</p>
            ) : (
                <div className="room-cards">
                    {joinedRooms.map((room) => (
                        <div key={room._id} className="room-card">
                            <h3>{room.name}</h3>
                            
                            {editingRoomId === room._id ? (
                                <div className="edit-topic-form">
                                    <input
                                        type="text"
                                        value={editTopicValue}
                                        onChange={(e) => setEditTopicValue(e.target.value)}
                                        placeholder="New topic"
                                        className="edit-topic-input"
                                    />
                                    <div className="edit-topic-actions">
                                        <button onClick={() => handleSaveTopic(room._id)} className="save-btn">Save</button>
                                        <button onClick={cancelEditing} className="cancel-btn">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <p><strong>Topic:</strong> {room.topic || 'General'}</p>
                            )}

                            <div className="room-card-buttons">
                                <button onClick={() => handleGoToChatRoom(room._id)} className="chat-button">
                                    Go to Chat Room
                                </button>
                                {editingRoomId !== room._id && (
                                    <button onClick={() => startEditing(room)} className="edit-button">
                                        Edit Topic
                                    </button>
                                )}
                                <button onClick={() => handleDeleteRoom(room._id)} className="delete-button">
                                    Delete Room
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RoomList;
