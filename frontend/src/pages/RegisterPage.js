import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import './RegisterPage.css';

const RegisterPage = ({ setUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    location: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (formData.password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/users/register', formData);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      alert('Registration failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthText = () => {
    const strengthTexts = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return strengthTexts[passwordStrength - 1] || '';
  };

  const getPasswordStrengthColor = () => {
    const colors = ['#e74c3c', '#f39c12', '#f1c40f', '#27ae60', '#2ecc71'];
    return colors[passwordStrength - 1] || '#ccc';
  };

  return (
    <div className="container">
      <div className="auth-page">
        <div className="auth-card register-card">
          <div className="auth-header">
            <h1>🌾 Join FarmShare</h1>
            <p className="subtitle">Create your account in just a few steps</p>
          </div>

          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label><Mail size={16} /> Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label><User size={16} /> Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label><MapPin size={16} /> Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter your location"
              />
            </div>

            <div className="form-group">
              <label><Phone size={16} /> Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label><Lock size={16} /> Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
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
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar" style={{ width: `${passwordStrength * 25}%`, backgroundColor: getPasswordStrengthColor() }}></div>
                  <span style={{ color: getPasswordStrengthColor() }}>{getPasswordStrengthText()}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label><Lock size={16} /> Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
              {confirmPassword && formData.password === confirmPassword && (
                <div className="password-match-check">
                  <CheckCircle size={14} /> Passwords match
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Creating Account...' : 'Sign Up'} <ArrowRight size={16} />
            </button>
          </form>

          <p className="signup-link">
            Already have an account? <a href="/login">Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
