'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './DashboardPage.css';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [rentals, setRentals] = useState([]);
  const [userEquipment, setUserEquipment] = useState([]);
  const [browseEquipment, setBrowseEquipment] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchRentals(parsedUser.id);
      fetchUserEquipment(parsedUser.id);
      fetchBrowseEquipment();
      fetchPendingRequests(parsedUser.id);
    } catch (err) {
      console.error('Error parsing user:', err);
      router.push('/login');
    }
  }, [router]);

  const fetchRentals = async (userId) => {
    try {
      const response = await fetch(`/api/rentals?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setRentals(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching rentals:', err);
    }
  };

  const fetchUserEquipment = async (userId) => {
    try {
      const response = await fetch(`/api/equipment?owner_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserEquipment(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching user equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrowseEquipment = async () => {
    try {
      const response = await fetch('/api/equipment');
      if (response.ok) {
        const data = await response.json();
        setBrowseEquipment(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching equipment:', err);
    }
  };

  const fetchPendingRequests = async (userId) => {
    try {
      const response = await fetch(`/api/rentals?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        const pending = Array.isArray(data) 
          ? data.filter(r => r.ownerId === userId && r.status === 'pending')
          : [];
        setPendingRequests(pending);
      }
    } catch (err) {
      console.error('Error fetching pending requests:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1>Welcome, {user.name}!</h1>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
          <button 
            className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            📬 Rental Requests ({pendingRequests.length})
          </button>
          <button 
            className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            📂 Browse Equipment
          </button>
          <button 
            className={`tab ${activeTab === 'rentals' ? 'active' : ''}`}
            onClick={() => setActiveTab('rentals')}
          >
            🚗 My Rentals
          </button>
          <button 
            className={`tab ${activeTab === 'equipment' ? 'active' : ''}`}
            onClick={() => setActiveTab('equipment')}
          >
            🔧 My Equipment
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="tab-content">
            <h2>My Profile</h2>
            <div className="profile-card">
              <div className="profile-field">
                <label>Name</label>
                <p>{user.name}</p>
              </div>
              <div className="profile-field">
                <label>Email</label>
                <p>{user.email}</p>
              </div>
              <div className="profile-field">
                <label>Phone</label>
                <p>{user.phone || 'Not provided'}</p>
              </div>
              <div className="profile-field">
                <label>Location</label>
                <p>{user.location || 'Not provided'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="tab-content">
            <h2>Rental Requests</h2>
            {pendingRequests.length === 0 ? (
              <p className="empty-state">No pending rental requests</p>
            ) : (
              <div className="requests-grid">
                {pendingRequests.map(req => (
                  <div key={req.id} className="request-card">
                    <div className="request-header">
                      <h3>{req.equipment?.name}</h3>
                      <span className="status-pending">PENDING</span>
                    </div>
                    <div className="request-content">
                      <div className="info-block">
                        <strong>From:</strong>
                        <p>{req.renter?.name}</p>
                        <small>{req.renter?.email}</small>
                      </div>
                      <div className="info-block">
                        <strong>Dates:</strong>
                        <p>{req.startDate} to {req.endDate}</p>
                      </div>
                      <div className="info-block">
                        <strong>Cost:</strong>
                        <p>₹{req.totalCost?.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <div className="tab-content">
            <h2>Browse Equipment</h2>
            {browseEquipment.length === 0 ? (
              <p className="empty-state">No equipment available</p>
            ) : (
              <div className="equipment-grid">
                {browseEquipment.map(item => (
                  <Link 
                    key={item.id} 
                    href={`/equipment/${item.id}`}
                    className="equipment-link"
                  >
                    <div className="equipment-card">
                      <div className="card-image">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} />
                        ) : (
                          <div className="image-placeholder">📷</div>
                        )}
                      </div>
                      <div className="card-content">
                        <h3>{item.name}</h3>
                        <p className="category">{item.category}</p>
                        <p className="price">₹{item.dailyRate}/day</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rentals Tab */}
        {activeTab === 'rentals' && (
          <div className="tab-content">
            <h2>My Rentals</h2>
            {rentals.length === 0 ? (
              <p className="empty-state">No active rentals</p>
            ) : (
              <div className="rentals-list">
                {rentals.filter(r => r.renterId === user.id).map(rental => (
                  <div key={rental.id} className="rental-item">
                    <div className="rental-header">
                      <h3>{rental.equipment?.name}</h3>
                      <span className={`status ${rental.status}`}>{rental.status}</span>
                    </div>
                    <div className="rental-details">
                      <p><strong>Dates:</strong> {rental.startDate} → {rental.endDate}</p>
                      <p><strong>Cost:</strong> ₹{rental.totalCost?.toFixed(2)}</p>
                      <p><strong>Owner:</strong> {rental.owner?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Equipment Tab */}
        {activeTab === 'equipment' && (
          <div className="tab-content">
            <h2>My Equipment</h2>
            {userEquipment.length === 0 ? (
              <p className="empty-state">You haven't listed any equipment yet</p>
            ) : (
              <div className="equipment-grid">
                {userEquipment.map(item => (
                  <div key={item.id} className="equipment-card">
                    <div className="card-image">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} />
                      ) : (
                        <div className="image-placeholder">📷</div>
                      )}
                    </div>
                    <div className="card-content">
                      <h3>{item.name}</h3>
                      <p className="category">{item.category}</p>
                      <p className="description">{item.description}</p>
                      <p className="price">₹{item.dailyRate}/day</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
