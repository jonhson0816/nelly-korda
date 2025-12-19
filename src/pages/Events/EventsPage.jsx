import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';
import axios from 'axios';
import './EventsPage.css';

const EventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCurrentUser();
    fetchEvents();
  }, [filter, category]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      let url = `${API_URL}/events?period=${filter}`;
      if (category !== 'all') url += `&category=${category}`;
      if (searchQuery) url += `&search=${searchQuery}`;

      const response = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setEvents(response.data.events);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getCategoryIcon = (cat) => {
    const icons = {
      tournament: '🏆',
      workshop: '🎓',
      meetup: '🤝',
      charity: '❤️',
      training: '💪',
      celebration: '🎉',
      other: '📅'
    };
    return icons[cat] || '📅';
  };

  const getTypeIcon = (type) => {
    const icons = {
      in_person: '📍',
      online: '💻',
      hybrid: '🔄'
    };
    return icons[type] || '📍';
  };

  return (
    <div className="events-page">
      <div className="events-container">
        {/* HEADER */}
        <div className="events-header">
          <div className="header-left">
            <h1>Events</h1>
            <p>Discover and join exciting events</p>
          </div>
          <button className="btn-create-event" onClick={() => setShowCreateModal(true)}>
            <span className="icon">+</span>
            Create Event
          </button>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="events-filters">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn-search">
              🔍 Search
            </button>
          </form>

          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`filter-tab ${filter === 'today' ? 'active' : ''}`}
              onClick={() => setFilter('today')}
            >
              Today
            </button>
            <button
              className={`filter-tab ${filter === 'this_week' ? 'active' : ''}`}
              onClick={() => setFilter('this_week')}
            >
              This Week
            </button>
            <button
              className={`filter-tab ${filter === 'past' ? 'active' : ''}`}
              onClick={() => setFilter('past')}
            >
              Past
            </button>
          </div>

          <div className="category-filters">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="category-select"
            >
              <option value="all">All Categories</option>
              <option value="tournament">Tournaments</option>
              <option value="workshop">Workshops</option>
              <option value="meetup">Meetups</option>
              <option value="charity">Charity</option>
              <option value="training">Training</option>
              <option value="celebration">Celebrations</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="quick-links">
          <button
            className="quick-link-btn"
            onClick={() => navigate('/events/my/attending')}
          >
            <span className="icon">✓</span>
            My Events
          </button>
          <button
            className="quick-link-btn"
            onClick={() => navigate('/events/my/organizing')}
          >
            <span className="icon">👤</span>
            Organizing
          </button>
          <button
            className="quick-link-btn"
            onClick={() => navigate('/events/calendar')}
          >
            <span className="icon">📅</span>
            Calendar
          </button>
        </div>

        {/* EVENTS GRID */}
        {loading ? (
          <div className="events-loading">
            <div className="spinner"></div>
            <p>Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="events-empty">
            <span className="empty-icon">📅</span>
            <h3>No events found</h3>
            <p>Try adjusting your filters or create a new event</p>
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              Create Event
            </button>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <div
                key={event._id}
                className="event-card"
                onClick={() => navigate(`/events/${event._id}`)}
              >
                {/* Event Cover */}
                <div className="event-cover">
                  {event.coverPhoto?.url ? (
                    <img src={event.coverPhoto.url} alt={event.title} />
                  ) : (
                    <div className="event-placeholder">
                      <span className="event-icon">{getCategoryIcon(event.category)}</span>
                    </div>
                  )}
                  
                  <div className="event-badges">
                    <span className="event-category-badge">
                      {getCategoryIcon(event.category)} {event.category.replace('_', ' ')}
                    </span>
                    {event.isFeatured && (
                      <span className="event-featured-badge">⭐ Featured</span>
                    )}
                  </div>

                  <div className="event-type-badge">
                    {getTypeIcon(event.type)} {event.type.replace('_', ' ')}
                  </div>
                </div>

                {/* Event Info */}
                <div className="event-info">
                  <div className="event-date">
                    <span className="date-day">
                      {new Date(event.startDate).getDate()}
                    </span>
                    <span className="date-month">
                      {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                  </div>

                  <div className="event-details">
                    <h3 className="event-title">{event.title}</h3>
                    
                    <div className="event-meta">
                      <span className="event-time">
                        🕒 {formatDate(event.startDate)}
                      </span>
                      
                      {event.location?.venue && (
                        <span className="event-location">
                          📍 {event.location.venue}, {event.location.city}
                        </span>
                      )}
                      
                      {event.onlineLink && !event.location?.venue && (
                        <span className="event-location">
                          💻 Online Event
                        </span>
                      )}
                    </div>

                    <div className="event-organizer">
                      <img
                        src={event.organizer?.avatar?.url || `https://ui-avatars.com/api/?name=${event.organizer?.firstName}`}
                        alt={event.organizer?.firstName}
                        className="organizer-avatar"
                      />
                      <span>
                        by {event.organizer?.firstName} {event.organizer?.lastName}
                      </span>
                    </div>

                    <div className="event-stats">
                      <span className="stat-item">
                        <span className="icon">✓</span>
                        {event.attendees?.filter(a => a.status === 'going').length || 0} going
                      </span>
                      <span className="stat-item">
                        <span className="icon">⭐</span>
                        {event.attendees?.filter(a => a.status === 'interested').length || 0} interested
                      </span>
                    </div>

                    {event.ticketInfo && !event.ticketInfo.isFree && (
                      <div className="event-price">
                        💵 ${event.ticketInfo.price} {event.ticketInfo.currency}
                      </div>
                    )}
                    
                    {event.ticketInfo?.isFree && (
                      <div className="event-free">
                        🎟️ Free Event
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE EVENT MODAL */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchEvents();
          }}
        />
      )}
    </div>
  );
};

// CREATE EVENT MODAL COMPONENT
const CreateEventModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    type: 'in_person',
    startDate: '',
    endDate: '',
    venue: '',
    address: '',
    city: '',
    country: '',
    onlineLink: '',
    isFree: true,
    price: 0,
    capacity: '',
    privacy: 'public'
  });
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const form = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'location') {
          form.append(key, JSON.stringify({
            venue: formData.venue,
            address: formData.address,
            city: formData.city,
            country: formData.country
          }));
        } else if (key === 'ticketInfo') {
          form.append(key, JSON.stringify({
            isFree: formData.isFree,
            price: formData.price
          }));
        } else {
          form.append(key, formData[key]);
        }
      });

      if (coverPhoto) {
        form.append('coverPhoto', coverPhoto);
      }

      await axios.post(`${API_URL}/events`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Event created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating event:', error);
      alert(error.response?.data?.message || 'Failed to create event');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Event</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Event Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter event title"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your event..."
              rows="4"
              className="form-textarea"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="form-select"
              >
                <option value="tournament">Tournament</option>
                <option value="workshop">Workshop</option>
                <option value="meetup">Meetup</option>
                <option value="charity">Charity</option>
                <option value="training">Training</option>
                <option value="celebration">Celebration</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="form-select"
              >
                <option value="in_person">In Person</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>End Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="form-input"
              />
            </div>
          </div>

          {(formData.type === 'in_person' || formData.type === 'hybrid') && (
            <>
              <div className="form-group">
                <label>Venue</label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({...formData, venue: e.target.value})}
                  placeholder="Venue name"
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    placeholder="City"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    placeholder="Country"
                    className="form-input"
                  />
                </div>
              </div>
            </>
          )}

          {(formData.type === 'online' || formData.type === 'hybrid') && (
            <div className="form-group">
              <label>Online Link</label>
              <input
                type="url"
                value={formData.onlineLink}
                onChange={(e) => setFormData({...formData, onlineLink: e.target.value})}
                placeholder="https://zoom.us/..."
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label>Cover Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverPhoto(e.target.files[0])}
              className="form-input"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventsPage;