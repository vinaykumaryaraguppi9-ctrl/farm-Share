import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapPin, User, Filter, Tractor, Shovel, Axe, Package, Zap } from 'lucide-react';
import './HomePage.css';

const HomePage = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [rentalStatus, setRentalStatus] = useState({});

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true);
      const url = category 
        ? `http://localhost:5000/api/equipment/category/${category}`
        : 'http://localhost:5000/api/equipment';
      const response = await axios.get(url);
      setEquipment(response.data);
      
      // Fetch rental status for each equipment
      const statusMap = {};
      for (const item of response.data) {
        try {
          const statusRes = await axios.get(`http://localhost:5000/api/rentals/equipment/${item.id}/status`);
          statusMap[item.id] = statusRes.data.isRented;
        } catch (error) {
          statusMap[item.id] = false;
        }
      }
      setRentalStatus(statusMap);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const getCategoryIcon = (cat) => {
    switch(cat) {
      case 'Tractors': return <Tractor size={16} />;
      case 'Plows': return <Shovel size={16} />;
      case 'Harvesters': return <Package size={16} />;
      case 'Balers': return <Axe size={16} />;
      case 'Sprayers': return <Zap size={16} />;
      default: return <Tractor size={16} />;
    }
  };

  const categories = ['Tractors', 'Plows', 'Harvesters', 'Balers', 'Sprayers'];

  return (
    <div className="container">
      <div className="homepage">
        {/* HERO SECTION */}
        <div className="homepage-hero">
          <div className="homepage-hero-content">
            <h1>🌾 FarmShare</h1>
            <p>Connect with farmers in your community. Rent quality agricultural equipment at affordable prices or earn money by sharing your equipment.</p>
          </div>
        </div>

        {/* CATEGORY FILTER */}
        <div className="category-filter">
          <button 
            className={category === '' ? 'active' : ''}
            onClick={() => setCategory('')}
          >
            <Filter size={16} /> All Equipment
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={category === cat ? 'active' : ''}
              onClick={() => setCategory(cat)}
            >
              {getCategoryIcon(cat)} {cat}
            </button>
          ))}
        </div>

        {/* EQUIPMENT LIST */}
        {loading ? (
          <div className="loading-state">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="loading-card"></div>
            ))}
          </div>
        ) : (
          <div className="equipment-grid">
            {equipment.length > 0 ? (
              equipment.map(item => (
                <div key={item.id} className="equipment-card">
                  <div className="equipment-image">
                    <img 
                      src={item.image_url && item.image_url.startsWith('http') ? item.image_url : 
                           item.image_url ? `http://localhost:5000${item.image_url}` : 
                           'https://via.placeholder.com/300x200'} 
                      alt={item.name} 
                    />
                    {rentalStatus[item.id] && (
                      <div className="under-use-overlay">
                        <span className="under-use-label">🔴 UNDER USE</span>
                      </div>
                    )}
                  </div>
                  <div className="equipment-info">
                    <h3>{item.name}</h3>
                    <p className="description">{item.description}</p>
                    <div className="owner">{item.owner_name}</div>
                    <div className="location">{item.location}</div>
                    <div className="equipment-footer">
                      <div className="price">${item.daily_rate}</div>
                      <Link to={`/equipment/${item.id}`} className="view-btn">
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-equipment" style={{ gridColumn: '1 / -1' }}>
                <p>No equipment found in this category</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
