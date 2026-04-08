import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import './LoginPage.css';

const LoginPage = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password
      });

      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
      navigate('/dashboard');
    } catch (error) {
      alert('Login failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage('');

    try {
      setResetMessage('✅ Password reset instructions will be sent to your email shortly.');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail('');
      }, 2000);
    } catch (error) {
      setResetMessage('❌ Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h1>🌾 FarmShare Login</h1>
            <p className="subtitle">Welcome back to your farm equipment hub</p>
          </div>

          {!showForgotPassword ? (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label><Mail size={16} /> Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group">
                <label><Lock size={16} /> Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="auth-button">
                {loading ? 'Logging in...' : 'Login'} <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="auth-form">
              <div className="form-group">
                <label><Mail size={16} /> Email Address</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              {resetMessage && (
                <div className={`message ${resetMessage.startsWith('✅') ? 'success' : 'error'}`}>
                  {resetMessage}
                </div>
              )}
              <button type="submit" disabled={resetLoading} className="auth-button">
                {resetLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="auth-footer">
            <button 
              type="button"
              className="forgot-password-btn"
              onClick={() => {
                setShowForgotPassword(!showForgotPassword);
                setResetMessage('');
              }}
            >
              {showForgotPassword ? '← Back to Login' : 'Forgot Password?'}
            </button>
          </div>

          <p className="signup-link">
            Don't have an account? <a href="/register">Sign up here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
