import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tournamentService from '../../services/tournamentService';
import './TournamentDetailPage.css';

const TournamentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchTournament();
  }, [id]);

  const fetchTournament = async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Use tournamentService instead of raw fetch
    const data = await tournamentService.getTournament(id);
    
    setTournament(data.tournament);
    setLoading(false);
  } catch (err) {
    console.error('Error fetching tournament:', err);
    setError(err.response?.data?.message || err.message || 'Tournament not found');
    setLoading(false);
  }
};

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'upcoming': return 'status-upcoming';
      case 'ongoing': return 'status-ongoing';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const openImageModal = (image) => {
    setSelectedImage(image);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="tournament-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading tournament details...</p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="tournament-detail-page">
        <div className="error-container">
          <h2>⚠️ Tournament Not Found</h2>
          <p>{error || 'The tournament you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/tournaments')} className="back-btn">
            Back to Tournaments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tournament-detail-page">
      {/* Hero Section with Cover Image */}
      <div className="tournament-hero" style={{
        backgroundImage: tournament.coverImage?.url 
          ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${tournament.coverImage.url})`
          : 'linear-gradient(135deg, #0a66c2 0%, #004182 100%)'
      }}>
        <div className="tournament-hero-content">
          <button onClick={() => navigate('/tournaments')} className="back-button">
            ← Back to Tournaments
          </button>
          
          <div className="hero-title-section">
            <h1>{tournament.name}</h1>
            <div className="hero-meta">
              <span className={`status-badge ${getStatusBadgeClass(tournament.status)}`}>
                {tournament.status}
              </span>
              <span className="type-badge">{tournament.type}</span>
              {tournament.isFeatured && (
                <span className="featured-badge">⭐ Featured</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="tournament-container">
        <div className="tournament-layout">
          {/* Left Column - Main Details */}
          <div className="main-column">
            {/* Tournament Info Card */}
            <div className="info-card">
              <h2>Tournament Information</h2>
              
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-icon">📍</div>
                  <div className="info-content">
                    <label>Location</label>
                    <p>
                      <strong>{tournament.location.venue}</strong><br />
                      {tournament.location.city}{tournament.location.state && `, ${tournament.location.state}`}<br />
                      {tournament.location.country}
                    </p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">📅</div>
                  <div className="info-content">
                    <label>Tournament Dates</label>
                    <p>
                      <strong>Start:</strong> {formatDate(tournament.startDate)}<br />
                      <strong>End:</strong> {formatDate(tournament.endDate)}
                    </p>
                  </div>
                </div>

                {tournament.prizeMoney?.total > 0 && (
                  <div className="info-item">
                    <div className="info-icon">💰</div>
                    <div className="info-content">
                      <label>Prize Money</label>
                      <p className="prize-amount">
                        {formatCurrency(tournament.prizeMoney.total, tournament.prizeMoney.currency)}
                      </p>
                    </div>
                  </div>
                )}

                {tournament.stats && (
                  <div className="info-item">
                    <div className="info-icon">📊</div>
                    <div className="info-content">
                      <label>Tournament Stats</label>
                      <p>
                        {tournament.stats.totalPlayers && `Players: ${tournament.stats.totalPlayers}`}
                        {tournament.stats.rounds && ` • Rounds: ${tournament.stats.rounds}`}
                        {tournament.stats.par && ` • Par: ${tournament.stats.par}`}
                      </p>
                    </div>
                  </div>
                )}

                {tournament.website && (
                  <div className="info-item">
                    <div className="info-icon">🌐</div>
                    <div className="info-content">
                      <label>Official Website</label>
                      <p>
                        <a href={tournament.website} target="_blank" rel="noopener noreferrer">
                          Visit Tournament Website →
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {tournament.description && (
              <div className="info-card">
                <h2>About This Tournament</h2>
                <p className="description-text">{tournament.description}</p>
              </div>
            )}

            {/* Nelly's Performance */}
            {tournament.performance?.participated && (
              <div className="info-card performance-card">
                <h2>Nelly Korda's Performance</h2>
                
                <div className="performance-highlights">
                  <div className="performance-stat">
                    <div className="stat-label">Final Position</div>
                    <div className="stat-value position">#{tournament.performance.position}</div>
                  </div>

                  {tournament.performance.score?.toPar && (
                    <div className="performance-stat">
                      <div className="stat-label">Score</div>
                      <div className="stat-value score">{tournament.performance.score.toPar}</div>
                    </div>
                  )}

                  {tournament.performance.score?.total && (
                    <div className="performance-stat">
                      <div className="stat-label">Total Score</div>
                      <div className="stat-value">{tournament.performance.score.total}</div>
                    </div>
                  )}

                  {tournament.performance.earnings && (
                    <div className="performance-stat">
                      <div className="stat-label">Earnings</div>
                      <div className="stat-value earnings">
                        {formatCurrency(tournament.performance.earnings)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Round Scores */}
                {tournament.performance.score?.rounds && tournament.performance.score.rounds.length > 0 && (
                  <div className="rounds-section">
                    <h3>Round-by-Round Scores</h3>
                    <div className="rounds-grid">
                      {tournament.performance.score.rounds.map((round, index) => (
                        <div key={index} className="round-card">
                          <div className="round-number">Round {round.round}</div>
                          <div className="round-score">{round.score}</div>
                          <div className="round-par">
                            {round.score - round.par > 0 ? '+' : ''}
                            {round.score - round.par === 0 ? 'E' : round.score - round.par}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Highlights */}
                {tournament.performance.highlights && tournament.performance.highlights.length > 0 && (
                  <div className="highlights-section">
                    <h3>Highlights</h3>
                    <ul className="highlights-list">
                      {tournament.performance.highlights.map((highlight, index) => (
                        <li key={index}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Gallery */}
            {tournament.gallery && tournament.gallery.length > 0 && (
              <div className="info-card">
                <h2>Photo Gallery</h2>
                <div className="gallery-grid">
                  {tournament.gallery.map((image, index) => (
                    <div
                      key={index}
                      className="gallery-item"
                      onClick={() => openImageModal(image)}
                    >
                      <img src={image.url} alt={image.caption || `Gallery image ${index + 1}`} />
                      {image.caption && (
                        <div className="gallery-caption">{image.caption}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Posts */}
            {tournament.relatedPosts && tournament.relatedPosts.length > 0 && (
              <div className="info-card">
                <h2>Related Posts</h2>
                <div className="related-posts-grid">
                  {tournament.relatedPosts.map((post) => (
                    <div
                      key={post._id}
                      className="related-post-card"
                      onClick={() => navigate(`/post/${post._id}`)}
                    >
                      {post.media && post.media[0] && (
                        <img src={post.media[0].url} alt="Post" />
                      )}
                      <div className="related-post-info">
                        <p className="post-caption">
                          {post.caption?.substring(0, 100)}
                          {post.caption?.length > 100 && '...'}
                        </p>
                        <div className="post-stats">
                          <span>❤️ {post.likesCount || 0}</span>
                          <span>💬 {post.commentsCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Quick Info */}
          <div className="sidebar-column">
            <div className="quick-info-card">
              <h3>Quick Facts</h3>
              
              <div className="quick-info-list">
                <div className="quick-info-item">
                  <span className="label">Status:</span>
                  <span className={`value ${tournament.status}`}>
                    {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                  </span>
                </div>

                <div className="quick-info-item">
                  <span className="label">Type:</span>
                  <span className="value">{tournament.type}</span>
                </div>

                {tournament.daysUntilStart > 0 && (
                  <div className="quick-info-item">
                    <span className="label">Days Until Start:</span>
                    <span className="value highlight">{tournament.daysUntilStart} days</span>
                  </div>
                )}

                {tournament.performance?.participated && (
                  <>
                    <div className="divider"></div>
                    <div className="quick-info-item">
                      <span className="label">Nelly's Finish:</span>
                      <span className="value highlight">
                        #{tournament.performance.position}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {tournament.location.coordinates?.latitude && tournament.location.coordinates?.longitude && (
                <button className="view-map-btn">
                  📍 View on Map
                </button>
              )}
            </div>

            {/* Share Card */}
            <div className="share-card">
              <h3>Share Tournament</h3>
              <div className="share-buttons">
                <button className="share-btn facebook" title="Share on Facebook">
                  <span>f</span>
                </button>
                <button className="share-btn twitter" title="Share on Twitter">
                  <span>𝕏</span>
                </button>
                <button className="share-btn linkedin" title="Share on LinkedIn">
                  <span>in</span>
                </button>
                <button className="share-btn copy" title="Copy Link">
                  <span>🔗</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal" onClick={closeImageModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeImageModal}>×</button>
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

export default TournamentDetailPage;