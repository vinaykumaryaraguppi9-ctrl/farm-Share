import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './DashboardPage.css';

const DashboardPage = ({ user, setUser }) => {
  const [rentals, setRentals] = useState([]);
  const [userEquipment, setUserEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [showAddForm, setShowAddForm] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: user?.name || '',
    location: user?.location || '',
    phone: user?.phone || ''
  });
  
  // Equipment state
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    description: '',
    category: 'Tractors',
    daily_rate: ''
  });
  
  // Equipment edit state
  const [editingEquipmentId, setEditingEquipmentId] = useState(null);
  const [editingEquipment, setEditingEquipment] = useState({
    name: '',
    description: '',
    category: 'Tractors',
    daily_rate: '',
    availability: 1
  });

  // Extension state
  const [extendingRentalId, setExtendingRentalId] = useState(null);
  const [extensionEndDate, setExtensionEndDate] = useState('');

  const fetchUserData = useCallback(async () => {
    try {
      const [rentalsRes, equipmentRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/rentals/user/${user.id}`),
        axios.get(`http://localhost:5000/api/users/${user.id}/equipment`)
      ]);
      setRentals(rentalsRes.data);
      setUserEquipment(equipmentRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Profile edit handlers
  const handleEditProfile = () => {
    setEditedProfile({
      name: user.name,
      location: user.location,
      phone: user.phone
    });
    setEditingProfile(true);
  };

  const handleUpdateProfile = async () => {
    try {
      await axios.put(`http://localhost:5000/api/users/${user.id}`, editedProfile);
      const updatedUser = { ...user, ...editedProfile };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('Profile updated successfully!');
      setEditingProfile(false);
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    }
  };

  // Equipment handlers
  const handleAddEquipment = async (e) => {
    e.preventDefault();
    
    if (!user || !user.id) {
      alert('You must be logged in to add equipment');
      return;
    }
    
    if (!newEquipment.name || !newEquipment.name.trim()) {
      alert('Equipment name is required');
      return;
    }
    
    if (!newEquipment.category) {
      alert('Category is required');
      return;
    }
    
    if (!newEquipment.daily_rate || newEquipment.daily_rate <= 0) {
      alert('Daily rate must be greater than 0');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('owner_id', user.id.toString());
      formData.append('name', newEquipment.name.trim());
      formData.append('description', newEquipment.description.trim());
      formData.append('category', newEquipment.category);
      formData.append('daily_rate', parseFloat(newEquipment.daily_rate).toString());
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await axios.post('http://localhost:5000/api/equipment', formData);
      alert('Equipment added successfully!');
      setNewEquipment({ name: '', description: '', category: 'Tractors', daily_rate: '' });
      setImageFile(null);
      setImagePreview(null);
      setShowAddForm(false);
      fetchUserData();
    } catch (error) {
      console.error('Equipment error details:', error.response?.data || error.message);
      alert('Error adding equipment: ' + (error.response?.data?.error || error.message));
    }
  };

  // Equipment edit handlers
  const handleEditEquipment = (equipment) => {
    setEditingEquipmentId(equipment.id);
    setEditingEquipment({
      name: equipment.name,
      description: equipment.description,
      category: equipment.category,
      daily_rate: equipment.daily_rate,
      availability: equipment.availability
    });
  };

  const handleUpdateEquipment = async () => {
    try {
      await axios.put(`http://localhost:5000/api/equipment/${editingEquipmentId}`, editingEquipment);
      alert('Equipment updated successfully!');
      setEditingEquipmentId(null);
      fetchUserData();
    } catch (error) {
      alert('Error updating equipment: ' + error.message);
    }
  };

  const handleDeleteEquipment = async (equipmentId) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await axios.delete(`http://localhost:5000/api/equipment/${equipmentId}`);
        alert('Equipment deleted successfully!');
        fetchUserData();
      } catch (error) {
        alert('Error deleting equipment: ' + error.message);
      }
    }
  };

  const updateRentalStatus = async (rentalId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/rentals/${rentalId}`, { status });
      alert('Rental status updated!');
      fetchUserData();
    } catch (error) {
      alert('Error updating rental: ' + error.message);
    }
  };

  const handleExtendRental = async (rental) => {
    if (!extensionEndDate) {
      alert('Please select new end date');
      return;
    }

    const newEnd = new Date(extensionEndDate);
    const currentEnd = new Date(rental.end_date);

    if (newEnd <= currentEnd) {
      alert('New end date must be after current end date');
      return;
    }

    const additionalDays = Math.ceil((newEnd - currentEnd) / (1000 * 60 * 60 * 24));
    const additionalCost = additionalDays * rental.daily_rate;

    try {
      const response = await axios.post(`http://localhost:5000/api/rentals/${rental.id}/extend`, {
        new_end_date: extensionEndDate,
        additional_cost: additionalCost
      });
      alert(`Rental extended successfully! Additional cost: $${additionalCost.toFixed(2)}`);
      
      // Update the rental in state with new end date and total cost
      setRentals(rentals.map(r => 
        r.id === rental.id 
          ? { ...r, end_date: extensionEndDate, total_cost: response.data.new_total_cost }
          : r
      ));
      
      setExtendingRentalId(null);
      setExtensionEndDate('');
    } catch (error) {
      alert('Error extending rental: ' + error.message);
    }
  };

  // Separate rentals into bookings (user is renter) and rentals to others (user is owner)
  const myBookings = rentals.filter(r => r.renter_id === user.id);
  const myRentalsToOthers = rentals.filter(r => r.owner_id === user.id);

  // Calculate extension cost helper
  const calculateExtensionCost = (currentEndDate, newEndDate, dailyRate) => {
    if (!currentEndDate || !newEndDate) return 0;
    const current = new Date(currentEndDate);
    const next = new Date(newEndDate);
    if (next <= current) return 0;
    const days = Math.ceil((next - current) / (1000 * 60 * 60 * 24));
    return days * dailyRate;
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container">
      <div className="dashboard">
        <h1>Welcome, {user.name}!</h1>
        <p className="user-location">📍 {user.location}</p>

        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            My Profile
          </button>
          <button
            className={`tab-button ${activeTab === 'rentals' ? 'active' : ''}`}
            onClick={() => setActiveTab('rentals')}
          >
            My Rentals ({myBookings.length + myRentalsToOthers.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'equipment' ? 'active' : ''}`}
            onClick={() => setActiveTab('equipment')}
          >
            My Equipment ({userEquipment.length})
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="tab-content">
            <div className="profile-header">
              <h2>Profile Information</h2>
              <button className="edit-btn" onClick={handleEditProfile}>✏️ Edit Profile</button>
            </div>

            {!editingProfile ? (
              <div className="profile-info">
                <div className="profile-field">
                  <label>Name:</label>
                  <p>{user.name}</p>
                </div>
                <div className="profile-field">
                  <label>Email:</label>
                  <p>{user.email}</p>
                </div>
                <div className="profile-field">
                  <label>Location:</label>
                  <p>{user.location || 'Not specified'}</p>
                </div>
                <div className="profile-field">
                  <label>Phone:</label>
                  <p>{user.phone || 'Not specified'}</p>
                </div>
              </div>
            ) : (
              <form className="profile-form">
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Location:</label>
                  <input
                    type="text"
                    value={editedProfile.location}
                    onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Phone:</label>
                  <input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="submit-btn" onClick={handleUpdateProfile}>
                    Save Changes
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => setEditingProfile(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Rentals Tab */}
        {activeTab === 'rentals' && (
          <div className="tab-content">
            <div className="rentals-container">
              {/* My Bookings Section */}
              <div className="rentals-section">
                <h2>📦 My Bookings</h2>
                <p className="section-subtitle">Equipment I have booked from other farmers</p>
                {myBookings.length > 0 ? (
                  <div className="rentals-list">
                    {myBookings.map(rental => (
                      <div key={rental.id} className="rental-card booking-card">
                        <div className="rental-header">
                          <h3>{rental.equipment_name}</h3>
                          <span className={`status status-${rental.status}`}>{rental.status}</span>
                        </div>
                        
                        <div className="owner-info-section">
                          <h4>Owner Information</h4>
                          <p><strong>Name:</strong> {rental.owner_name}</p>
                          <p><strong>Phone:</strong> {rental.owner_phone || 'Not provided'}</p>
                          <p><strong>Address:</strong> {rental.owner_location || 'Not provided'}</p>
                        </div>

                        <div className="rental-details">
                          <p><strong>Duration:</strong> {rental.start_date} to {rental.end_date}</p>
                          <p><strong>Total Cost:</strong> ${rental.total_cost}</p>
                        </div>

                        {rental.status === 'approved' && (
                          <div className="extension-section">
                            {extendingRentalId !== rental.id ? (
                              <button 
                                className="extend-btn"
                                onClick={() => setExtendingRentalId(rental.id)}
                              >
                                ⏰ Extend Rental
                              </button>
                            ) : (
                              <div className="extension-form">
                                <div className="form-group">
                                  <label>New End Date:</label>
                                  <input
                                    type="date"
                                    value={extensionEndDate}
                                    onChange={(e) => setExtensionEndDate(e.target.value)}
                                    min={rental.end_date}
                                  />
                                </div>
                                {extensionEndDate && calculateExtensionCost(rental.end_date, extensionEndDate, rental.daily_rate) > 0 && (
                                  <div className="cost-preview">
                                    <p className="calculation">
                                      Current End: {rental.end_date} → New End: {extensionEndDate}
                                    </p>
                                    <p className="calculation">
                                      Additional Days: {Math.ceil((new Date(extensionEndDate) - new Date(rental.end_date)) / (1000 * 60 * 60 * 24))}
                                    </p>
                                    <p className="calculation">
                                      Daily Rate: ${rental.daily_rate}
                                    </p>
                                    <p className="additional-cost">
                                      Additional Cost: ${calculateExtensionCost(rental.end_date, extensionEndDate, rental.daily_rate).toFixed(2)}
                                    </p>
                                    <p className="new-total">
                                      New Total: ${(rental.total_cost + calculateExtensionCost(rental.end_date, extensionEndDate, rental.daily_rate)).toFixed(2)}
                                    </p>
                                  </div>
                                )}
                                <div className="extension-actions">
                                  <button 
                                    className="confirm-btn"
                                    onClick={() => handleExtendRental(rental)}
                                  >
                                    Confirm Extension
                                  </button>
                                  <button 
                                    className="cancel-btn"
                                    onClick={() => {
                                      setExtendingRentalId(null);
                                      setExtensionEndDate('');
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {rental.status === 'pending' && (
                          <p className="pending-message">⏳ Waiting for owner approval</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-message">No bookings yet. Browse equipment and rent from other farmers!</p>
                )}
              </div>

              {/* Rentals to Others Section */}
              <div className="rentals-section">
                <h2>🏠 Rentals to Others</h2>
                <p className="section-subtitle">My equipment currently rented to other farmers</p>
                {myRentalsToOthers.length > 0 ? (
                  <div className="rentals-list">
                    {myRentalsToOthers.map(rental => (
                      <div key={rental.id} className="rental-card rental-to-others-card">
                        <div className="rental-header">
                          <h3>{rental.equipment_name}</h3>
                          <span className={`status status-${rental.status}`}>{rental.status}</span>
                        </div>
                        
                        <div className="renter-info-section">
                          <h4>Renter Information</h4>
                          <p><strong>Name:</strong> {rental.renter_name}</p>
                          <p><strong>Phone:</strong> {rental.renter_phone || 'Not provided'}</p>
                          <p><strong>Address:</strong> {rental.renter_location || 'Not provided'}</p>
                        </div>

                        <div className="rental-details">
                          <p><strong>Duration:</strong> {rental.start_date} to {rental.end_date}</p>
                          <p><strong>Total Cost:</strong> ${rental.total_cost}</p>
                        </div>

                        {rental.status === 'pending' && (
                          <div className="action-buttons">
                            <button 
                              className="btn-approve"
                              onClick={() => updateRentalStatus(rental.id, 'approved')}
                            >
                              ✅ Approve
                            </button>
                            <button 
                              className="btn-reject"
                              onClick={() => updateRentalStatus(rental.id, 'rejected')}
                            >
                              ❌ Reject
                            </button>
                          </div>
                        )}

                        {rental.status === 'approved' && (
                          <p className="active-rental-message">🟢 Active Rental</p>
                        )}

                        {rental.status === 'rejected' && (
                          <p className="rejected-message">❌ Rejected</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-message">No active rentals. Your equipment will appear here when rented.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Equipment Tab */}
        {activeTab === 'equipment' && (
          <div className="tab-content">
            <div className="equipment-header">
              <h2>My Equipment</h2>
              <button 
                className="add-btn"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                {showAddForm ? '✕ Cancel' : '+ Add Equipment'}
              </button>
            </div>

            {showAddForm && (
              <form className="add-equipment-form" onSubmit={handleAddEquipment}>
                <div className="form-group">
                  <label>Equipment Name:</label>
                  <input
                    type="text"
                    value={newEquipment.name}
                    onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    value={newEquipment.description}
                    onChange={(e) => setNewEquipment({...newEquipment, description: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Category:</label>
                  <select
                    value={newEquipment.category}
                    onChange={(e) => setNewEquipment({...newEquipment, category: e.target.value})}
                  >
                    <option>Tractors</option>
                    <option>Plows</option>
                    <option>Harvesters</option>
                    <option>Balers</option>
                    <option>Sprayers</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Daily Rate ($):</label>
                  <input
                    type="number"
                    value={newEquipment.daily_rate}
                    onChange={(e) => setNewEquipment({...newEquipment, daily_rate: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Upload Photo:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  )}
                </div>
                <button type="submit" className="submit-btn">Add Equipment</button>
              </form>
            )}

            {editingEquipmentId && (
              <div className="modal-overlay">
                <div className="modal">
                  <div className="modal-header">
                    <h3>Edit Equipment</h3>
                    <button className="close-btn" onClick={() => setEditingEquipmentId(null)}>✕</button>
                  </div>
                  <form className="modal-form">
                    <div className="form-group">
                      <label>Equipment Name:</label>
                      <input
                        type="text"
                        value={editingEquipment.name}
                        onChange={(e) => setEditingEquipment({...editingEquipment, name: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Description:</label>
                      <textarea
                        value={editingEquipment.description}
                        onChange={(e) => setEditingEquipment({...editingEquipment, description: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Category:</label>
                      <select
                        value={editingEquipment.category}
                        onChange={(e) => setEditingEquipment({...editingEquipment, category: e.target.value})}
                      >
                        <option>Tractors</option>
                        <option>Plows</option>
                        <option>Harvesters</option>
                        <option>Balers</option>
                        <option>Sprayers</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Daily Rate ($):</label>
                      <input
                        type="number"
                        value={editingEquipment.daily_rate}
                        onChange={(e) => setEditingEquipment({...editingEquipment, daily_rate: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={editingEquipment.availability === 1}
                          onChange={(e) => setEditingEquipment({...editingEquipment, availability: e.target.checked ? 1 : 0})}
                        />
                        Available for Rent
                      </label>
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="submit-btn" onClick={handleUpdateEquipment}>
                        Save Changes
                      </button>
                      <button type="button" className="cancel-btn" onClick={() => setEditingEquipmentId(null)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {userEquipment.length > 0 ? (
              <div className="equipment-list">
                {userEquipment.map(eq => (
                  <div key={eq.id} className="equipment-item">
                    {eq.image_url && (
                      <div className="equipment-item-image">
                        <img src={`http://localhost:5000${eq.image_url}`} alt={eq.name} />
                      </div>
                    )}
                    <h3>{eq.name}</h3>
                    <p className="description">{eq.description}</p>
                    <p><strong>Category:</strong> {eq.category}</p>
                    <p><strong>Daily Rate:</strong> ${eq.daily_rate}</p>
                    <p><strong>Status:</strong> 
                      <span className={eq.availability === 1 ? 'status-available' : 'status-unavailable'}>
                        {eq.availability === 1 ? 'Available' : 'Unavailable'}
                      </span>
                    </p>
                    <div className="equipment-actions">
                      <button className="edit-btn" onClick={() => handleEditEquipment(eq)}>
                        ✏️ Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDeleteEquipment(eq.id)}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No equipment yet. Add some!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
