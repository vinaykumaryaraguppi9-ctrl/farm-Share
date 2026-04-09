'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './EquipmentDetailPage.css';

export default function EquipmentDetailPage({ params }) {
  const router = useRouter();
  const [equipment, setEquipment] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing user:', err);
      }
    }

    fetchEquipmentDetail();
  }, [params.id]);

  const fetchEquipmentDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/equipment/${params.id}`);
      if (!response.ok) throw new Error('Equipment not found');
      const data = await response.json();
      setEquipment(data);

      // Fetch reviews
      const reviewsResponse = await fetch(`/api/reviews?equipment_id=${params.id}`);
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const calculateCost = () => {
    if (!equipment) return 0;
    return calculateDays() * equipment.dailyRate;
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!user) {
      router.push('/login');
      return;
    }

    if (!startDate || !endDate) {
      setBookingError('Please select dates');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setBookingError('End date must be after start date');
      return;
    }

    try {
      const response = await fetch('/api/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentId: equipment.id,
          renterId: user.id,
          ownerId: equipment.ownerId,
          startDate,
          endDate,
          totalCost: calculateCost(),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      alert('Rental request created! Awaiting owner approval.');
      setStartDate('');
      setEndDate('');
    } catch (err) {
      setBookingError(err.message);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      router.push('/login');
      return;
    }

    if (!reviewRating || !reviewComment.trim()) {
      alert('Please provide a rating and comment');
      return;
    }

    // Get user's active rental for this equipment
    try {
      const rentalsResponse = await fetch(`/api/rentals?user_id=${user.id}`);
      const rentalsData = await rentalsResponse.json();
      const activeRental = rentalsData?.find(
        r => r.equipmentId === equipment.id && r.renterId === user.id && r.status === 'active'
      );

      if (!activeRental) {
        alert('You must have an active rental to leave a review');
        return;
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rentalId: activeRental.id,
          reviewerId: user.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit review');

      const newReview = await response.json();
      setReviews([newReview, ...reviews]);
      setReviewRating(0);
      setReviewComment('');
      alert('Review submitted successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading equipment details...</div>;
  }

  if (error || !equipment) {
    return <div className="error">{error || 'Equipment not found'}</div>;
  }

  return (
    <div className="equipment-detail-page">
      <div className="detail-container">
        {/* Equipment Image */}
        <div className="equipment-image">
          {equipment.imageUrl ? (
            <img src={equipment.imageUrl} alt={equipment.name} />
          ) : (
            <div className="image-placeholder">📷</div>
          )}
        </div>

        {/* Equipment Info */}
        <div className="equipment-info">
          <h1>{equipment.name}</h1>
          <p className="category">{equipment.category}</p>
          <p className="description">{equipment.description}</p>

          <div className="info-grid">
            <div className="info-item">
              <label>Daily Rate</label>
              <p className="price">₹{equipment.dailyRate}</p>
            </div>
            <div className="info-item">
              <label>Owner</label>
              <p>{equipment.owner?.name}</p>
              <small>{equipment.owner?.email}</small>
            </div>
          </div>

          {/* Booking Form */}
          {user && user.id !== equipment.ownerId && (
            <form onSubmit={handleBooking} className="booking-form">
              <h2>Rent This Equipment</h2>
              {bookingError && <div className="error-message">{bookingError}</div>}
              
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {calculateDays() > 0 && (
                <div className="cost-summary">
                  <p>{calculateDays()} days × ₹{equipment.dailyRate} = <strong>₹{calculateCost().toFixed(2)}</strong></p>
                </div>
              )}

              <button type="submit" className="book-btn">Book Now</button>
            </form>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <section className="reviews-section">
        <h2>Equipment Reviews</h2>

        {reviews.length > 0 && (
          <div className="reviews-list">
            {reviews.map(review => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <strong>{review.reviewer?.name}</strong>
                  <span className="review-rating">
                    {'⭐'.repeat(review.rating)}
                  </span>
                </div>
                <p className="review-comment">{review.comment}</p>
                <small>{new Date(review.createdAt).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        )}

        {user && user.id !== equipment.ownerId && (
          <form onSubmit={handleReviewSubmit} className="review-form">
            <h3>Leave a Review</h3>
            <div className="form-group">
              <label>Rating</label>
              <div className="stars-input">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${star <= reviewRating ? 'active' : ''}`}
                    onClick={() => setReviewRating(star)}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Comment</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience..."
                maxLength="500"
                rows="4"
              />
              <small>{reviewComment.length}/500</small>
            </div>

            <button type="submit" className="submit-review-btn">Submit Review</button>
          </form>
        )}
      </section>
    </div>
  );
}
