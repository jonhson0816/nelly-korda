import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileMenu]);

  // Fetch notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      // ✅ Double check authentication
      if (!isAuthenticated) {
        setUnreadNotifications(0);
        return;
      }
      
      try {
        const token = localStorage.getItem('token');
        
        // ✅ If no token exists, skip the request
        if (!token) {
          console.warn('⚠️ No token found, user may not be fully authenticated');
          setUnreadNotifications(0);
          return;
        }
        
        const response = await axios.get(
          `${API_URL}/notifications/unread-count`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setUnreadNotifications(response.data.unreadCount);
        }
      } catch (error) {
        // ✅ Handle different error scenarios
        if (error.response?.status === 401) {
          console.warn('🔐 Authentication failed - token may be expired');
          setUnreadNotifications(0);
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Optionally redirect to login
          // window.location.href = '/login';
        } else if (error.response?.status === 404) {
          console.warn('⚠️ Notification endpoint not found');
        } else {
          console.error('Error fetching notification count:', error.response?.data?.message || error.message);
        }
      }
    };

    // ✅ Only run if authenticated AND user exists
    if (isAuthenticated && user) {
      fetchUnreadCount();
      
      // Poll every 30 seconds for new notifications
      const interval = setInterval(fetchUnreadCount, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    setShowMobileMenu(false);
    navigate('/');
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  return (
    <nav className={`nav-000-navbar ${scrolled ? 'nav-000-navbar-scrolled' : ''}`}>
      <div className="nav-000-navbar-container">
        {/* Logo */}
        <Link to="/" className="nav-000-navbar-logo" onClick={closeMobileMenu}>
          <img src="/Images/Nelly.jpg" alt="Nelly Korda Logo" className="nav-000-logo-icon" />
          <span className="nav-000-logo-text">Nelly Korda</span>
        </Link>

        {/* Main Navigation - Desktop */}
        <ul className="nav-000-navbar-nav">
          <li className="nav-000-nav-item">
            <NavLink to="/" className="nav-000-nav-link">
              <svg className="nav-000-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="9 22 9 12 15 12 15 22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="nav-000-nav-text">Home</span>
            </NavLink>
          </li>

          {isAuthenticated && (
            <>
              <li className="nav-000-nav-item">
                <NavLink to="/feed" className="nav-000-nav-link">
                  <svg className="nav-000-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="14" y="3" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="14" y="14" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="3" y="14" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="nav-000-nav-text">Feed</span>
                </NavLink>
              </li>

              <li className="nav-000-nav-item">
                <NavLink to="/chat" className="nav-000-nav-link">
                  <svg className="nav-000-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="nav-000-nav-text">Messages</span>
                </NavLink>
              </li>

              <li className="nav-000-nav-item">
                <NavLink to="/notifications" className="nav-000-nav-link">
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <svg className="nav-000-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {unreadNotifications > 0 && (
                      <span className="nav-000-notification-badge">{unreadNotifications > 99 ? '99+' : unreadNotifications}</span>
                    )}
                  </div>
                  <span className="nav-000-nav-text">Notifications</span>
                </NavLink>
              </li>
            </>
          )}

          <li className="nav-000-nav-item">
            <NavLink to="/achievements" className="nav-000-nav-link">
              <svg className="nav-000-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="8" r="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="nav-000-nav-text">Achievements</span>
            </NavLink>
          </li>

          <li className="nav-000-nav-item">
            <NavLink to="/tournaments" className="nav-000-nav-link">
              <svg className="nav-000-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 22h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="nav-000-nav-text">Tournaments</span>
            </NavLink>
          </li>

          <li className="nav-000-nav-item">
            <NavLink to="/trending" className="nav-000-nav-link">
              <svg className="nav-000-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="17 6 23 6 23 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="nav-000-nav-text">Trending</span>
            </NavLink>
          </li>
        </ul>

        {/* Mobile Icon Navigation - Only visible on mobile/tablet */}
        {isAuthenticated && (
          <div className="nav-000-mobile-icons">
            <NavLink to="/chat" className="nav-000-mobile-icon-link">
              <svg className="nav-000-mobile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </NavLink>

            <NavLink to="/notifications" className="nav-000-mobile-icon-link">
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <svg className="nav-000-mobile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {unreadNotifications > 0 && (
                  <span className="nav-000-mobile-notification-badge">{unreadNotifications > 99 ? '99+' : unreadNotifications}</span>
                )}
              </div>
            </NavLink>

            <NavLink to="/achievements" className="nav-000-mobile-icon-link">
              <svg className="nav-000-mobile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="8" r="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </NavLink>

            <NavLink to="/tournaments" className="nav-000-mobile-icon-link">
              <svg className="nav-000-mobile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 22h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </NavLink>
          </div>
        )}

        {/* Right Side - Auth Actions */}
        <div className="nav-000-navbar-actions">
          {isAuthenticated ? (
            <div className="nav-000-user-menu-wrapper" ref={userMenuRef}>
              <button
                className="nav-000-user-menu-trigger"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <img
                  src={user?.avatar?.url || '/assets/default-avatar.png'}
                  alt={user?.firstName}
                  className="nav-000-user-avatar"
                />
                <div className="nav-000-user-info">
                  <span className="nav-000-user-name">Me</span>
                  <svg
                    className={`nav-000-dropdown-arrow ${showUserMenu ? 'nav-000-rotate' : ''}`}
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M8 11L3 6h10l-5 5z"/>
                  </svg>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="nav-000-user-dropdown">
                  <div className="nav-000-dropdown-header">
                    <img
                      src={user?.avatar?.url || '/assets/default-avatar.png'}
                      alt={user?.firstName}
                      className="nav-000-dropdown-avatar"
                    />
                    <div className="nav-000-dropdown-user-info">
                      <h4 className="nav-000-dropdown-name">{user?.firstName} {user?.lastName}</h4>
                      <p className="nav-000-dropdown-email">{user?.email}</p>
                    </div>
                  </div>

                  <div className="nav-000-dropdown-divider"></div>

                  <Link
                    to="/profile"
                    className="nav-000-dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg className="nav-000-dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    View Profile
                  </Link>

                  <Link
                    to="/settings"
                    className="nav-000-dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg className="nav-000-dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 1v6m0 6v6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 3.34L14.5 8.5m-5 7l-2.5 5.16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Settings & Privacy
                  </Link>

                  {/* ⭐ ADMIN SECTION - Only for Admin Users */}
                  {user?.isAdmin && (
                    <>
                      <div className="nav-000-dropdown-divider"></div>
                      
                      <div className="nav-000-dropdown-section-header">
                        <span>Admin Tools</span>
                      </div>

                      <Link
                        to="/admin"
                        className="nav-000-dropdown-item nav-000-admin-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="nav-000-dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Admin Dashboard
                      </Link>

                      <Link
                        to="/admin/tournaments"
                        className="nav-000-dropdown-item nav-000-admin-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="nav-000-dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M4 22h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Manage Tournaments
                      </Link>
                    </>
                  )}

                  <div className="nav-000-dropdown-divider"></div>

                  <button className="nav-000-dropdown-item nav-000-logout-item" onClick={handleLogout}>
                    <svg className="nav-000-dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="16 17 21 12 16 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-000-auth-buttons">
              <Link to="/login" className="nav-000-btn-login">
                Sign In
              </Link>
              <Link to="/register" className="nav-000-btn-register">
                Join Now
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className={`nav-000-mobile-menu-toggle ${showMobileMenu ? 'nav-000-active' : ''}`}
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="nav-000-mobile-menu-overlay" onClick={closeMobileMenu}>
          <div className="nav-000-mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="nav-000-mobile-menu-header">
              <h3>Menu</h3>
              <button className="nav-000-mobile-menu-close" onClick={closeMobileMenu}>
                ✕
              </button>
            </div>

            <ul className="nav-000-mobile-menu-list">
              <li>
                <NavLink to="/" onClick={closeMobileMenu}>
                  🏠 Home
                </NavLink>
              </li>
              {isAuthenticated && (
                <>
                  <li>
                    <NavLink to="/feed" onClick={closeMobileMenu}>
                      📰 Feed
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/profile" onClick={closeMobileMenu}>
                      👤 Profile
                    </NavLink>
                  </li>
                </>
              )}
              <li>
                <NavLink to="/gallery" onClick={closeMobileMenu}>
                  📸 Gallery
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" onClick={closeMobileMenu}>
                  ℹ️ About
                </NavLink>
              </li>
              <li>
                <NavLink to="/trending" onClick={closeMobileMenu}>
                  🔥 Trending
                </NavLink>
              </li>

              {/* ⭐ Admin Section for Mobile */}
              {user?.isAdmin && (
                <>
                  <li className="nav-000-mobile-menu-divider">
                    <span>Admin Tools</span>
                  </li>
                  <li>
                    <NavLink to="/admin" onClick={closeMobileMenu} className="nav-000-mobile-admin-link">
                      ⚙️ Admin Dashboard
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/tournaments" onClick={closeMobileMenu} className="nav-000-mobile-admin-link">
                      🏆 Manage Tournaments
                    </NavLink>
                  </li>
                </>
              )}
            </ul>

            {isAuthenticated ? (
              <div className="nav-000-mobile-menu-footer">
                <button className="nav-000-mobile-logout-btn" onClick={handleLogout}>
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="nav-000-mobile-menu-footer">
                <Link to="/login" className="nav-000-mobile-auth-btn" onClick={closeMobileMenu}>
                  Sign In
                </Link>
                <Link to="/register" className="nav-000-mobile-auth-btn nav-000-primary" onClick={closeMobileMenu}>
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;