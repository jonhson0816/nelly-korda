// AchievementDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAchievement } from '../../services/achievementService';
import './AchievementDetailPage.css';

const AchievementDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [achievement, setAchievement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchAchievement();
  }, [id]);

  const fetchAchievement = async () => {
    try {
      setLoading(true);
      const data = await getAchievement(id);
      setAchievement(data.achievement);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load achievement');
      console.error('Error fetching achievement:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      tournament_win: 'Tournament Win',
      major_championship: 'Major Championship',
      ranking: 'Ranking',
      record: 'Record',
      award: 'Award',
      milestone: 'Milestone',
      endorsement: 'Endorsement',
      charity: 'Charity',
      other: 'Other',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      tournament_win: '#4CAF50',
      major_championship: '#FFD700',
      ranking: '#2196F3',
      record: '#FF5722',
      award: '#9C27B0',
      milestone: '#FF9800',
      endorsement: '#00BCD4',
      charity: '#E91E63',
      other: '#607D8B',
    };
    return colors[category] || '#607D8B';
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = achievement?.title || '';
    const description = achievement?.description || '';

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' - ' + url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        return;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className="achievement-detail-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading achievement...</p>
        </div>
      </div>
    );
  }

  if (error || !achievement) {
    return (
      <div className="achievement-detail-page">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <h2>Achievement Not Found</h2>
          <p>{error || 'This achievement could not be loaded'}</p>
          <button onClick={() => navigate('/achievements')} className="back-btn">
            Back to Achievements
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="achievement-detail-page">
      {/* Hero Section */}
      <section className="detail-hero">
        <div className="hero-background">
          {achievement.coverImage?.url ? (
            <img src={achievement.coverImage.url} alt={achievement.title} />
          ) : (
            <div className="hero-gradient"></div>
          )}
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content">
          <button className="back-button" onClick={() => navigate('/achievements')}>
            ← Back to Achievements
          </button>

          <div className="hero-badges">
            {achievement.isMajor && (
              <span className="badge major-badge">⭐ MAJOR CHAMPIONSHIP</span>
            )}
            {achievement.isFeatured && (
              <span className="badge featured-badge">🔥 FEATURED</span>
            )}
          </div>

          <div className="hero-info">
            <span
              className="hero-category"
              style={{ backgroundColor: getCategoryColor(achievement.category) }}
            >
              {getCategoryLabel(achievement.category)}
            </span>
            <h1 className="hero-title">
              <span className="hero-icon">{achievement.icon}</span>
              {achievement.title}
            </h1>
            <div className="hero-meta">
              <span className="hero-year">{achievement.year}</span>
              <span className="separator">•</span>
              <span className="hero-date">
                {new Date(achievement.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="detail-content">
        <div className="detail-container">
          {/* Main Column */}
          <div className="main-column">
            {/* Description */}
            <section className="detail-section">
              <h2 className="section-title">About This Achievement</h2>
              <p className="achievement-description">{achievement.description}</p>
            </section>

            {/* Stats */}
            {achievement.stats && Object.keys(achievement.stats).length > 0 && (
              <section className="detail-section stats-section">
                <h2 className="section-title">Statistics</h2>
                <div className="stats-grid-detail">
                  {achievement.stats.position && (
                    <div className="stat-item-detail">
                      <div className="stat-icon-detail">🏆</div>
                      <div className="stat-value-detail">{achievement.stats.position}</div>
                      <div className="stat-label-detail">Position</div>
                    </div>
                  )}
                  {achievement.stats.score && (
                    <div className="stat-item-detail">
                      <div className="stat-icon-detail">⛳</div>
                      <div className="stat-value-detail">{achievement.stats.score}</div>
                      <div className="stat-label-detail">Score</div>
                    </div>
                  )}
                  {achievement.stats.prize && (
                    <div className="stat-item-detail">
                      <div className="stat-icon-detail">💰</div>
                      <div className="stat-value-detail">
                        ${achievement.stats.prize.toLocaleString()}
                      </div>
                      <div className="stat-label-detail">Prize Money</div>
                    </div>
                  )}
                  {achievement.stats.points && (
                    <div className="stat-item-detail">
                      <div className="stat-icon-detail">📊</div>
                      <div className="stat-value-detail">{achievement.stats.points}</div>
                      <div className="stat-label-detail">Points</div>
                    </div>
                  )}
                  {achievement.stats.opponents && (
                    <div className="stat-item-detail">
                      <div className="stat-icon-detail">👥</div>
                      <div className="stat-value-detail">{achievement.stats.opponents}</div>
                      <div className="stat-label-detail">Opponents</div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Highlights */}
            {achievement.highlights && achievement.highlights.length > 0 && (
              <section className="detail-section">
                <h2 className="section-title">Key Highlights</h2>
                <div className="highlights-list">
                  {achievement.highlights.map((highlight, index) => (
                    <div key={index} className="highlight-item">
                      <div className="highlight-number">{index + 1}</div>
                      <div className="highlight-content">
                        <h4 className="highlight-title">{highlight.title}</h4>
                        <p className="highlight-description">{highlight.description}</p>
                        {highlight.timestamp && (
                          <span className="highlight-timestamp">{highlight.timestamp}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Gallery */}
            {achievement.gallery && achievement.gallery.length > 0 && (
              <section className="detail-section">
                <h2 className="section-title">Photo Gallery</h2>
                <div className="gallery-grid">
                  {achievement.gallery.map((image, index) => (
                    <div
                      key={image._id || index}
                      className="gallery-item"
                      onClick={() => setSelectedImage(image)}
                    >
                      <img src={image.url} alt={image.caption || `Gallery ${index + 1}`} />
                      {image.caption && (
                        <div className="gallery-caption">{image.caption}</div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Tags */}
            {achievement.tags && achievement.tags.length > 0 && (
              <section className="detail-section">
                <h2 className="section-title">Tags</h2>
                <div className="tags-list">
                  {achievement.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="sidebar-column">
            {/* Share Card */}
            <div className="sidebar-card">
              <h3 className="sidebar-title">Share This Achievement</h3>
              <div className="share-buttons">
                <button
                  className="share-btn facebook"
                  onClick={() => handleShare('facebook')}
                  title="Share on Facebook"
                >
                  <i className="icon-facebook"></i> Facebook
                </button>
                <button
                  className="share-btn twitter"
                  onClick={() => handleShare('twitter')}
                  title="Share on Twitter"
                >
                  <i className="icon-twitter"></i> Twitter
                </button>
                <button
                  className="share-btn linkedin"
                  onClick={() => handleShare('linkedin')}
                  title="Share on LinkedIn"
                >
                  <i className="icon-linkedin"></i> LinkedIn
                </button>
                <button
                  className="share-btn whatsapp"
                  onClick={() => handleShare('whatsapp')}
                  title="Share on WhatsApp"
                >
                  <i className="icon-whatsapp"></i> WhatsApp
                </button>
                <button
                  className="share-btn copy"
                  onClick={() => handleShare('copy')}
                  title="Copy Link"
                >
                  <i className="icon-link"></i> Copy Link
                </button>
              </div>
            </div>

            {/* Engagement Stats */}
            <div className="sidebar-card">
              <h3 className="sidebar-title">Engagement</h3>
              <div className="engagement-stats">
                <div className="engagement-item">
                  <span className="engagement-icon">👁️</span>
                  <span className="engagement-value">{achievement.views || 0}</span>
                  <span className="engagement-label">Views</span>
                </div>
                <div className="engagement-item">
                  <span className="engagement-icon">❤️</span>
                  <span className="engagement-value">{achievement.likes || 0}</span>
                  <span className="engagement-label">Likes</span>
                </div>
                <div className="engagement-item">
                  <span className="engagement-icon">📤</span>
                  <span className="engagement-value">{achievement.shares || 0}</span>
                  <span className="engagement-label">Shares</span>
                </div>
              </div>
            </div>

            {/* Tournament Info */}
            {achievement.tournament && (
              <div className="sidebar-card">
                <h3 className="sidebar-title">Tournament</h3>
                <div className="tournament-info">
                  <p className="tournament-name">{achievement.tournament.name}</p>
                  {achievement.tournament.location && (
                    <p className="tournament-location">
                      📍 {achievement.tournament.location}
                    </p>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedImage(null)}>
              ×
            </button>
            <img src={selectedImage.url} alt={selectedImage.caption || 'Gallery image'} />
            {selectedImage.caption && (
              <p className="modal-caption">{selectedImage.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementDetailPage;