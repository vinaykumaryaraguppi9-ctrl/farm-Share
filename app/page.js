'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import './HomePage.css';

export default function HomePage() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [rentalStatus, setRentalStatus] = useState({});

  const categories = ['All', 'Tractors', 'Plows', 'Harvesters', 'Balers', 'Sprayers'];

  useEffect(() => {
    fetchEquipment();
  }, [selectedCategory]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const url = selectedCategory === 'All'
        ? '/api/equipment'
        : `/api/equipment?category=${selectedCategory}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch equipment');
      const data = await response.json();
      setEquipment(data);
      setError(null);

      // Fetch rental status for each equipment
      data.forEach(item => {
        checkRentalStatus(item.id);
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkRentalStatus = async (equipmentId) => {
    try {
      const response = await fetch(`/api/rentals/equipment/${equipmentId}/status`);
      if (response.ok) {
        const data = await response.json();
        setRentalStatus(prev => ({
          ...prev,
          [equipmentId]: data.isRented
        }));
      }
    } catch (err) {
      console.error('Error checking rental status:', err);
    }
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      'Tractors': '🚜',
      'Plows': '🏵️',
      'Harvesters': '🌾',
      'Balers': '📦',
      'Sprayers': '💨',
    };
    return emojis[category] || '🔧';
  };

  const getCategoryDescription = (category) => {
    const descriptions = {
      'Tractors': 'All-purpose farming equipment',
      'Plows': 'Soil preparation equipment',
      'Harvesters': 'Crop collection tools',
      'Balers': 'Hay and crop packaging',
      'Sprayers': 'Pest control equipment',
    };
    return descriptions[category] || 'Farm equipment';
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Share Farm Equipment</h1>
          <p>Connect with local farmers and rent equipment affordably</p>
          <Link href="/register" className="cta-button">
            Get Started
          </Link>
        </div>
      </section>

      {/* Equipment Guide */}
      <section className="equipment-guide">
        <h2>Equipment Types</h2>
        <div className="guide-grid">
          {categories.slice(1).map(category => (
            <div key={category} className="guide-card">
              <div className="guide-emoji">{getCategoryEmoji(category)}</div>
              <h3>{category}</h3>
              <p>{getCategoryDescription(category)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Browse Equipment */}
      <section className="browse-section">
        <div className="section-header">
          <h2>Browse Equipment</h2>
          <div className="category-filter">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading equipment...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>❌ {error}</p>
            <button onClick={fetchEquipment}>Retry</button>
          </div>
        )}

        {!loading && equipment.length === 0 && (
          <div className="no-results">
            <p>No equipment found in this category</p>
          </div>
        )}

        {!loading && equipment.length > 0 && (
          <div className="equipment-grid">
            {equipment.map(item => (
              <div key={item.id} className="equipment-card">
                <div className="card-image">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} />
                  ) : (
                    <div className="image-placeholder">📷</div>
                  )}
                  {rentalStatus[item.id] && (
                    <span className="rental-badge">UNDER USE</span>
                  )}
                </div>
                <div className="card-content">
                  <h3>{item.name}</h3>
                  <p className="category-tag">{item.category}</p>
                  <p className="description">{item.description}</p>
                  <div className="card-footer">
                    <span className="price">₹{item.dailyRate}/day</span>
                    <Link href={`/equipment/${item.id}`} className="view-btn">
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
