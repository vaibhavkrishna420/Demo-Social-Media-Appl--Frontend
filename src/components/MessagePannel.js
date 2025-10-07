import React, { useEffect, useState } from 'react';
import axios from 'axios';
import authHeader from "../utils/authHeader";

axios.get("http://localhost:8080/api/follow/following", {
  headers: authHeader(),
})
.then(res => {
  console.log(res.data);
})
.catch(err => {
  console.error("❌ Unauthorized", err);
});

const MessagePanel = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/follow/following', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
      } catch (error) {
        console.error('Failed to fetch following users:', error);
      }
    };
    fetchFollowing();
  }, [token]);

  return (
    <div style={{
      width: '25%',
      borderRight: '1px solid #ccc',
      padding: '10px',
      height: '100%',
      overflowY: 'auto',
      backgroundColor: '#f8f8f8'
    }}>
      <h3 style={{ marginBottom: '10px' }}>💬 Messages</h3>

      {users.length === 0 ? (
        <p style={{ color: '#888' }}>You're not following anyone yet.</p>
      ) : (
        users.map((user) => (
          <div
            key={user.id}
            onClick={() => onSelectUser(user)}
            style={{
              cursor: 'pointer',
              padding: '8px',
              marginBottom: '6px',
              backgroundColor: '#fff',
              borderRadius: '5px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e6f7ff'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
          >
            @{user.username}
          </div>
        ))
      )}
    </div>
  );
};

export default MessagePanel;
