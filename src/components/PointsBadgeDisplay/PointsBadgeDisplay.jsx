import React, { useState, useEffect } from 'react';
import { getMyStats, checkBadges } from '../../services/pointsService';
import './PointsBadgeDisplay.css';

const PointsBadgeDisplay = ({ compact = false, showBadges = true }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newBadges, setNewBadges] = useState([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  useEffect(() => {
    fetchStats();
    checkForNewBadges();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getMyStats();
      if (response.success) {
        setStats(response.stats);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const checkForNewBadges = async () => {
    try {
      const response = await checkBadges();
      if (response.success && response.newBadges.length > 0) {
        setNewBadges(response.newBadges);
        setShowBadgeModal(true);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setShowBadgeModal(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error checking badges:', error);
    }
  };

  if (loading) {
    return (
      <div className="points-badge-loading">
        <div className="points-badge-skeleton"></div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Compact version (for sidebars)
  if (compact) {
    return (
      <div className="points-badge-compact">
        <div className="points-badge-header-compact">
          <span className="points-badge-icon">⭐</span>
          <div className="points-badge-info-compact">
            <span className="points-badge-points-compact">{stats.totalPoints}</span>
            <span className="points-badge-label-compact">Points</span>
          </div>
        </div>
        
        <div className="points-badge-level-compact">
          <div className="points-badge-level-info">
            <span className="points-badge-level-number">Level {stats.level.current}</span>
            <span className="points-badge-level-title">{stats.level.title}</span>
          </div>
          <div className="points-badge-progress-bar">
            <div 
              className="points-badge-progress-fill"
              style={{ width: `${stats.level.progress}%` }}
            ></div>
          </div>
          <span className="points-badge-progress-text">
            {stats.level.pointsInLevel} / {stats.level.pointsNeeded} XP
          </span>
        </div>

        {showBadges && stats.badges.total > 0 && (
          <div className="points-badge-badges-compact">
            <div className="points-badge-badges-header">
              <span className="points-badge-badges-icon">🏆</span>
              <span className="points-badge-badges-count">{stats.badges.total} Badges</span>
            </div>
            <div className="points-badge-badges-grid-compact">
              {stats.badges.recent.map((badge, index) => (
                <div 
                  key={index} 
                  className="points-badge-item-compact"
                  title={badge.name}
                  style={{ borderColor: badge.color }}
                >
                  <span className="points-badge-item-icon">{badge.icon}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full version (for profile pages)
  return (
    <>
      <div className="points-badge-display">
        <div className="points-badge-card">
          <div className="points-badge-header">
            <h3 className="points-badge-title">
              <span className="points-badge-title-icon">⭐</span>
              Your Progress
            </h3>
          </div>

          <div className="points-badge-stats-grid">
            <div className="points-badge-stat-item">
              <span className="points-badge-stat-icon">💎</span>
              <div className="points-badge-stat-content">
                <span className="points-badge-stat-value">{stats.totalPoints}</span>
                <span className="points-badge-stat-label">Total Points</span>
              </div>
            </div>

            <div className="points-badge-stat-item">
              <span className="points-badge-stat-icon">📊</span>
              <div className="points-badge-stat-content">
                <span className="points-badge-stat-value">Level {stats.level.current}</span>
                <span className="points-badge-stat-label">{stats.level.title}</span>
              </div>
            </div>

            <div className="points-badge-stat-item">
              <span className="points-badge-stat-icon">🏆</span>
              <div className="points-badge-stat-content">
                <span className="points-badge-stat-value">{stats.badges.total}</span>
                <span className="points-badge-stat-label">Badges Earned</span>
              </div>
            </div>

            <div className="points-badge-stat-item">
              <span className="points-badge-stat-icon">📅</span>
              <div className="points-badge-stat-content">
                <span className="points-badge-stat-value">{stats.accountAge.days}</span>
                <span className="points-badge-stat-label">Days Active</span>
              </div>
            </div>
          </div>

          <div className="points-badge-level-section">
            <div className="points-badge-level-header">
              <span className="points-badge-level-text">
                Level {stats.level.current} - {stats.level.title}
              </span>
              <span className="points-badge-level-next">
                Next: Level {stats.level.current + 1}
              </span>
            </div>
            <div className="points-badge-progress-bar-full">
              <div 
                className="points-badge-progress-fill-full"
                style={{ width: `${stats.level.progress}%` }}
              >
                <span className="points-badge-progress-percentage">
                  {Math.round(stats.level.progress)}%
                </span>
              </div>
            </div>
            <div className="points-badge-progress-details">
              <span>{stats.level.pointsInLevel} XP</span>
              <span>{stats.level.pointsNeeded} XP</span>
            </div>
          </div>
        </div>

        {showBadges && stats.badges.total > 0 && (
          <div className="points-badge-badges-section">
            <h3 className="points-badge-badges-title">
              <span className="points-badge-badges-title-icon">🏆</span>
              Recent Badges
            </h3>
            <div className="points-badge-badges-grid">
              {stats.badges.recent.map((badge, index) => (
                <div 
                  key={index} 
                  className={`points-badge-item tier-${badge.tier}`}
                  style={{ borderColor: badge.color }}
                >
                  <div className="points-badge-item-header">
                    <span className="points-badge-item-icon-large">{badge.icon}</span>
                    <span className={`points-badge-item-tier tier-${badge.tier}`}>
                      {badge.tier}
                    </span>
                  </div>
                  <h4 className="points-badge-item-name">{badge.name}</h4>
                  <p className="points-badge-item-description">{badge.description}</p>
                  <span className="points-badge-item-date">
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Badge Modal */}
      {showBadgeModal && newBadges.length > 0 && (
        <div className="points-badge-modal-overlay">
          <div className="points-badge-modal">
            <div className="points-badge-modal-confetti">
              🎉 🎊 ⭐ 🏆 ✨
            </div>
            <h2 className="points-badge-modal-title">New Badge Earned!</h2>
            <div className="points-badge-modal-badges">
              {newBadges.map((badge, index) => (
                <div key={index} className="points-badge-modal-badge">
                  <span className="points-badge-modal-icon">{badge.icon}</span>
                  <h3 className="points-badge-modal-name">{badge.name}</h3>
                  <p className="points-badge-modal-desc">{badge.description}</p>
                </div>
              ))}
            </div>
            <button 
              className="points-badge-modal-close"
              onClick={() => setShowBadgeModal(false)}
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

      {/* Level Up Animation */}
      {showLevelUp && (
        <div className="points-badge-levelup-overlay">
          <div className="points-badge-levelup">
            <div className="points-badge-levelup-flash"></div>
            <h2 className="points-badge-levelup-title">LEVEL UP!</h2>
            <div className="points-badge-levelup-level">
              <span className="points-badge-levelup-number">{stats.level.current}</span>
            </div>
            <p className="points-badge-levelup-subtitle">{stats.level.title}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default PointsBadgeDisplay;