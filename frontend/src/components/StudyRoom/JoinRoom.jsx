import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './JoinRoom.css';

const JoinRoom = ({ onRoomJoined }) => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [joiningId, setJoiningId] = useState(null);
    const navigate = useNavigate();

    const fetchRooms = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Please log in to view available rooms.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get('http://localhost:5000/api/studyrooms/available', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRooms(response.data || []);
            setError('');
        } catch (err) {
            setError('Error fetching available rooms');
            console.error('Error fetching rooms:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleJoinRoom = async (roomId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        setJoiningId(roomId);
        try {
            await axios.post(
                `http://localhost:5000/api/studyrooms/${roomId}/join`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (onRoomJoined) {
                onRoomJoined();
            } else {
                navigate(`/chat-room/${roomId}`);
            }
        } catch (err) {
            console.error('Error joining room:', err);
            alert(err.response?.data?.error || 'Failed to join the room');
        } finally {
            setJoiningId(null);
        }
    };

    if (loading) {
        return <div className="join-loading">Loading rooms...</div>;
    }

    if (error) {
        return <div className="join-error">{error}</div>;
    }

    return (
        <div className="join-room-container">
            <h2 className="join-title">Available Study Rooms</h2>
            <div className="room-items-grid">
                {rooms.length === 0 ? (
                    <p className="no-rooms-text">No available rooms to join right now. Create one!</p>
                ) : (
                    rooms.map((room) => (
                        <div key={room._id} className="join-room-card">
                            <h3>{room.name}</h3>
                            <p><strong>Topic:</strong> {room.topic || 'General'}</p>
                            <p><strong>Members:</strong> {room.members ? room.members.length : 0}</p>
                            <button
                                onClick={() => handleJoinRoom(room._id)}
                                disabled={joiningId === room._id}
                                className="join-btn"
                            >
                                {joiningId === room._id ? 'Joining...' : 'Join Room'}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default JoinRoom;
