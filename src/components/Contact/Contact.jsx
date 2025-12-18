import React, { useState, useEffect } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const API_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  // Fetch current user on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        console.error('❌ No token found - user not logged in');
        setErrorMessage('You must be logged in to send a message.');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success && data.user) {
          setCurrentUser(data.user);
          // Pre-fill form with user data
          setFormData(prev => ({
            ...prev,
            name: `${data.user.firstName} ${data.user.lastName}`,
            email: data.user.email
          }));
        } else {
          setErrorMessage('Please login to send a message.');
        }
      } catch (error) {
        console.error('❌ Error fetching user:', error);
        setErrorMessage('Please login to send a message.');
      }
    };
    
    fetchCurrentUser();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      setErrorMessage('');

      try {
        // Check if user is logged in
        if (!token) {
          setErrorMessage('You must be logged in to send a message. Please login first.');
          setLoading(false);
          return;
        }

        // Send contact form data to backend WITH AUTHENTICATION
        const response = await fetch(`${API_URL}/contact/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // ✅ Send auth token
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            subject: formData.subject.trim(),
            message: formData.message.trim()
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setSubmitted(true);
          
          // Reset form after 5 seconds
          setTimeout(() => {
            setFormData({
              name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '',
              email: currentUser ? currentUser.email : '',
              subject: '',
              message: ''
            });
            setSubmitted(false);
          }, 5000);
        } else {
          setErrorMessage(data.message || 'Failed to send message. Please try again.');
        }
      } catch (error) {
        console.error('Error submitting contact form:', error);
        setErrorMessage('Network error. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="cont-0110-container">
      <div className="cont-0110-header">
        <h1 className="cont-0110-title">Contact Us</h1>
        <p className="cont-0110-subtitle">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
      </div>

      <div className="cont-0110-content">
        <div className="cont-0110-info-section">
          <div className="cont-0110-info-card">
            <div className="cont-0110-icon-wrapper">
              <svg className="cont-0110-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="cont-0110-info-title">Email</h3>
            <p className="cont-0110-info-text">support@company.com</p>
          </div>

          <div className="cont-0110-info-card">
            <div className="cont-0110-icon-wrapper">
              <svg className="cont-0110-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="cont-0110-info-title">Phone</h3>
            <p className="cont-0110-info-text">+1 (555) 123-4567</p>
          </div>

          <div className="cont-0110-info-card">
            <div className="cont-0110-icon-wrapper">
              <svg className="cont-0110-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="cont-0110-info-title">Office</h3>
            <p className="cont-0110-info-text">123 Business St, Suite 100<br />San Francisco, CA 94105</p>
          </div>
        </div>

        <div className="cont-0110-form-section">
          {submitted && (
            <div className="cont-0110-success-message">
              <svg className="cont-0110-success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="cont-0110-success-title">Message sent successfully!</p>
                <p className="cont-0110-success-text">We've received your message and will respond shortly through our messenger.</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="cont-0110-error-message">
              <svg className="cont-0110-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="0.5" fill="currentColor" strokeWidth="2"/>
              </svg>
              <p>{errorMessage}</p>
            </div>
          )}

          <div className="cont-0110-form">
            <div className="cont-0110-form-group">
              <label className="cont-0110-label" htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className={`cont-0110-input ${errors.name ? 'cont-0110-input-error' : ''}`}
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                disabled={loading}
                readOnly={!!currentUser} // Make readonly if user is logged in
              />
              {errors.name && <span className="cont-0110-error">{errors.name}</span>}
            </div>

            <div className="cont-0110-form-group">
              <label className="cont-0110-label" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className={`cont-0110-input ${errors.email ? 'cont-0110-input-error' : ''}`}
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                disabled={loading}
                readOnly={!!currentUser} // Make readonly if user is logged in
              />
              {errors.email && <span className="cont-0110-error">{errors.email}</span>}
            </div>

            <div className="cont-0110-form-group">
              <label className="cont-0110-label" htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                className={`cont-0110-input ${errors.subject ? 'cont-0110-input-error' : ''}`}
                value={formData.subject}
                onChange={handleChange}
                placeholder="What is this about?"
                disabled={loading}
              />
              {errors.subject && <span className="cont-0110-error">{errors.subject}</span>}
            </div>

            <div className="cont-0110-form-group">
              <label className="cont-0110-label" htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                className={`cont-0110-textarea ${errors.message ? 'cont-0110-input-error' : ''}`}
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us more about your inquiry..."
                disabled={loading}
              ></textarea>
              {errors.message && <span className="cont-0110-error">{errors.message}</span>}
            </div>

            <button 
              type="button" 
              onClick={handleSubmit} 
              className="cont-0110-submit-btn"
              disabled={loading || !currentUser}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;