import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import tournamentService from '../../../services/tournamentService';
import './TournamentForm.css';

const TournamentForm = ({ mode = 'create' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'LPGA Tour',
    venue: '',
    city: '',
    state: '',
    country: '',
    startDate: '',
    endDate: '',
    description: '',
    totalPrizeMoney: '',
    currency: 'USD',
    website: '',
    totalPlayers: '',
    rounds: '',
    par: '',
    isFeatured: false,
    coverImage: null,
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    if (mode === 'edit' && id) {
      fetchTournament();
    }
  }, [isAdmin, mode, id, navigate]);

  const fetchTournament = async () => {
    try {
      setLoading(true);
      const data = await tournamentService.getTournament(id);
      const tournament = data.tournament;

      setFormData({
        name: tournament.name || '',
        type: tournament.type || 'LPGA Tour',
        venue: tournament.location?.venue || '',
        city: tournament.location?.city || '',
        state: tournament.location?.state || '',
        country: tournament.location?.country || '',
        startDate: tournament.startDate ? tournament.startDate.split('T')[0] : '',
        endDate: tournament.endDate ? tournament.endDate.split('T')[0] : '',
        description: tournament.description || '',
        totalPrizeMoney: tournament.prizeMoney?.total || '',
        currency: tournament.prizeMoney?.currency || 'USD',
        website: tournament.website || '',
        totalPlayers: tournament.stats?.totalPlayers || '',
        rounds: tournament.stats?.rounds || '',
        par: tournament.stats?.par || '',
        isFeatured: tournament.isFeatured || false,
        coverImage: null,
      });

      if (tournament.coverImage?.url) {
        setImagePreview(tournament.coverImage.url);
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to fetch tournament details');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, coverImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('type', formData.type);
      data.append('startDate', formData.startDate);
      data.append('endDate', formData.endDate);
      data.append('description', formData.description);
      data.append('website', formData.website);
      data.append('isFeatured', formData.isFeatured);

      data.append('location', JSON.stringify({
        venue: formData.venue,
        city: formData.city,
        state: formData.state,
        country: formData.country,
      }));

      data.append('prizeMoney', JSON.stringify({
        total: parseFloat(formData.totalPrizeMoney) || 0,
        currency: formData.currency,
      }));

      data.append('stats', JSON.stringify({
        totalPlayers: parseInt(formData.totalPlayers) || null,
        rounds: parseInt(formData.rounds) || null,
        par: parseInt(formData.par) || null,
      }));

      if (formData.coverImage) {
        data.append('coverImage', formData.coverImage);
      }

      if (mode === 'create') {
        await tournamentService.createTournament(data);
        navigate('/admin/tournaments');
      } else {
        await tournamentService.updateTournament(id, data);
        navigate('/admin/tournaments');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save tournament');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="tr-01100-tournament-form-page">
        <div className="tr-01100-loading-container">
          <div className="tr-01100-spinner"></div>
          <p>Loading tournament...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tr-01100-tournament-form-page">
      <div className="tr-01100-form-container">
        {/* Header */}
        <div className="tr-01100-form-header">
          <button className="tr-01100-back-btn" onClick={() => navigate('/admin/tournaments')}>
            ← Back
          </button>
          <h1>{mode === 'create' ? 'Create New Tournament' : 'Edit Tournament'}</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="tr-01100-error-banner">
            <span>⚠</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="tr-01100-tournament-form">
          {/* Basic Information */}
          <section className="tr-01100-form-section">
            <h2>Basic Information</h2>
            
            <div className="tr-01100-form-row">
              <div className="tr-01100-form-group tr-01100-full-width">
                <label htmlFor="name">Tournament Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  maxLength="200"
                  placeholder="e.g., U.S. Women's Open Championship"
                />
              </div>
            </div>

            <div className="tr-01100-form-row">
              <div className="tr-01100-form-group">
                <label htmlFor="type">Tournament Type *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Major">Major</option>
                  <option value="LPGA Tour">LPGA Tour</option>
                  <option value="International">International</option>
                  <option value="Exhibition">Exhibition</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="tr-01100-form-group">
                <label>
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                  />
                  Featured Tournament
                </label>
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="tr-01100-form-section">
            <h2>Location Details</h2>
            
            <div className="tr-01100-form-row">
              <div className="tr-01100-form-group tr-01100-full-width">
                <label htmlFor="venue">Venue Name *</label>
                <input
                  type="text"
                  id="venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Pebble Beach Golf Links"
                />
              </div>
            </div>

            <div className="tr-01100-form-row">
              <div className="tr-01100-form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g., Pebble Beach"
                />
              </div>

              <div className="tr-01100-form-group">
                <label htmlFor="state">State/Province</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="e.g., California"
                />
              </div>

              <div className="tr-01100-form-group">
                <label htmlFor="country">Country *</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., USA"
                />
              </div>
            </div>
          </section>

          {/* Dates */}
          <section className="tr-01100-form-section">
            <h2>Tournament Dates</h2>
            
            <div className="tr-01100-form-row">
              <div className="tr-01100-form-group">
                <label htmlFor="startDate">Start Date *</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="tr-01100-form-group">
                <label htmlFor="endDate">End Date *</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </section>

          {/* Prize Money & Stats */}
          <section className="tr-01100-form-section">
            <h2>Prize Money & Statistics</h2>
            
            <div className="tr-01100-form-row">
              <div className="tr-01100-form-group">
                <label htmlFor="totalPrizeMoney">Total Prize Money</label>
                <input
                  type="number"
                  id="totalPrizeMoney"
                  name="totalPrizeMoney"
                  value={formData.totalPrizeMoney}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                  placeholder="e.g., 10000000"
                />
              </div>

              <div className="tr-01100-form-group">
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
            </div>

            <div className="tr-01100-form-row">
              <div className="tr-01100-form-group">
                <label htmlFor="totalPlayers">Total Players</label>
                <input
                  type="number"
                  id="totalPlayers"
                  name="totalPlayers"
                  value={formData.totalPlayers}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="e.g., 156"
                />
              </div>

              <div className="tr-01100-form-group">
                <label htmlFor="rounds">Number of Rounds</label>
                <input
                  type="number"
                  id="rounds"
                  name="rounds"
                  value={formData.rounds}
                  onChange={handleInputChange}
                  min="1"
                  max="5"
                  placeholder="e.g., 4"
                />
              </div>

              <div className="tr-01100-form-group">
                <label htmlFor="par">Course Par</label>
                <input
                  type="number"
                  id="par"
                  name="par"
                  value={formData.par}
                  onChange={handleInputChange}
                  min="60"
                  max="80"
                  placeholder="e.g., 72"
                />
              </div>
            </div>
          </section>

          {/* Additional Info */}
          <section className="tr-01100-form-section">
            <h2>Additional Information</h2>
            
            <div className="tr-01100-form-row">
              <div className="tr-01100-form-group tr-01100-full-width">
                <label htmlFor="website">Official Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="tr-01100-form-row">
              <div className="tr-01100-form-group tr-01100-full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="5"
                  maxLength="2000"
                  placeholder="Enter tournament description..."
                />
                <small>{formData.description.length}/2000 characters</small>
              </div>
            </div>
          </section>

          {/* Cover Image */}
          <section className="tr-01100-form-section">
            <h2>Cover Image</h2>
            
            <div className="tr-01100-image-upload-section">
              <input
                type="file"
                id="coverImage"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              
              <label htmlFor="coverImage" className="tr-01100-upload-label">
                {imagePreview ? (
                  <div className="tr-01100-image-preview">
                    <img src={imagePreview} alt="Cover preview" />
                    <div className="tr-01100-image-overlay">
                      <span>Click to change image</span>
                    </div>
                  </div>
                ) : (
                  <div className="tr-01100-upload-placeholder">
                    <span className="tr-01100-upload-icon">📷</span>
                    <span>Click to upload cover image</span>
                  </div>
                )}
              </label>
            </div>
          </section>

          {/* Form Actions */}
          <div className="tr-01100-form-actions">
            <button
              type="button"
              className="tr-01100-btn-secondary"
              onClick={() => navigate('/admin/tournaments')}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="tr-01100-btn-primary" disabled={saving}>
              {saving ? 'Saving...' : mode === 'create' ? 'Create Tournament' : 'Update Tournament'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TournamentForm;