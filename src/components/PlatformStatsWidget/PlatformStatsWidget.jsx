import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlatformStats, getGrowthAnalytics } from '../../services/platformStatsService';
import './PlatformStatsWidget.css';

const PlatformStatsWidget = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGrowth, setShowGrowth] = useState(false);

  useEffect(() => {
    let isMounted = true; // ← Add this
    
    const loadStats = async () => {
      if (!isMounted) return;
      await fetchStats();
    };
    
    loadStats();
    
    return () => { isMounted = false; }; // ← Add cleanup
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch platform stats
      const statsResponse = await getPlatformStats();
      setStats(statsResponse.stats);

      // Try to fetch growth analytics
      try {
        const growthResponse = await getGrowthAnalytics();
        setGrowth(growthResponse.growth);
      } catch (err) {
        console.log('Growth analytics not available');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching platform stats:', err);
      setError('Failed to load statistics');
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getGrowthColor = (value) => {
    if (!value || value === 0) return '#65676b';
    return value > 0 ? '#31a24c' : '#e4526d';
  };

  const getGrowthIcon = (value) => {
    if (!value || value === 0) return '━';
    return value > 0 ? '↗' : '↘';
  };

  if (loading) {
    return (
      <div className="psw-platform-stats-widget">
        <div className="psw-widget-header">
          <h4 className="psw-widget-title">
            <span className="psw-title-icon">📊</span>
            Platform Statistics
          </h4>
        </div>
        <div className="psw-loading-container">
          <div className="psw-spinner"></div>
          <p className="psw-loading-text">Loading stats...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="psw-platform-stats-widget">
        <div className="psw-widget-header">
          <h4 className="psw-widget-title">
            <span className="psw-title-icon">📊</span>
            Platform Statistics
          </h4>
        </div>
        <div className="psw-error-container">
          <span className="psw-error-icon">⚠️</span>
          <p className="psw-error-text">{error || 'Statistics unavailable'}</p>
          <button className="psw-retry-btn" onClick={fetchStats}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="psw-platform-stats-widget">
      {/* Header */}
      <div className="psw-widget-header">
        <h4 className="psw-widget-title">
          <span className="psw-title-icon">📊</span>
          Platform Statistics
        </h4>
        <div className="psw-header-actions">
          {growth && (
            <button
              className={`psw-growth-toggle ${showGrowth ? 'psw-active' : ''}`}
              onClick={() => setShowGrowth(!showGrowth)}
              title={showGrowth ? 'Hide growth' : 'Show growth'}
            >
              {showGrowth ? '📊' : '📈'}
            </button>
          )}
          <button
            className="psw-refresh-btn"
            onClick={fetchStats}
            title="Refresh statistics"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="psw-stats-grid">
        {/* Users Stats */}
        <div 
          className="psw-stat-card psw-users"
          onClick={() => navigate('/fans')}
        >
          <div className="psw-stat-icon-wrapper">
            <span className="psw-stat-icon">👥</span>
          </div>
          <div className="psw-stat-content">
            <span className="psw-stat-value">
              {formatNumber(stats.users?.total || 0)}
            </span>
            <span className="psw-stat-label">Total Fans</span>
            {showGrowth && growth?.users && (
              <span 
                className="psw-growth-badge"
                style={{ color: getGrowthColor(growth.users) }}
              >
                {getGrowthIcon(growth.users)} {Math.abs(growth.users)}%
              </span>
            )}
          </div>
        </div>

        {/* Active Users */}
        <div 
          className="psw-stat-card psw-active-users"
          onClick={() => navigate('/fans')}
        >
          <div className="psw-stat-icon-wrapper">
            <span className="psw-stat-icon">🟢</span>
          </div>
          <div className="psw-stat-content">
            <span className="psw-stat-value">
              {formatNumber(stats.users?.active || 0)}
            </span>
            <span className="psw-stat-label">Active Users</span>
            <span className="psw-stat-subtitle">
              {stats.users?.total > 0 
                ? `${Math.round((stats.users?.active / stats.users?.total) * 100)}% active`
                : '0% active'
              }
            </span>
          </div>
        </div>

        {/* Posts Stats */}
        <div 
          className="psw-stat-card psw-posts"
          onClick={() => navigate('/')}
        >
          <div className="psw-stat-icon-wrapper">
            <span className="psw-stat-icon">📝</span>
          </div>
          <div className="psw-stat-content">
            <span className="psw-stat-value">
              {formatNumber(stats.posts?.published || 0)}
            </span>
            <span className="psw-stat-label">Posts</span>
            {showGrowth && growth?.posts && (
              <span 
                className="psw-growth-badge"
                style={{ color: getGrowthColor(growth.posts) }}
              >
                {getGrowthIcon(growth.posts)} {Math.abs(growth.posts)}%
              </span>
            )}
          </div>
        </div>

        {/* Engagement Stats */}
        <div 
          className="psw-stat-card psw-engagement"
          onClick={() => navigate('/')}
        >
          <div className="psw-stat-icon-wrapper">
            <span className="psw-stat-icon">❤️</span>
          </div>
          <div className="psw-stat-content">
            <span className="psw-stat-value">
              {formatNumber(stats.engagement?.totalLikes || 0)}
            </span>
            <span className="psw-stat-label">Total Likes</span>
            {showGrowth && growth?.engagement && (
              <span 
                className="psw-growth-badge"
                style={{ color: getGrowthColor(growth.engagement) }}
              >
                {getGrowthIcon(growth.engagement)} {Math.abs(growth.engagement)}%
              </span>
            )}
          </div>
        </div>

        {/* Achievements Stats */}
        <div 
          className="psw-stat-card psw-achievements"
          onClick={() => navigate('/achievements')}
        >
          <div className="psw-stat-icon-wrapper">
            <span className="psw-stat-icon">🏆</span>
          </div>
          <div className="psw-stat-content">
            <span className="psw-stat-value">
              {stats.achievements?.published || 0}
            </span>
            <span className="psw-stat-label">Achievements</span>
            {stats.achievements?.majors > 0 && (
              <span className="psw-stat-subtitle">
                {stats.achievements.majors} Major{stats.achievements.majors !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Tournaments Stats */}
        <div 
          className="psw-stat-card psw-tournaments"
          onClick={() => navigate('/tournaments')}
        >
          <div className="psw-stat-icon-wrapper">
            <span className="psw-stat-icon">🏌️‍♀️</span>
          </div>
          <div className="psw-stat-content">
            <span className="psw-stat-value">
              {stats.tournaments?.total || 0}
            </span>
            <span className="psw-stat-label">Tournaments</span>
            {stats.tournaments?.upcoming > 0 && (
              <span className="psw-stat-subtitle">
                {stats.tournaments.upcoming} upcoming
              </span>
            )}
          </div>
        </div>

        {/* Stories Stats */}
        {stats.stories && (
          <div 
            className="psw-stat-card psw-stories"
            onClick={() => navigate('/')}
          >
            <div className="psw-stat-icon-wrapper">
              <span className="psw-stat-icon">📸</span>
            </div>
            <div className="psw-stat-content">
              <span className="psw-stat-value">
                {stats.stories.active || 0}
              </span>
              <span className="psw-stat-label">Active Stories</span>
              {stats.stories.totalViews > 0 && (
                <span className="psw-stat-subtitle">
                  {formatNumber(stats.stories.totalViews)} views
                </span>
              )}
            </div>
          </div>
        )}

        {/* Messages Stats */}
        {stats.messages && (
          <div 
            className="psw-stat-card psw-messages"
            onClick={() => navigate('/chat')}
          >
            <div className="psw-stat-icon-wrapper">
              <span className="psw-stat-icon">💬</span>
            </div>
            <div className="psw-stat-content">
              <span className="psw-stat-value">
                {formatNumber(stats.messages.total || 0)}
              </span>
              <span className="psw-stat-label">Messages</span>
              {stats.messages.conversations > 0 && (
                <span className="psw-stat-subtitle">
                  {stats.messages.conversations} conversations
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="psw-widget-footer">
        <div className="psw-footer-info">
          <span className="psw-info-icon">ℹ️</span>
          <span className="psw-info-text">
            {stats.cached ? 'Cached data' : 'Live data'} • Updated{' '}
            {new Date(stats.system?.lastCalculated || Date.now()).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlatformStatsWidget;