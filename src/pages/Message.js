// src/pages/MessagesPage.js
import React, { useEffect, useState } from 'react';
import MessagePanel from '../components/MessagePanel';
import ChatBox from '../components/ChatBox';
import axios from 'axios';

const MessagesPage = () => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const token = localStorage.getItem('token');

  // Get logged-in user's ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUserId(res.data.id);
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };
    fetchUser();
  }, [token]);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <MessagePanel onSelectUser={(user) => setSelectedUser(user)} />
      <div style={{ flexGrow: 1, padding: '10px' }}>
        {selectedUser ? (
          <ChatBox 
            senderId={currentUserId} 
            receiverId={selectedUser?.id} 
            receiverUsername={selectedUser?.username} // <-- Pass username here
          />
        ) : (
          <h4>Select a user to start chatting</h4>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
