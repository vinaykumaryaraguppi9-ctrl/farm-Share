import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Mail, Phone, MapPin, Calendar, DollarSign, Star, CreditCard } from 'lucide-react';
import './EquipmentDetailPage.css';

const EquipmentDetailPage = ({ user }) => {
  const { id } = useParams();
  const [equipment, setEquipment] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [renting, setRenting] = useState(false);
  const [activeRental, setActiveRental] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [userActiveRental, setUserActiveRental] = useState(null);
  const [showExtendForm, setShowExtendForm] = useState(false);
  const [extendEndDate, setExtendEndDate] = useState('');
  const [reviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Calendar and time selection states
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const fetchEquipmentDetail = useCallback(async () => {
    try {
      const [equipRes, rentalStatusRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/equipment/${id}`),
        axios.get(`http://localhost:5000/api/rentals/equipment/${id}/status`)
      ]);
      
      setEquipment(equipRes.data);
      setActiveRental(rentalStatusRes.data.rental);
    } catch (error) {
      console.error('Error fetching equipment detail:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchEquipmentDetail();
  }, [fetchEquipmentDetail]);


  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    return Math.ceil((e - s) / (1000 * 60 * 60 * 24));
  };

  const totalCost = calculateDays(startDate, endDate) * (equipment?.daily_rate || 0);
  
  const calculateExtensionCost = () => {
    if (!userActiveRental || !extendEndDate) return 0;
    const currentEnd = new Date(userActiveRental.end_date);
    const newEnd = new Date(extendEndDate);
    if (newEnd <= currentEnd) return 0;
    const daysAdded = Math.ceil((newEnd - currentEnd) / (1000 * 60 * 60 * 24));
    return daysAdded * equipment.daily_rate;
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (date) => {
    if (activeRental) {
      const rentalStart = new Date(activeRental.start_date);
      const rentalEnd = new Date(activeRental.end_date);
      rentalStart.setHours(0, 0, 0, 0);
      rentalEnd.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      return date >= rentalStart && date <= rentalEnd;
    }
    return false;
  };

  const isDateBetween = (date, start, end) => {
    if (!start || !end) return false;
    const dateNorm = new Date(date);
    const startNorm = new Date(start);
    const endNorm = new Date(end);
    dateNorm.setHours(0, 0, 0, 0);
    startNorm.setHours(0, 0, 0, 0);
    endNorm.setHours(0, 0, 0, 0);
    return dateNorm > startNorm && dateNorm < endNorm;
  };

  const isDateSelected = (date, type) => {
    const compareDateStr = date.toISOString().split('T')[0];
    return type === 'start' ? compareDateStr === startDate : compareDateStr === endDate;
  };

  const handleCalendarDayClick = (day) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = selectedDate.toISOString().split('T')[0];

    if (isDateDisabled(selectedDate)) return;

    if (!startDate || (startDate && endDate)) {
      setStartDate(dateStr);
      setEndDate('');
    } else if (!endDate) {
      const startDateObj = new Date(startDate);
      if (selectedDate > startDateObj) {
        setEndDate(dateStr);
      } else {
        setStartDate(dateStr);
        setEndDate('');
      }
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isDisabled = isDateDisabled(date);
      const isSelected = isDateSelected(date, 'start') || isDateSelected(date, 'end');
      const isRange = isDateBetween(date, startDate, endDate);
      const isToday = date.getTime() === today.getTime();
      const isAvailable = !isDisabled && date >= today;

      days.push(
        <button
          key={day}
          className={`calendar-day 
            ${isDisabled ? 'disabled' : ''}
            ${isSelected ? 'selected' : ''}
            ${isRange ? 'in-range' : ''}
            ${isAvailable && !isDisabled ? 'available' : ''}
            ${isToday ? 'today' : ''}`}
          onClick={() => handleCalendarDayClick(day)}
          disabled={isDisabled}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const calculateDurationMinutes = () => {
    if (!startTime || !endTime) return 0;
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startTotalMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMin;
    return Math.max(0, endTotalMin - startTotalMin);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const handleRent = async () => {
    if (!user) {
      alert('Please login to rent equipment');
      return;
    }

    if (user.id === equipment.owner_id) {
      alert('You cannot rent your own equipment');
      return;
    }

    if (!startDate || !endDate) {
      alert('Please select dates');
      return;
    }

    if (calculateDays(startDate, endDate) <= 0) {
      alert('End date must be after start date');
      return;
    }

    setRenting(true);
    try {
      await axios.post('http://localhost:5000/api/rentals', {
        equipment_id: id,
        renter_id: user.id,
        owner_id: equipment.owner_id,
        start_date: startDate,
        end_date: endDate,
        total_cost: totalCost
      });
      alert('Rental request submitted successfully!');
      setStartDate('');
      setEndDate('');
      setRenting(false);
      // Refresh active rental status
      fetchEquipmentDetail();
    } catch (error) {
      alert('Error creating rental: ' + error.message);
      setRenting(false);
    }
  };

  const handleExtendRental = async () => {
    if (!extendEndDate) {
      alert('Please select new end date');
      return;
    }

    const newEnd = new Date(extendEndDate);
    const currentEnd = new Date(userActiveRental.end_date);

    if (newEnd <= currentEnd) {
      alert('New end date must be after current end date');
      return;
    }

    const extensionCost = calculateExtensionCost();

    try {
      await axios.post(`http://localhost:5000/api/rentals/${userActiveRental.id}/extend`, {
        new_end_date: extendEndDate,
        additional_cost: extensionCost
      });
      alert('Rental extended successfully! Additional cost: $' + extensionCost.toFixed(2));
      setShowExtendForm(false);
      setExtendEndDate('');
      fetchEquipmentDetail();
    } catch (error) {
      alert('Error extending rental: ' + error.message);
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (!equipment) return <div className="container"><p>Equipment not found</p></div>;

  const isOwner = user && user.id === equipment.owner_id;
  const isUnderUse = activeRental !== null;
  const userHasActiveRental = userActiveRental !== null;

  return (
    <div className="container">
      <div className="equipment-detail">
        <div className="detail-image">
          <img 
            src={equipment.image_url && equipment.image_url.startsWith('http') ? equipment.image_url : 
                 equipment.image_url ? `http://localhost:5000${equipment.image_url}` : 
                 'https://via.placeholder.com/600x400'} 
            alt={equipment.name} 
          />
          {isUnderUse && (
            <div className="under-use-badge">
              🔴 UNDER USE
            </div>
          )}
        </div>
        <div className="detail-info">
          <h1>{equipment.name}</h1>
          <div className="detail-meta">
            <span className="category">{equipment.category}</span>
            <span className="price">${equipment.daily_rate}/day</span>
            {isUnderUse && (
              <span className="status-badge under-use">Currently Rented</span>
            )}
            {equipment.availability === 0 && (
              <span className="status-badge unavailable">Unavailable</span>
            )}
          </div>
          
          <p className="description">{equipment.description}</p>

          {isUnderUse && activeRental && (
            <div className="current-rental-info">
              <h3>✨ Currently Rented By</h3>
              <p><strong>Renter:</strong> {activeRental.renter_name}</p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={14} /> <strong>Rental Period:</strong> {activeRental.start_date} to {activeRental.end_date}
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={14} /> <strong>Total Cost:</strong> ${activeRental.total_cost}
              </p>
            </div>
          )}
          
          <div className="owner-card">
            <h3>👤 Owner Information</h3>
            <p><strong>Name:</strong> {equipment.owner_name}</p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={14} /> <strong>Location:</strong> {equipment.location}
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={14} /> <strong>Email:</strong> {equipment.email}
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={14} /> <strong>Phone:</strong> {equipment.phone}
            </p>
          </div>

          {/* Show different booking options based on status */}
          {isOwner ? (
            // Owner viewing their own equipment
            <div className="booking-section owner-view">
              <p className="info-message">This is your equipment. You cannot rent your own items.</p>
            </div>
          ) : userHasActiveRental ? (
            // User with active rental - show extend option
            <div className="booking-section">
              <h3>You Have an Active Rental</h3>
              <div className="active-rental-details">
                <p><strong>Current Rental Period:</strong> {userActiveRental.start_date} to {userActiveRental.end_date}</p>
                <p><strong>Current Total Cost:</strong> ${userActiveRental.total_cost}</p>
              </div>

              {!showExtendForm ? (
                <button 
                  onClick={() => setShowExtendForm(true)}
                  className="extend-button"
                >
                  Extend Rental
                </button>
              ) : (
                <div className="extend-form">
                  <div className="form-group">
                    <label>New End Date:</label>
                    <input
                      type="date"
                      value={extendEndDate}
                      onChange={(e) => setExtendEndDate(e.target.value)}
                      min={userActiveRental.end_date}
                    />
                  </div>

                  {extendEndDate && calculateExtensionCost() > 0 && (
                    <div className="cost-summary">
                      <p>Current End Date: {userActiveRental.end_date}</p>
                      <p>New End Date: {extendEndDate}</p>
                      <p>Additional Days: {calculateDays(userActiveRental.end_date, extendEndDate)}</p>
                      <p>Daily Rate: ${equipment.daily_rate}</p>
                      <p className="additional-cost">Additional Cost: ${calculateExtensionCost().toFixed(2)}</p>
                      <p className="new-total">New Total Cost: ${(userActiveRental.total_cost + calculateExtensionCost()).toFixed(2)}</p>
                    </div>
                  )}

                  <div className="extend-actions">
                    <button 
                      onClick={handleExtendRental}
                      className="confirm-extend-btn"
                    >
                      Confirm Extension
                    </button>
                    <button 
                      onClick={() => {
                        setShowExtendForm(false);
                        setExtendEndDate('');
                      }}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : isUnderUse ? (
            // Equipment is rented by someone else
            <div className="booking-section unavailable-for-rent">
              <p className="info-message">This equipment is currently under rent and not available for new bookings.</p>
              <p className="info-message-sub">Available again from: {activeRental.end_date}</p>
            </div>
          ) : (
            // Equipment is available for rent
            <div className="booking-section">
              <h3>📅 Book This Equipment</h3>
              
              {/* Availability Calendar */}
              <div className="availability-calendar">
                <div className="calendar-header">
                  <button onClick={handlePrevMonth}>← Previous</button>
                  <h3>
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button onClick={handleNextMonth}>Next →</button>
                </div>

                <div className="weekdays">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="weekday-header">{day}</div>
                  ))}
                </div>

                <div className="calendar-days">
                  {renderCalendar()}
                </div>

                <div style={{ marginTop: '12px', fontSize: '12px', color: '#6c757d' }}>
                  <span style={{ display: 'inline-block', marginRight: '16px' }}>
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#d4edda', border: '1px solid #28a745', marginRight: '4px', borderRadius: '2px' }}></span>
                    Available
                  </span>
                  <span style={{ display: 'inline-block', marginRight: '16px' }}>
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#f8f9fa', border: '1px solid #dee2e6', marginRight: '4px', borderRadius: '2px', textDecoration: 'line-through', color: '#adb5bd' }}>—</span>
                    Booked
                  </span>
                  <span>
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#0066cc', color: '#fff', marginRight: '4px', borderRadius: '2px' }}></span>
                    Selected
                  </span>
                </div>
              </div>

              {/* Selected Dates Info */}
              {(startDate || endDate) && (
                <div className="selected-dates-info">
                  <h4>Selected Dates</h4>
                  <div className="dates-display">
                    <div className="date-item">
                      <label>Start Date</label>
                      <div className="value">{startDate || 'Not selected'}</div>
                    </div>
                    <div className="date-item">
                      <label>End Date</label>
                      <div className="value">{endDate || 'Not selected'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Time Selector */}
              <div className="time-selector">
                <h4>⏰ Preferred Times</h4>
                <div className="time-inputs">
                  <div className="time-input-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="time-input-group">
                    <label>End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="time-presets">
                  <button 
                    className={`time-preset-btn ${startTime === '06:00' && endTime === '18:00' ? 'active' : ''}`}
                    onClick={() => { setStartTime('06:00'); setEndTime('18:00'); }}
                  >
                    Morning to Evening
                  </button>
                  <button 
                    className={`time-preset-btn ${startTime === '09:00' && endTime === '17:00' ? 'active' : ''}`}
                    onClick={() => { setStartTime('09:00'); setEndTime('17:00'); }}
                  >
                    Business Hours
                  </button>
                  <button 
                    className={`time-preset-btn ${startTime === '00:00' && endTime === '23:59' ? 'active' : ''}`}
                    onClick={() => { setStartTime('00:00'); setEndTime('23:59'); }}
                  >
                    Full Day
                  </button>
                </div>

                {calculateDurationMinutes() > 0 && (
                  <div className="duration-info">
                    <strong>Duration:</strong> {formatDuration(calculateDurationMinutes())} per day
                  </div>
                )}
              </div>

              {calculateDays(startDate, endDate) > 0 && (
                <div className="cost-summary">
                  <p>Duration: {calculateDays(startDate, endDate)} days</p>
                  <p><DollarSign size={14} style={{ marginRight: '6px', display: 'inline' }} /> Daily Rate: ${equipment.daily_rate}</p>
                  <p className="total"><DollarSign size={14} style={{ marginRight: '6px', display: 'inline' }} /> Total Cost: ${totalCost.toFixed(2)}</p>
                </div>
              )}

              <button 
                onClick={handleRent} 
                disabled={renting}
                className="rent-button"
              >
                {renting ? 'Processing...' : 'Send Rental Request'}
              </button>
            </div>
          )}

          {equipment.availability === 0 && !isOwner && (
            <div className="unavailable">
              <p>This equipment is currently unavailable</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Section */}
      <div className="payment-section">
        <div className="section-card">
          <div className="section-header">
            <CreditCard size={24} />
            <h2>💳 Payment Options</h2>
          </div>
          <div className="coming-soon-banner">
            <p>🚀 Coming Soon</p>
            <p className="coming-soon-text">Secure payment integration is being implemented. For now, payments will be coordinated between renter and owner.</p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <div className="section-card">
          <div className="section-header">
            <Star size={24} />
            <h2>⭐ Equipment Reviews</h2>
          </div>

          {reviews && reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <strong>{review.reviewer_name}</strong>
                      <span className="review-date">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="review-rating">
                      {[...Array(review.rating)].map((_, i) => <span key={i}>⭐</span>)}
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-reviews">
              <p>📝 No reviews yet. Be the first to review this equipment!</p>
            </div>
          )}

          {user && userActiveRental && (
            <div className="leave-review">
              {!showReviewForm ? (
                <button 
                  className="leave-review-btn"
                  onClick={() => setShowReviewForm(true)}
                >
                  ✍️ Leave a Review
                </button>
              ) : (
                <div className="review-form">
                  <h3>Share Your Experience</h3>
                  <div className="rating-selector">
                    <label>Rating:</label>
                    <div className="stars-input">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${reviewRating >= star ? 'active' : ''}`}
                          onClick={() => setReviewRating(star)}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    placeholder="Share your experience with this equipment..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    maxLength="500"
                    rows="4"
                  />
                  <p className="char-count">{reviewComment.length}/500</p>
                  <div className="form-actions">
                    <button className="submit-review-btn">Submit Review</button>
                    <button 
                      className="cancel-review-btn"
                      onClick={() => {
                        setShowReviewForm(false);
                        setReviewRating(5);
                        setReviewComment('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetailPage;
