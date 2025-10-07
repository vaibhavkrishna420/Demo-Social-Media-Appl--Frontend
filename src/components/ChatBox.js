// src/components/ChatBox.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// ✅ Get user ID by username (unchanged)
const getUserIdByUsername = async (username, token) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/users/username/${username}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.id;
  } catch (error) {
    console.error('Error fetching user ID for username:', username, error);
    return null;
  }
};

// ✅ FIXED: Get username by user ID
const getUsernameByUserId = async (userId, token) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // 🔧 Correctly access username inside the "user" object
    if (response.data && response.data.user && response.data.user.username) {
      return response.data.user.username;
    }

    return 'Unknown';
  } catch (error) {
    console.error('Error fetching username for userId:', userId, error);
    return 'Unknown';
  }
};

const ChatBox = ({ senderId, receiverId }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [resolvedSenderId, setResolvedSenderId] = useState(null);
  const [resolvedReceiverId, setResolvedReceiverId] = useState(null);
  const [usernamesMap, setUsernamesMap] = useState({});

  const token = localStorage.getItem('token');

  // ✅ Resolve sender/receiver IDs from usernames if needed
  useEffect(() => {
    const resolveIds = async () => {
      let sId = senderId;
      let rId = receiverId;

      if (typeof senderId === 'string' && isNaN(Number(senderId))) {
        sId = await getUserIdByUsername(senderId, token);
      }
      if (typeof receiverId === 'string' && isNaN(Number(receiverId))) {
        rId = await getUserIdByUsername(receiverId, token);
      }

      setResolvedSenderId(sId);
      setResolvedReceiverId(rId);
    };

    resolveIds();
  }, [senderId, receiverId, token]);

  // ✅ Fetch messages when IDs are resolved
  useEffect(() => {
    const fetchMessages = async () => {
      if (!resolvedSenderId || !resolvedReceiverId) return;

      try {
        const res = await axios.get(`http://localhost:8080/api/messages/${resolvedSenderId}/${resolvedReceiverId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };

    fetchMessages();
  }, [resolvedSenderId, resolvedReceiverId, token]);

  // ✅ Fetch usernames for sender/receiver
  useEffect(() => {
    const fetchUsernames = async () => {
      const uniqueUserIds = [...new Set(messages.flatMap(msg => [msg.senderId, msg.receiverId]))];

      const map = {};
      await Promise.all(uniqueUserIds.map(async (id) => {
        map[id] = await getUsernameByUserId(id, token);
      }));

      setUsernamesMap(map);
    };

    if (messages.length > 0) {
      fetchUsernames();
    }
  }, [messages, token]);

  // ✅ Scroll to bottom on new message
  useEffect(() => {
    const container = document.getElementById('chat-scroll');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (text.trim() === '') return;

    if (!resolvedSenderId || !resolvedReceiverId) {
      console.error('Sender or receiver ID not resolved');
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/messages/send', {
        senderId: resolvedSenderId,
        receiverId: resolvedReceiverId,
        content: text
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setText('');

      // Refresh messages
      const res = await axios.get(`http://localhost:8080/api/messages/${resolvedSenderId}/${resolvedReceiverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);

    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (!resolvedSenderId || !resolvedReceiverId) {
    return <div style={{ padding: '10px' }}>Select a user to start chatting 💬</div>;
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: '10px', height: '300px', overflowY: 'auto' }}>
      <h4>💬 Chat</h4>
      <div
        id="chat-scroll"
        style={{
          maxHeight: '220px',
          overflowY: 'scroll',
          marginBottom: '10px',
          paddingRight: '5px'
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.senderId === resolvedSenderId ? 'right' : 'left' }}>
            <p>
              <strong>{msg.senderId === resolvedSenderId ? 'You' : usernamesMap[msg.senderId] || 'Unknown'}:</strong> {msg.content}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '5px' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          style={{ flexGrow: 1 }}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatBox;
