import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Footer Top Section */}
        <div className="footer-top">
          {/* About Section */}
          <div className="footer-column">
            <h3 className="footer-title">
              <span className="footer-icon">🎾</span>
              Nelly Korda
            </h3>
            <p className="footer-description">
              Follow the journey of one of golf's brightest stars. Join our community for
              exclusive content, updates, and behind-the-scenes access.
            </p>
            <div className="footer-social">
              <a
                href="https://instagram.com/nellykorda"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Instagram"
              >
                <i className="social-icon">📷</i>
              </a>
              <a
                href="https://twitter.com/nellykorda"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Twitter"
              >
                <i className="social-icon">🐦</i>
              </a>
              <a
                href="https://facebook.com/nellykorda"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Facebook"
              >
                <i className="social-icon">📘</i>
              </a>
              <a
                href="https://youtube.com/@nellykorda"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="YouTube"
              >
                <i className="social-icon">📺</i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h4 className="footer-column-title">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <Link to="/" className="footer-link">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="footer-link">
                  About Nelly
                </Link>
              </li>
              <li>
                <Link to="/tournaments" className="footer-link">
                  Tournaments
                </Link>
              </li>
              <li>
                <Link to="/achievements" className="footer-link">
                  Achievements
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="footer-link">
                  Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="footer-column">
            <h4 className="footer-column-title">Community</h4>
            <ul className="footer-links">
              <li>
                <Link to="/feed" className="footer-link">
                  Feed
                </Link>
              </li>
              <li>
                <Link to="/chat" className="footer-link">
                  Chat
                </Link>
              </li>
              <li>
                <Link to="/story/:storyId" className="footer-link">
                  Stories
                </Link>
              </li>
              <li>
                <Link to="/register" className="footer-link">
                  Join Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-column">
            <h4 className="footer-column-title">Support</h4>
            <ul className="footer-links">
              <li>
                <Link to="/contact" className="footer-link">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="footer-link">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="footer-link">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="footer-link">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Section */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} Nelly Korda. All rights reserved. Built with ❤️ for golf fans
            worldwide.
          </p>
          <div className="footer-badges">
            <span className="footer-badge">🏆 LPGA Champion</span>
            <span className="footer-badge">🌟 World No. 1</span>
            <span className="footer-badge">🥇 Olympic Gold</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;