import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

const FollowButton = ({ targetUsername }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  const token = localStorage.getItem('token');

  const authHeader = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }), [token]);

  const fetchFollowingStatus = useCallback(() => {
    axios
      .get('http://localhost:8080/api/follow/following-names', authHeader)
      .then((res) => {
        const following = res.data || [];
        setIsFollowing(following.includes(targetUsername));
      })
      .catch((err) => console.error('🔴 Error fetching following status:', err));
  }, [authHeader, targetUsername]);

  useEffect(() => {
    fetchFollowingStatus();
  }, [fetchFollowingStatus]);

  // ✅ Toggle follow/unfollow
  const toggleFollow = () => {
    const url = isFollowing
      ? `http://localhost:8080/api/follow/unfollow/${targetUsername}`
      : `http://localhost:8080/api/follow/${targetUsername}`;

    axios
      .post(url, {}, authHeader)
      .then(() => {
        setIsFollowing(!isFollowing);  // Optional: instant toggle
        fetchFollowingStatus();        // Reliable: sync with backend
      })
      .catch((err) => console.error('🔴 Error toggling follow:', err));
  };

  return (
    <button onClick={toggleFollow}>
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
};

export default FollowButton;
