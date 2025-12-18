import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/feed', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue,
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

    // Calculate password strength
    if (name === 'password') {
      calculatePasswordStrength(newValue);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return '#fa383e';
    if (passwordStrength <= 3) return '#f59e0b';
    if (passwordStrength <= 4) return '#42b72a';
    return '#42b72a';
  };

  const validateForm = () => {
    const newErrors = {};

    // First Name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last Name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Username (optional but validate if provided)
    if (formData.username && formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username && !/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Date of Birth
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
      if (age < 13) {
        newErrors.dateOfBirth = 'You must be at least 13 years old';
      }
    }

    // Terms Agreement
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
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
      const result = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        username: formData.username.trim() || undefined,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
      });

      if (result.success) {
        // Redirect to feed after successful registration
        navigate('/feed', { replace: true });
      } else {
        setApiError(result.message || 'Registration failed. Please try again.');
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
        <div className="auth-card auth-card-large">
          {/* Left Side - Branding */}
          <div className="auth-brand-section">
            <div className="brand-content">
              <div className="brand-logo">
                <span className="logo-icon-large">🎾</span>
                <h1 className="brand-title">Nelly Korda</h1>
              </div>
              <p className="brand-tagline">
                Join the community and be part of the journey to greatness.
              </p>
              <div className="brand-features">
                <div className="feature-item">
                  <span className="feature-icon">🎯</span>
                  <span>Exclusive Access</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🌟</span>
                  <span>Earn Badges</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">👥</span>
                  <span>Connect with Fans</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📊</span>
                  <span>Track Progress</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="auth-form-section">
            <div className="auth-form-container">
              <div className="form-header">
                <h2 className="form-title">Create Account</h2>
                <p className="form-subtitle">Join the Nelly Korda community</p>
              </div>

              {/* Error Message */}
              {apiError && (
                <div className="alert alert-error">
                  <span className="alert-icon">⚠️</span>
                  <span>{apiError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form" noValidate>
                {/* Name Fields */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">
                      First Name
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">👤</span>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className={`form-input ${errors.firstName ? 'input-error' : ''}`}
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={handleChange}
                        autoComplete="given-name"
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.firstName && (
                      <span className="error-message">{errors.firstName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">
                      Last Name
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">👤</span>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className={`form-input ${errors.lastName ? 'input-error' : ''}`}
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={handleChange}
                        autoComplete="family-name"
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.lastName && (
                      <span className="error-message">{errors.lastName}</span>
                    )}
                  </div>
                </div>

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

                {/* Username Field */}
                <div className="form-group">
                  <label htmlFor="username" className="form-label">
                    Username <span className="optional-text">(optional)</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">@</span>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      className={`form-input ${errors.username ? 'input-error' : ''}`}
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleChange}
                      autoComplete="username"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.username && (
                    <span className="error-message">{errors.username}</span>
                  )}
                  {!errors.username && formData.username && (
                    <span className="helper-text">This will be your unique identifier</span>
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
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
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
                  {formData.password && !errors.password && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div
                          className="strength-fill"
                          style={{
                            width: `${(passwordStrength / 5) * 100}%`,
                            backgroundColor: getPasswordStrengthColor(),
                          }}
                        ></div>
                      </div>
                      <span
                        className="strength-label"
                        style={{ color: getPasswordStrengthColor() }}
                      >
                        {getPasswordStrengthLabel()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex="-1"
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="error-message">{errors.confirmPassword}</span>
                  )}
                </div>

                {/* Date of Birth Field */}
                <div className="form-group">
                  <label htmlFor="dateOfBirth" className="form-label">
                    Date of Birth
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">📅</span>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      className={`form-input ${errors.dateOfBirth ? 'input-error' : ''}`}
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.dateOfBirth && (
                    <span className="error-message">{errors.dateOfBirth}</span>
                  )}
                </div>

                {/* Terms Agreement */}
                <div className="form-group">
                  <label className={`checkbox-label ${errors.agreeToTerms ? 'checkbox-error' : ''}`}>
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    <span className="checkbox-text">
                      I agree to the{' '}
                      <Link to="/terms" target="_blank" className="inline-link">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" target="_blank" className="inline-link">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <span className="error-message">{errors.agreeToTerms}</span>
                  )}
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
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
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
                    Sign up with Google
                  </button>
                  <button
                    type="button"
                    className="btn btn-social btn-facebook"
                    disabled={isSubmitting}
                  >
                    <span className="social-icon">📘</span>
                    Sign up with Facebook
                  </button>
                </div>

                {/* Login Link */}
                <div className="form-footer">
                  <p className="footer-text">
                    Already have an account?{' '}
                    <Link to="/login" className="footer-link">
                      Login here
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

export default RegisterPage;