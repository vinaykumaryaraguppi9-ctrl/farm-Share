'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from localStorage:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userToken');
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="navbar-brand">
          🚜 Farm Equipment Sharing
        </Link>
        
        <div className="navbar-links">
          <Link href="/" className="nav-link">Home</Link>
          
          {user ? (
            <>
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
              <button onClick={handleLogout} className="nav-btn logout-btn">
                Logout ({user.name})
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">Login</Link>
              <Link href="/register" className="nav-btn register-btn">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
