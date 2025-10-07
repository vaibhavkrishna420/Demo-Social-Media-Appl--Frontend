import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Follow from './pages/Follow';
import FollowStats from './pages/FollowStats';  
import PrivateRoute from './components/PrivateRoute';

import './App.css';

// Landing Page for guests
const Landing = () => {
  return (
    <div className="landing-container">
      <h1>📱 Welcome to Smedia</h1>
      <div className="landing-buttons">
        <a href="/login" className="btn">Login</a>
        <a href="/register" className="btn">Register</a>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes (wrapped in PrivateRoute) */}
        <Route 
          path="/home" 
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/follow" 
          element={
            <PrivateRoute>
              <Follow />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/follow-stats" 
          element={
            <PrivateRoute>
              <FollowStats />
            </PrivateRoute>
          } 
        />

        {/* Fallback Route for 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
