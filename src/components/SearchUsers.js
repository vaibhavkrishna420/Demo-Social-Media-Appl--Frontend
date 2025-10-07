import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authHeader from '../utils/authHeader';
import './SearchUsers.css';

const SearchUsers = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [followedUserIds, setFollowedUserIds] = useState([]);

  // Fetch the list of users the current user is following
  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/follow/following', {
          headers: authHeader()
        });
        const ids = res.data.map(u => u.id);
        setFollowedUserIds(ids);
      } catch (err) {
        console.error('Failed to fetch following:', err);
      }
    };

    fetchFollowing();
  }, []);

  // Search users by query
  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/users/search?query=${query}`,
        { headers: authHeader() }
      );
      setResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // Follow a user
  const handleFollow = async (username, userId) => {
    try {
      await axios.post(
        `http://localhost:8080/api/follow/${username}`,
        {},
        { headers: authHeader() }
      );
      setFollowedUserIds([...followedUserIds, userId]);
    } catch (error) {
      console.error('Follow failed:', error);
    }
  };

  // Unfollow a user
  const handleUnfollow = async (username, userId) => {
    try {
      await axios.delete(`http://localhost:8080/api/follow/${username}`, {
        headers: authHeader()
      });
      setFollowedUserIds(followedUserIds.filter(id => id !== userId));
    } catch (error) {
      console.error('Unfollow failed:', error);
    }
  };

  return (
    <div className="search-users-container">
      <h2>Search Users</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="user-results">
        {results.length === 0 ? (
          <p>No users found.</p>
        ) : (
          results.map((user) => {
            const isFollowing = followedUserIds.includes(user.id);

            return (
              <div key={user.id} className="user-result-card">
                @{user.username}
                <button
                  onClick={() =>
                    isFollowing
                      ? handleUnfollow(user.username, user.id)
                      : handleFollow(user.username, user.id)
                  }
                  style={{
                    marginLeft: '10px',
                    padding: '5px 10px',
                    backgroundColor: isFollowing ? 'red' : 'green',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px'
                  }}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SearchUsers;
