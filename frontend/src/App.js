import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, Grid3X3, LogOut, LogIn, UserPlus, User, Tractor } from 'lucide-react';
import HomePage from './pages/HomePage';
import EquipmentDetailPage from './pages/EquipmentDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';

function App() {
  const [user, setUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        <header className="navbar">
          <div className="navbar-container">
            <Link to="/" className="navbar-logo">
              <Tractor size={28} /> FarmShare
            </Link>
            <nav className="nav-menu">
              <Link to="/" className="nav-link">
                <Grid3X3 size={16} /> Browse Equipment
              </Link>
              {user ? (
                <>
                  <Link to="/dashboard" className="nav-link">
                    <Home size={16} /> Dashboard
                  </Link>
                  <span className="nav-user">
                    <User size={14} /> {user.name}
                  </span>
                  <button onClick={handleLogout} className="nav-button">
                    <LogOut size={14} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-link">
                    <LogIn size={16} /> Login
                  </Link>
                  <Link to="/register" className="nav-button-link">
                    <UserPlus size={14} /> Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/equipment/:id" element={<EquipmentDetailPage user={user} />} />
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/register" element={<RegisterPage setUser={setUser} />} />
          <Route path="/dashboard" element={user ? <DashboardPage user={user} setUser={setUser} /> : <LoginPage setUser={setUser} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
