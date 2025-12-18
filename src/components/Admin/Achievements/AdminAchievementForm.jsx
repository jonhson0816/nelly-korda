import React, { useState } from 'react';
import { createAchievement, updateAchievement } from '../../../services/achievementService';
import './AdminAchievementForm.css';

const AdminAchievementForm = ({ achievement = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: achievement?.title || '',
    description: achievement?.description || '',
    category: achievement?.category || 'tournament_win',
    year: achievement?.year || new Date().getFullYear(),
    date: achievement?.date ? achievement.date.split('T')[0] : new Date().toISOString().split('T')[0],
    icon: achievement?.icon || '🏆',
    isFeatured: achievement?.isFeatured || false,
    isMajor: achievement?.isMajor || false,
    isPublished: achievement?.isPublished !== undefined ? achievement.isPublished : true,
  });

  const [stats, setStats] = useState({
    position: achievement?.stats?.position || '',
    score: achievement?.stats?.score || '',
    prize: achievement?.stats?.prize || '',
    points: achievement?.stats?.points || '',
    opponents: achievement?.stats?.opponents || '',
  });

  const [highlights, setHighlights] = useState(
    achievement?.highlights || [{ title: '', description: '', timestamp: '' }]
  );

  const [tags, setTags] = useState(achievement?.tags?.join(', ') || '');
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    { value: 'tournament_win', label: 'Tournament Win' },
    { value: 'major_championship', label: 'Major Championship' },
    { value: 'ranking', label: 'Ranking' },
    { value: 'record', label: 'Record' },
    { value: 'award', label: 'Award' },
    { value: 'milestone', label: 'Milestone' },
    { value: 'endorsement', label: 'Endorsement' },
    { value: 'charity', label: 'Charity' },
    { value: 'other', label: 'Other' },
  ];

  const icons = ['🏆', '⭐', '🏅', '🎖️', '👑', '💎', '🔥', '✨', '🎯', '⚡'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleStatsChange = (e) => {
    const { name, value } = e.target;
    setStats((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHighlightChange = (index, field, value) => {
    const newHighlights = [...highlights];
    newHighlights[index][field] = value;
    setHighlights(newHighlights);
  };

  const addHighlight = () => {
    setHighlights([...highlights, { title: '', description: '', timestamp: '' }]);
  };

  const removeHighlight = (index) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be less than 10MB');
        return;
      }
      setCoverImage(file);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = new FormData();

      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });

      const filteredStats = {};
      Object.keys(stats).forEach((key) => {
        if (stats[key] !== '' && stats[key] !== null) {
          filteredStats[key] = stats[key];
        }
      });
      if (Object.keys(filteredStats).length > 0) {
        submitData.append('stats', JSON.stringify(filteredStats));
      }

      const filteredHighlights = highlights.filter(
        (h) => h.title.trim() !== '' || h.description.trim() !== ''
      );
      if (filteredHighlights.length > 0) {
        submitData.append('highlights', JSON.stringify(filteredHighlights));
      }

      if (tags.trim()) {
        submitData.append('tags', tags);
      }

      if (coverImage) {
        submitData.append('coverImage', coverImage);
      }

      if (achievement) {
        await updateAchievement(achievement._id, submitData);
      } else {
        await createAchievement(submitData);
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save achievement');
      console.error('Error saving achievement:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="AdAch-001-admin-achievement-form">
      <div className="AdAch-001-form-header">
        <h2>{achievement ? 'Edit Achievement' : 'Create Achievement'}</h2>
        {onCancel && (
          <button type="button" onClick={onCancel} className="AdAch-001-close-btn">
            ×
          </button>
        )}
      </div>

      {error && (
        <div className="AdAch-001-form-error">
          <span>⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="AdAch-001-achievement-form">
        {/* Basic Info */}
        <section className="AdAch-001-form-section">
          <h3 className="AdAch-001-section-title">Basic Information</h3>

          <div className="AdAch-001-form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              maxLength={200}
              placeholder="e.g., Winner of the 2024 LPGA Championship"
            />
          </div>

          <div className="AdAch-001-form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              maxLength={1000}
              rows={4}
              placeholder="Describe the achievement..."
            />
          </div>

          <div className="AdAch-001-form-row">
            <div className="AdAch-001-form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="AdAch-001-form-group">
              <label htmlFor="icon">Icon</label>
              <div className="AdAch-001-icon-selector">
                {icons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={`AdAch-001-icon-option ${formData.icon === icon ? 'AdAch-001-active' : ''}`}
                    onClick={() => setFormData((prev) => ({ ...prev, icon }))}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="AdAch-001-form-row">
            <div className="AdAch-001-form-group">
              <label htmlFor="year">Year *</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                required
                min={2000}
                max={new Date().getFullYear() + 1}
              />
            </div>

            <div className="AdAch-001-form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="AdAch-001-form-group">
            <label htmlFor="coverImage">Cover Image</label>
            <input
              type="file"
              id="coverImage"
              accept="image/*"
              onChange={handleImageChange}
            />
            {achievement?.coverImage?.url && !coverImage && (
              <div className="AdAch-001-current-image">
                <img src={achievement.coverImage.url} alt="Current cover" />
                <p>Current image (upload new to replace)</p>
              </div>
            )}
          </div>
        </section>

        {/* Statistics */}
        <section className="AdAch-001-form-section">
          <h3 className="AdAch-001-section-title">Statistics (Optional)</h3>

          <div className="AdAch-001-form-row">
            <div className="AdAch-001-form-group">
              <label htmlFor="position">Position</label>
              <input
                type="number"
                id="position"
                name="position"
                value={stats.position}
                onChange={handleStatsChange}
                placeholder="e.g., 1"
              />
            </div>

            <div className="AdAch-001-form-group">
              <label htmlFor="score">Score</label>
              <input
                type="text"
                id="score"
                name="score"
                value={stats.score}
                onChange={handleStatsChange}
                placeholder="e.g., -18"
              />
            </div>
          </div>

          <div className="AdAch-001-form-row">
            <div className="AdAch-001-form-group">
              <label htmlFor="prize">Prize Money ($)</label>
              <input
                type="number"
                id="prize"
                name="prize"
                value={stats.prize}
                onChange={handleStatsChange}
                placeholder="e.g., 1000000"
              />
            </div>

            <div className="AdAch-001-form-group">
              <label htmlFor="points">Points</label>
              <input
                type="number"
                id="points"
                name="points"
                value={stats.points}
                onChange={handleStatsChange}
                placeholder="e.g., 500"
              />
            </div>
          </div>

          <div className="AdAch-001-form-group">
            <label htmlFor="opponents">Number of Opponents</label>
            <input
              type="number"
              id="opponents"
              name="opponents"
              value={stats.opponents}
              onChange={handleStatsChange}
              placeholder="e.g., 144"
            />
          </div>
        </section>

        {/* Highlights */}
        <section className="AdAch-001-form-section">
          <h3 className="AdAch-001-section-title">Key Highlights (Optional)</h3>

          {highlights.map((highlight, index) => (
            <div key={index} className="AdAch-001-highlight-group">
              <div className="AdAch-001-highlight-header">
                <h4>Highlight {index + 1}</h4>
                {highlights.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeHighlight(index)}
                    className="AdAch-001-remove-btn"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="AdAch-001-form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={highlight.title}
                  onChange={(e) => handleHighlightChange(index, 'title', e.target.value)}
                  placeholder="e.g., Eagle on 18th hole"
                />
              </div>

              <div className="AdAch-001-form-group">
                <label>Description</label>
                <textarea
                  value={highlight.description}
                  onChange={(e) =>
                    handleHighlightChange(index, 'description', e.target.value)
                  }
                  rows={2}
                  placeholder="Describe this highlight..."
                />
              </div>

              <div className="AdAch-001-form-group">
                <label>Timestamp</label>
                <input
                  type="text"
                  value={highlight.timestamp}
                  onChange={(e) =>
                    handleHighlightChange(index, 'timestamp', e.target.value)
                  }
                  placeholder="e.g., Round 3, Hole 18"
                />
              </div>
            </div>
          ))}

          <button type="button" onClick={addHighlight} className="AdAch-001-add-btn">
            + Add Highlight
          </button>
        </section>

        {/* Tags */}
        <section className="AdAch-001-form-section">
          <h3 className="AdAch-001-section-title">Tags (Optional)</h3>

          <div className="AdAch-001-form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., lpga, golf, championship, 2024"
            />
            <small>Separate tags with commas</small>
          </div>
        </section>

        {/* Flags */}
        <section className="AdAch-001-form-section">
          <h3 className="AdAch-001-section-title">Settings</h3>

          <div className="AdAch-001-form-checkboxes">
            <label className="AdAch-001-checkbox-label">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
              />
              <span>Featured Achievement</span>
            </label>

            <label className="AdAch-001-checkbox-label">
              <input
                type="checkbox"
                name="isMajor"
                checked={formData.isMajor}
                onChange={handleInputChange}
              />
              <span>Major Championship</span>
            </label>

            <label className="AdAch-001-checkbox-label">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
              />
              <span>Published (visible to users)</span>
            </label>
          </div>
        </section>

        {/* Submit Buttons */}
        <div className="AdAch-001-form-actions">
          {onCancel && (
            <button type="button" onClick={onCancel} className="AdAch-001-cancel-btn">
              Cancel
            </button>
          )}
          <button type="submit" disabled={loading} className="AdAch-001-submit-btn">
            {loading ? 'Saving...' : achievement ? 'Update Achievement' : 'Create Achievement'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAchievementForm;