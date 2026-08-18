import React, { useState } from 'react';
import CreateRoom from '../components/StudyRoom/CreateRoom';
import RoomList from '../components/StudyRoom/RoomList';
import JoinRoom from '../components/StudyRoom/JoinRoom';
import './StudyRoom.css';
import 'font-awesome/css/font-awesome.min.css';

const StudyRoom = () => {
    const [activeTab, setActiveTab] = useState('room-list');

    return (
        <div className="study-room-container">
            <h1 className="study-room-title">Study Rooms</h1>

            <div className="tab-buttons">
                <button
                    className={`tab-button ${activeTab === 'room-list' ? 'active' : ''}`}
                    onClick={() => setActiveTab('room-list')}
                >
                    My Rooms
                </button>
                <button
                    className={`tab-button ${activeTab === 'create-room' ? 'active' : ''}`}
                    onClick={() => setActiveTab('create-room')}
                >
                    Create Room
                </button>
                <button
                    className={`tab-button ${activeTab === 'join-room' ? 'active' : ''}`}
                    onClick={() => setActiveTab('join-room')}
                >
                    Join Room
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'room-list' && <RoomList />}
                {activeTab === 'create-room' && <CreateRoom onRoomCreated={() => setActiveTab('room-list')} />}
                {activeTab === 'join-room' && <JoinRoom onRoomJoined={() => setActiveTab('room-list')} />}
            </div>
        </div>
    );
};

export default StudyRoom;