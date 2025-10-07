import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MessagePanel from '../components/MessagePannel';
import ChatBox from '../components/ChatBox';
import FollowButton from '../components/FollowButton';

const Home = () => {
  const [username, setUsername] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [showMessages, setShowMessages] = useState(false);
  const [selectedReceiver, setSelectedReceiver] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const authHeader = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const fetchUserAndPosts = useCallback(async () => {
    try {
      const userRes = await axios.get('http://localhost:8080/api/auth/me', authHeader);
      setUsername(userRes.data);

      const postRes = await axios.get('http://localhost:8080/api/posts', authHeader);
      setPosts(postRes.data);
    } catch (err) {
      console.error('Auth failed or post load error:', err);
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [authHeader, navigate]);

  useEffect(() => {
    fetchUserAndPosts();
  }, [fetchUserAndPosts]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:8080/api/users/search?query=${query}`, authHeader); 
      setSearchResults(res.data);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      await axios.post('http://localhost:8080/api/posts', { content: newPost }, authHeader);
      setNewPost('');
      fetchUserAndPosts();
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(`http://localhost:8080/api/posts/${postId}/like`, {}, authHeader);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: [...(post.likes || []), { user: { username } }],
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleUnlike = async (postId) => {
    try {
      await axios.post(`http://localhost:8080/api/posts/${postId}/unlike`, {}, authHeader);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: (post.likes || []).filter(
                  (like) => like.user?.username !== username
                ),
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error unliking post:", error);
    }
  };

  const handleAddComment = async (postId) => {
    const content = commentInputs[postId];
    if (!content || content.trim() === '') return;

    try {
      await axios.post(
        `http://localhost:8080/api/posts/${postId}/comments`,
        { content },
        authHeader
      );
      setCommentInputs({ ...commentInputs, [postId]: '' });
      fetchUserAndPosts();
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Top bar */}
      <div style={{ textAlign: 'right' }}>
        <input
          type="text"
          placeholder="🔍 Search users..."
          value={searchTerm}
          onChange={handleSearch}
          style={{ padding: '5px', marginRight: '10px' }}
        />
        <button onClick={() => setShowMessages((prev) => !prev)} style={{ marginRight: '10px' }}>
          💬
        </button>
        <button onClick={handleLogout}>🚪 Logout</button>
      </div>

      <h2>🏠 Welcome, {username || 'Loading...'}</h2>

      {/* 📊 Navigate to Follow Stats */}
      <div style={{ marginTop: '10px' }}>
        <button onClick={() => navigate('/follow-stats')}>
          📊 View Follow Stats
        </button>
      </div>

      {showMessages && (
        <div style={{ display: 'flex', marginTop: '20px', gap: '20px' }}>
          <MessagePanel onSelectUser={(user) => setSelectedReceiver(user)} />
          {selectedReceiver ? (
            <ChatBox senderId={username} receiverId={selectedReceiver.id} />
          ) : (
            <div style={{ flex: 1, padding: '10px' }}>
              <h4>📨 Select a user to start chatting</h4>
            </div>
          )}
        </div>
      )}

      {/* Search results */}
      {searchResults.length > 0 && (
        <div>
          <h3>🔎 Search Results:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {searchResults.map((user) => (
              <li
                key={user.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px',
                  borderBottom: '1px solid #ccc'
                }}
              >
                <span>@{user.username}</span>
                <FollowButton targetUsername={user.username} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Create post */}
      <div style={{ marginTop: '30px' }}>
        <h3>📝 Create New Post</h3>
        <form onSubmit={handleCreatePost}>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            style={{ width: '25%', padding: '10px' }}
          />
          <button type="submit" style={{ marginTop: '10px' }}>
            Post
          </button>
        </form>
      </div>

      {/* Display posts */}
      <div style={{ marginTop: '40px' }}>
        <h3>📰 All Posts</h3>
        {posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
              <strong>@{post.user?.username || 'Unknown User'}</strong>
              <p>{post.content}</p>

              <div>
                <button onClick={() => handleLike(post.id)}>❤️ Like</button>
                <button onClick={() => handleUnlike(post.id)}>💔 Unlike</button>
                <span style={{ marginLeft: '10px' }}>
                  👍 {post.likes?.length || 0} Likes
                </span>
              </div>

              {/* Comment section */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddComment(post.id);
                }}
              >
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentInputs[post.id] || ''}
                  onChange={(e) =>
                    setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                  }
                  style={{ marginRight: '5px', padding: '5px' }}
                />
                <button type="submit">Comment</button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
