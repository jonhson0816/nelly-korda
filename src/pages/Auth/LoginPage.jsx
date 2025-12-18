import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Get redirect path from location state or default to feed
  const from = location.state?.from?.pathname || '/feed';

  // Check for registration success message
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [location.state]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, from]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
    // Clear API error when user starts typing
    if (apiError) {
      setApiError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        // Store remember me preference
        if (formData.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        // Navigation will be handled by useEffect
      } else {
        setApiError(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          {/* Left Side - Branding */}
          <div className="auth-brand-section">
            <div className="brand-content">
              <div className="brand-logo">
                <span className="logo-icon-large">🎾</span>
                <h1 className="brand-title">Nelly Korda</h1>
              </div>
              <p className="brand-tagline">
                Connect with fans, share your journey, and celebrate victories together.
              </p>
              <div className="brand-features">
                <div className="feature-item">
                  <span className="feature-icon">✨</span>
                  <span>Exclusive Content</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🏆</span>
                  <span>Tournament Updates</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">💬</span>
                  <span>Direct Messaging</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📸</span>
                  <span>Behind the Scenes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="auth-form-section">
            <div className="auth-form-container">
              <div className="form-header">
                <h2 className="form-title">Welcome Back</h2>
                <p className="form-subtitle">Login to your account</p>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="alert alert-success">
                  <span className="alert-icon">✅</span>
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Error Message */}
              {apiError && (
                <div className="alert alert-error">
                  <span className="alert-icon">⚠️</span>
                  <span>{apiError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form" noValidate>
                {/* Email Field */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">📧</span>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`form-input ${errors.email ? 'input-error' : ''}`}
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                </div>

                {/* Password Field */}
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      className={`form-input ${errors.password ? 'input-error' : ''}`}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="error-message">{errors.password}</span>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    <span className="checkbox-text">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="forgot-link">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="btn-spinner"></span>
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>

                {/* Divider */}
                <div className="form-divider">
                  <span>OR</span>
                </div>

                {/* Social Login Buttons */}
                <div className="social-login">
                  <button
                    type="button"
                    className="btn btn-social btn-google"
                    disabled={isSubmitting}
                  >
                    <span className="social-icon">🔍</span>
                    Continue with Google
                  </button>
                  <button
                    type="button"
                    className="btn btn-social btn-facebook"
                    disabled={isSubmitting}
                  >
                    <span className="social-icon">📘</span>
                    Continue with Facebook
                  </button>
                </div>

                {/* Register Link */}
                <div className="form-footer">
                  <p className="footer-text">
                    Don't have an account?{' '}
                    <Link to="/register" className="footer-link">
                      Register here
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;