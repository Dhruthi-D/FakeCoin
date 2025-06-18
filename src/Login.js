import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.username) {
      setError('Please enter a username');
      return;
    }

    // Check for admin credentials
    if (formData.username.toLowerCase() === 'ganashree' && formData.password === 'dummy_game') {
      localStorage.setItem('currentUser', formData.username);
      localStorage.setItem('isAdmin', 'true');
      setUser(formData.username);
      navigate('/home');
    } else {
      // Regular user login
      localStorage.setItem('currentUser', formData.username);
      localStorage.setItem('isAdmin', 'false');
      setUser(formData.username);
      navigate('/home');
    }
  };

  return (
    <div className="login-bg-animated">
      <div className="login-container">
        <div className="login-card">
          <div className="login-logo">🪙</div>
          <h1 className="login-title">Welcome to DAA Lab</h1>
          <h2 className="login-subtitle">Fake Coin Detection Game</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="login-input"
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password (optional)"
              className="login-input"
            />
            {error && <div className="login-error">{error}</div>}
            <button type="submit" className="login-button">
              <span role="img" aria-label="login">🔓</span> Start Game
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
