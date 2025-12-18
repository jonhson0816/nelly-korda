import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tournamentService from '../../services/tournamentService';
import './TournamentsPage.css';

const TournamentsPage = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statistics, setStatistics] = useState({
    total: 0,
    wins: 0,
    topTen: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    year: '',
    participated: ''
  });

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'upcoming': 'tour-0111-status-upcoming',
      'ongoing': 'tour-0111-status-ongoing',
      'completed': 'tour-0111-status-completed',
      'cancelled': 'tour-0111-status-cancelled'
    };
    return statusMap[status] || '';
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch tournaments
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching tournaments with filters:', filters); // DEBUG
        
        // Build query parameters
        const params = {
          page: currentPage,
          limit: 12,
          status: filters.status,
          type: filters.type,
          year: filters.year,
          participated: filters.participated
        };

        // Remove empty params
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null) {
            delete params[key];
          }
        });

        console.log('API params:', params); // DEBUG

        // Call the tournament service
        const data = await tournamentService.getTournaments(params);
        
        console.log('Tournaments response:', data); // DEBUG
        
        // Set tournaments data
        setTournaments(data.tournaments || []);
        setTotalPages(data.pages || 1);

        // Fetch statistics for the selected year (or all time if year is empty)
        try {
          const statsData = await tournamentService.getStatistics(filters.year || '');
          console.log('Statistics response:', statsData); // DEBUG
          setStatistics(statsData.stats || {
            total: 0,
            wins: 0,
            topTen: 0
          });
        } catch (statsErr) {
          console.log('Statistics not available:', statsErr);
          // Set default stats if endpoint fails - calculate from current tournaments that Nelly participated in
          const participatedTournaments = data.tournaments?.filter(t => t.performance?.participated) || [];
          setStatistics({
            total: participatedTournaments.length,
            wins: participatedTournaments.filter(t => t.performance?.position === 1).length,
            topTen: participatedTournaments.filter(t => t.performance?.position <= 10).length
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tournaments:', err);
        setError(err.message || 'Failed to fetch tournaments');
        setLoading(false);
      }
    };

    fetchTournaments();
  }, [currentPage, filters]);

  // Render statistics
  const renderStatistics = () => {
    return (
      <div className="tour-0111-statistics-cards">
        <div className="tour-0111-stat-card">
          <div className="tour-0111-stat-icon">🏆</div>
          <div className="tour-0111-stat-content">
            <h3>{statistics.total}</h3>
            <p>Tournaments Played</p>
          </div>
        </div>
        <div className="tour-0111-stat-card">
          <div className="tour-0111-stat-icon">🥇</div>
          <div className="tour-0111-stat-content">
            <h3>{statistics.wins}</h3>
            <p>Victories</p>
          </div>
        </div>
        <div className="tour-0111-stat-card">
          <div className="tour-0111-stat-icon">⭐</div>
          <div className="tour-0111-stat-content">
            <h3>{statistics.topTen}</h3>
            <p>Top 10 Finishes</p>
          </div>
        </div>
        <div className="tour-0111-stat-card">
          <div className="tour-0111-stat-icon">📊</div>
          <div className="tour-0111-stat-content">
            <h3>{statistics.total > 0 ? ((statistics.wins / statistics.total) * 100).toFixed(1) : 0}%</h3>
            <p>Win Rate</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading && tournaments.length === 0) {
    return (
      <div className="tour-0111-tournaments-page">
        <div className="tour-0111-loading-container">
          <div className="tour-0111-spinner"></div>
          <p>Loading tournaments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tour-0111-tournaments-page">
      {/* Hero Section */}
      <div className="tour-0111-tournaments-hero">
        <div className="tour-0111-hero-content">
          <h1>Nelly Korda's Tournaments</h1>
          <p>Follow Nelly's journey through professional golf tournaments worldwide</p>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="tour-0111-tournaments-container">
        <section className="tour-0111-statistics-section">
          <h2>Season Statistics - {filters.year || 'All Time'}</h2>
          {renderStatistics()}
        </section>

        {/* Filters Section */}
        <section className="tour-0111-filters-section">
          <div className="tour-0111-filters-header">
            <h2>All Tournaments</h2>
            <div className="tour-0111-filters-controls">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="tour-0111-filter-select"
              >
                <option value="">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="tour-0111-filter-select"
              >
                <option value="">All Types</option>
                <option value="Major">Major</option>
                <option value="LPGA Tour">LPGA Tour</option>
                <option value="International">International</option>
                <option value="Exhibition">Exhibition</option>
                <option value="Other">Other</option>
              </select>

              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="tour-0111-filter-select"
              >
                <option value="">All Years</option>
                {[...Array(7)].map((_, i) => {
                  const year = new Date().getFullYear() + 2 - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>

              <select
                value={filters.participated}
                onChange={(e) => handleFilterChange('participated', e.target.value)}
                className="tour-0111-filter-select"
              >
                <option value="">All Tournaments</option>
                <option value="true">Nelly Participated</option>
              </select>
            </div>
          </div>
        </section>

        {/* Error State */}
        {error && (
          <div className="tour-0111-error-message">
            <p>⚠️ {error}</p>
          </div>
        )}

        {/* Tournaments Grid */}
        <section className="tour-0111-tournaments-grid">
          {tournaments.length === 0 ? (
            <div className="tour-0111-no-tournaments">
              <p>No tournaments found matching your filters.</p>
              {filters.status || filters.type || filters.year || filters.participated ? (
                <button 
                  onClick={() => setFilters({
                    status: '',
                    type: '',
                    year: '',
                    participated: ''
                  })}
                  className="tour-0111-filter-select"
                  style={{ marginTop: '10px' }}
                >
                  Clear Filters
                </button>
              ) : null}
            </div>
          ) : (
            tournaments.map((tournament) => (
              <div
                key={tournament._id}
                className={`tour-0111-tournament-card ${tournament.isFeatured ? 'tour-0111-featured' : ''}`}
                onClick={() => navigate(`/tournaments/${tournament._id}`)}
              >
                {tournament.isFeatured && (
                  <div className="tour-0111-featured-badge">Featured</div>
                )}
                
                <div className="tour-0111-tournament-image">
                  {tournament.coverImage?.url ? (
                    <img src={tournament.coverImage.url} alt={tournament.name} />
                  ) : (
                    <div className="tour-0111-placeholder-image">
                      <span>🏌️‍♀️</span>
                    </div>
                  )}
                  <div className={`tour-0111-status-badge ${getStatusBadgeClass(tournament.status)}`}>
                    {tournament.status}
                  </div>
                </div>

                <div className="tour-0111-tournament-content">
                  <div className="tour-0111-tournament-header">
                    <h3>{tournament.name}</h3>
                    <span className="tour-0111-tournament-type">{tournament.type}</span>
                  </div>

                  <div className="tour-0111-tournament-location">
                    <span className="tour-0111-icon">📍</span>
                    <span>{tournament.location.venue}, {tournament.location.city}</span>
                  </div>

                  <div className="tour-0111-tournament-dates">
                    <span className="tour-0111-icon">📅</span>
                    <span>{formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}</span>
                  </div>

                  {tournament.performance?.participated && (
                    <div className="tour-0111-tournament-performance">
                      <div className="tour-0111-performance-badge">
                        <strong>Position:</strong> #{tournament.performance.position}
                      </div>
                      {tournament.performance.score?.toPar && (
                        <div className="tour-0111-performance-score">
                          Score: {tournament.performance.score.toPar}
                        </div>
                      )}
                    </div>
                  )}

                  {tournament.prizeMoney?.total > 0 && (
                    <div className="tour-0111-tournament-prize">
                      <span className="tour-0111-icon">💰</span>
                      <span>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: tournament.prizeMoney.currency || 'USD',
                          minimumFractionDigits: 0,
                        }).format(tournament.prizeMoney.total)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="tour-0111-pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="tour-0111-pagination-btn"
            >
              Previous
            </button>

            <div className="tour-0111-pagination-numbers">
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`tour-0111-pagination-number ${currentPage === page ? 'tour-0111-active' : ''}`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="tour-0111-pagination-ellipsis">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="tour-0111-pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentsPage;