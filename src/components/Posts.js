import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import './Posts.css';

const Posts = ({ refreshTrigger }) => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');

  const token = localStorage.getItem('token');

  const authHeader = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/posts', authHeader);
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    }
  }, [authHeader]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, refreshTrigger]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/posts', { content: newPost }, authHeader);
      setNewPost('');
      fetchPosts();
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(`http://localhost:8080/api/posts/${postId}/like`, {}, authHeader);
      fetchPosts();
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleUnlike = async (postId) => {
    try {
      await axios.post(`http://localhost:8080/api/posts/${postId}/unlike`, {}, authHeader);
      fetchPosts();
    } catch (err) {
      console.error('Unlike failed:', err);
    }
  };

  const handleAddComment = async (postId, commentText) => {
    try {
      await axios.post(`http://localhost:8080/api/posts/${postId}/comments`, { content: commentText }, authHeader);
      fetchPosts();
    } catch (err) {
      console.error('Comment failed:', err);
    }
  };

  return (
    <div className="posts-container">
      <div className="new-post-section">
        <h2>Create a Post</h2>
        <form onSubmit={handleCreatePost}>
          <textarea
            placeholder="What's on your mind?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            required
          />
          <button type="submit">Post</button>
        </form>
      </div>

      <div className="all-posts-section">
        <h2>All Posts</h2>
        {posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              <strong>@{post.user?.username || 'Unknown User'}</strong>
              <p>{post.content}</p>

              <div className="post-actions">
                <button onClick={() => handleLike(post.id)}>❤️ Like</button>
                <button onClick={() => handleUnlike(post.id)}>💔 Unlike</button>

                <div style={{ marginTop: '5px', color: 'gray' }}>
                  ❤️ Likes: {post.likes?.length || 0} &nbsp;&nbsp;
                  💬 Comments: {post.comments?.length || 0}
                </div>
              </div>

              <CommentForm postId={post.id} onAddComment={handleAddComment} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const CommentForm = ({ postId, onAddComment }) => {
  const [comment, setComment] = useState('');

  const submitComment = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      onAddComment(postId, comment);
      setComment('');
    }
  };

  return (
    <form className="comment-form" onSubmit={submitComment}>
      <input
        type="text"
        placeholder="Add a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button type="submit">Comment</button>
    </form>
  );
};

export default Posts;
