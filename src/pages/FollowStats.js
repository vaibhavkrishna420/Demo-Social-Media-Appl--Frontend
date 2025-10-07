
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import authHeader from '../utils/authHeader';
import './Follow.css';

const FollowStats = () => {
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [followingRes, followersRes] = await Promise.all([
          axios.get("http://localhost:8080/api/follow/following", { headers: authHeader() }),
          axios.get("http://localhost:8080/api/follow/followers", { headers: authHeader() }),
        ]);

        setFollowing(followingRes.data);
        setFollowers(followersRes.data);
      } catch (err) {
        console.error("Error fetching follow data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="follow-page">
      <h2>👥 You are Following</h2>
      <ul className="follow-list">
        {following.length === 0 ? (
          <li>You're not following anyone yet.</li>
        ) : (
          following.map(user => <li key={user.id}>@{user.username}</li>)
        )}
      </ul>

      <h2>🙋 Your Followers</h2>
      <ul className="follow-list">
        {followers.length === 0 ? (
          <li>You don’t have any followers yet.</li>
        ) : (
          followers.map(user => <li key={user.id}>@{user.username}</li>)
        )}
      </ul>
    </div>
  );
};

export default FollowStats;

