import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import tournamentService from '../../../services/tournamentService';
import './AdminTournamentDashboard.css';

const AdminTournamentDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, tournament: null });
  const [successMessage, setSuccessMessage] = useState('');

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    year: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetchTournaments();
  }, [isAdmin, navigate, filters]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const data = await tournamentService.getTournaments({
        ...filters,
        limit: 100, // Get all for admin view
      });
      setTournaments(data.tournaments);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch tournaments');
      setLoading(false);
    }
  };

  const handleDelete = async (tournament) => {
    setDeleteModal({ show: true, tournament });
  };

  const confirmDelete = async () => {
    try {
      await tournamentService.deleteTournament(deleteModal.tournament._id);
      setSuccessMessage('Tournament deleted successfully');
      setDeleteModal({ show: false, tournament: null });
      fetchTournaments();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete tournament');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: { class: 'status-upcoming', label: 'Upcoming' },
      ongoing: { class: 'status-ongoing', label: 'Ongoing' },
      completed: { class: 'status-completed', label: 'Completed' },
      cancelled: { class: 'status-cancelled', label: 'Cancelled' },
    };
    return badges[status] || badges.upcoming;
  };

  if (loading) {
    return (
      <div className="admin-tournament-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading tournaments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-tournament-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <h1>Tournament Management</h1>
          <button
            className="btn-primary"
            onClick={() => navigate('/admin/tournaments/create')}
          >
            + Create New Tournament
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="success-banner">
          <span>✓</span> {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <span>⚠</span> {error}
        </div>
      )}

      {/* Filters */}
      <div className="admin-filters">
        <div className="filter-group">
          <label>Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Type</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="Major">Major</option>
            <option value="LPGA Tour">LPGA Tour</option>
            <option value="International">International</option>
            <option value="Exhibition">Exhibition</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Year</label>
          <select
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          >
            {[...Array(5)].map((_, i) => {
              const year = new Date().getFullYear() - i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
        </div>

        <button className="btn-secondary" onClick={fetchTournaments}>
          Refresh
        </button>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-box">
          <h3>{tournaments.length}</h3>
          <p>Total Tournaments</p>
        </div>
        <div className="stat-box">
          <h3>{tournaments.filter(t => t.status === 'upcoming').length}</h3>
          <p>Upcoming</p>
        </div>
        <div className="stat-box">
          <h3>{tournaments.filter(t => t.performance?.participated).length}</h3>
          <p>Nelly Participated</p>
        </div>
        <div className="stat-box">
          <h3>{tournaments.filter(t => t.isFeatured).length}</h3>
          <p>Featured</p>
        </div>
      </div>

      {/* Tournaments Table */}
      <div className="tournaments-table-container">
        <table className="tournaments-table">
          <thead>
            <tr>
              <th>Tournament</th>
              <th>Type</th>
              <th>Location</th>
              <th>Dates</th>
              <th>Status</th>
              <th>Featured</th>
              <th>Participated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  No tournaments found. Create your first tournament!
                </td>
              </tr>
            ) : (
              tournaments.map((tournament) => (
                <tr key={tournament._id}>
                  <td>
                    <div className="tournament-cell">
                      {tournament.coverImage?.url && (
                        <img
                          src={tournament.coverImage.url}
                          alt={tournament.name}
                          className="tournament-thumbnail"
                        />
                      )}
                      <div>
                        <strong>{tournament.name}</strong>
                        {tournament.performance?.position && (
                          <div className="position-badge">
                            Position: #{tournament.performance.position}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{tournament.type}</td>
                  <td>
                    {tournament.location.city}, {tournament.location.country}
                  </td>
                  <td>
                    <div className="date-cell">
                      <div>{formatDate(tournament.startDate)}</div>
                      <div className="text-muted">
                        to {formatDate(tournament.endDate)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadge(tournament.status).class}`}>
                      {getStatusBadge(tournament.status).label}
                    </span>
                  </td>
                  <td className="text-center">
                    {tournament.isFeatured ? '⭐' : '-'}
                  </td>
                  <td className="text-center">
                    {tournament.performance?.participated ? '✓' : '-'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-view"
                        onClick={() => navigate(`/tournaments/${tournament._id}`)}
                        title="View"
                      >
                        👁️
                      </button>
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => navigate(`/admin/tournaments/edit/${tournament._id}`)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon btn-performance"
                        onClick={() => navigate(`/admin/tournaments/performance/${tournament._id}`)}
                        title="Update Performance"
                      >
                        📊
                      </button>
                      <button
                        className="btn-icon btn-gallery"
                        onClick={() => navigate(`/admin/tournaments/gallery/${tournament._id}`)}
                        title="Manage Gallery"
                      >
                        🖼️
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(tournament)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ show: false, tournament: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Delete</h2>
            <p>
              Are you sure you want to delete <strong>{deleteModal.tournament?.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setDeleteModal({ show: false, tournament: null })}
              >
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmDelete}>
                Delete Tournament
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTournamentDashboard;