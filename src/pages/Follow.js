import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FollowButton from '../components/FollowButton';
import './Follow.css';
import authHeader from '../utils/authHeader';

const Follow = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);

  // ✅ Fetch following users on mount
  useEffect(() => {
    axios
      .get('http://localhost:8080/api/follow/following', {
        headers: authHeader(),
      })
      .then((res) => {
        console.log('✅ Following Users:', res.data);
        setFollowingUsers(res.data);
      })
      .catch((err) => {
        console.error('❌ Unauthorized or error fetching following users', err);
      });
  }, []);

  // ✅ Search users by query
  const handleSearch = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/users/search?query=${query}`,
        {
          headers: authHeader(),
        }
      );
      setUsers(res.data);
    } catch (err) {
      console.error('🔴 Error searching users:', err);
    }
  };

  return (
    <div className="search-users-container">
      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for users..."
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* ✅ Display Following Users */}
      <h3>👥 Following</h3>
      <ul className="user-list">
        {followingUsers.map((user) => (
          <li key={user.id || user.username} className="user-item">
            <span>{user.username}</span>
          </li>
        ))}
      </ul>

      {/* ✅ Display Searched Users with Follow button */}
      <h3>🔍 Search Results</h3>
      <ul className="user-list">
        {users.map((user) => (
          <li key={user.id || user.username} className="user-item">
            <span>{user.username}</span>
            &nbsp;<FollowButton targetUsername={user.username} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Follow;
