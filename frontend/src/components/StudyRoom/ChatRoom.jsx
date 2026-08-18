import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import './ChatRoom.css';

const ChatRoom = () => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Initialize socket connection with auth token
    socketRef.current = io(API_BASE_URL, {
      auth: { token }
    });

    // Get current user info
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        navigate('/login');
      }
    };

    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/studyrooms/${roomId}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(response.data || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
    fetchMessages();

    // Join the room via socket
    socketRef.current.emit('joinRoom', { roomId });

    // Listen for incoming messages in real-time
    socketRef.current.on('newMessage', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    // Listen for loaded room messages
    socketRef.current.on('loadMessages', (loadedMessages) => {
      if (loadedMessages && loadedMessages.length > 0) {
        setMessages(loadedMessages);
      }
    });

    // Listen for errors
    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leaveRoom', { roomId });
        socketRef.current.disconnect();
      }
    };
  }, [roomId, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('chatMessage', { roomId, message: newMessage.trim() });
    } else {
      // Fallback to REST API if socket is temporarily disconnected
      axios.post(
        `${API_BASE_URL}/api/studyrooms/${roomId}/sendMessage`,
        { text: newMessage.trim() },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      ).catch(err => console.error('Error sending message fallback:', err));
    }
    
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const goBack = () => {
    navigate('/studyrooms');
  };

  const isCurrentUserMessage = (msg) => {
    if (!currentUser || !msg.sender) return false;
    const senderId = msg.sender._id || msg.sender;
    const currentUserId = currentUser.id || currentUser._id;
    return senderId?.toString() === currentUserId?.toString();
  };

  return (
    <div className="container-chat">
      <div className="chat-room">
        <button className="back-button" onClick={goBack}>
          &larr; Back to Study Rooms
        </button>
        <div className="chat-header">
          <h2>Study Room Chat</h2>
        </div>
        
        <div className="messages">
          {loading ? (
            <p className="loading-chat-text">Loading conversation...</p>
          ) : messages.length === 0 ? (
            <p className="empty-chat-text">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={msg._id || index} 
                className={`message ${isCurrentUserMessage(msg) ? 'sent' : 'received'}`}
              >
                <div className="message-info">
                  {isCurrentUserMessage(msg) ? 'You' : (msg.sender?.username || 'Learner')}
                </div>
                <div className="message-content">{msg.text}</div>
                {msg.timestamp && (
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form className="message-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
          />
          <button type="submit" disabled={!newMessage.trim()}>Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
