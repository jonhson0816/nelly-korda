// AchievementCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AchievementCard.css';

const AchievementCard = ({ achievement }) => {
  const navigate = useNavigate();

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

  const handleCardClick = () => {
    navigate(`/achievements/${achievement._id}`);
  };

  return (
    <div className="achievement-card" onClick={handleCardClick}>
      {achievement.isMajor && (
        <div className="achievement-badge major-badge">
          <span>⭐</span> MAJOR
        </div>
      )}
      {achievement.isFeatured && (
        <div className="achievement-badge featured-badge">
          <span>🔥</span> FEATURED
        </div>
      )}

      <div className="achievement-card-image">
        {achievement.coverImage?.url ? (
          <img src={achievement.coverImage.url} alt={achievement.title} />
        ) : (
          <div className="achievement-placeholder">
            <span className="achievement-icon">{achievement.icon}</span>
          </div>
        )}
        <div className="achievement-overlay">
          <div className="achievement-year">{achievement.year}</div>
        </div>
      </div>

      <div className="achievement-card-content">
        <div
          className="achievement-category"
          style={{ backgroundColor: getCategoryColor(achievement.category) }}
        >
          {getCategoryLabel(achievement.category)}
        </div>

        <h3 className="achievement-title">{achievement.title}</h3>
        
        <p className="achievement-description">
          {achievement.description.length > 120
            ? `${achievement.description.substring(0, 120)}...`
            : achievement.description}
        </p>

        {achievement.stats && (
          <div className="achievement-stats">
            {achievement.stats.position && (
              <div className="stat-item">
                <span className="stat-icon">🏆</span>
                <span className="stat-value">{achievement.stats.position}</span>
                <span className="stat-label">Position</span>
              </div>
            )}
            {achievement.stats.score && (
              <div className="stat-item">
                <span className="stat-icon">⛳</span>
                <span className="stat-value">{achievement.stats.score}</span>
                <span className="stat-label">Score</span>
              </div>
            )}
            {achievement.stats.prize && (
              <div className="stat-item">
                <span className="stat-icon">💰</span>
                <span className="stat-value">
                  ${(achievement.stats.prize / 1000).toFixed(0)}K
                </span>
                <span className="stat-label">Prize</span>
              </div>
            )}
          </div>
        )}

        <div className="achievement-card-footer">
          <div className="achievement-date">
            {new Date(achievement.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
          <div className="achievement-engagement">
            <span title="Views">
              <i className="icon-eye"></i> {achievement.views || 0}
            </span>
            <span title="Likes">
              <i className="icon-heart"></i> {achievement.likes || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;