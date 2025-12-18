// AchievementsPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AchievementCard from '../../components/AchievementCard/AchievementCard';
import {
  getAchievements,
  getAchievementStats,
  getFeaturedAchievements,
} from '../../services/achievementService';
import './AchievementsPage.css';

const AchievementsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [achievements, setAchievements] = useState([]);
  const [featuredAchievements, setFeaturedAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    year: searchParams.get('year') || '',
    major: searchParams.get('major') === 'true',
    featured: searchParams.get('featured') === 'true',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'tournament_win', label: 'Tournament Win' },
    { value: 'major_championship', label: 'Major Championship' },
    { value: 'ranking', label: 'Ranking' },
    { value: 'record', label: 'Record' },
    { value: 'award', label: 'Award' },
    { value: 'milestone', label: 'Milestone' },
    { value: 'endorsement', label: 'Endorsement' },
    { value: 'charity', label: 'Charity' },
  ];

  // Fetch achievements
  useEffect(() => {
    fetchAchievements();
  }, [filters, pagination.page]);

  // Fetch featured and stats on mount
  useEffect(() => {
    fetchFeatured();
    fetchStats();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === false) {
          delete params[key];
        }
      });

      const data = await getAchievements(params);
      setAchievements(data.achievements);
      setPagination((prev) => ({
        ...prev,
        total: data.total,
        pages: data.pages,
      }));
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load achievements');
      console.error('Error fetching achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatured = async () => {
    try {
      const data = await getFeaturedAchievements(3);
      setFeaturedAchievements(data.achievements);
    } catch (err) {
      console.error('Error fetching featured:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getAchievementStats();
      setStats(data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== '' && v !== false) {
        params.set(k, v);
      }
    });
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      year: '',
      major: false,
      featured: false,
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSearchParams({});
  };

  // Generate year options (last 25 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = [{ value: '', label: 'All Years' }];
  for (let i = 0; i < 25; i++) {
    const year = currentYear - i;
    yearOptions.push({ value: year, label: year });
  }

  return (
  <div className="ach-0100-achievements-page">
    {/* Hero Section */}
    <section className="ach-0100-achievements-hero">
      <div className="ach-0100-hero-content">
        <h1 className="ach-0100-hero-title">
          <span className="ach-0100-title-icon">🏆</span>
          Achievements
        </h1>
        <p className="ach-0100-hero-subtitle">
          Celebrating excellence, dedication, and the pursuit of greatness
        </p>
      </div>
    </section>

    {/* Stats Overview */}
    {stats && (
      <section className="ach-0100-stats-overview">
        <div className="ach-0100-container">
          <div className="ach-0100-stats-grid">
            <div className="ach-0100-stat-card">
              <div className="ach-0100-stat-icon">🏆</div>
              <div className="ach-0100-stat-number">{stats.total}</div>
              <div className="ach-0100-stat-label">Total Achievements</div>
            </div>
            <div className="ach-0100-stat-card ach-0100-highlight">
              <div className="ach-0100-stat-icon">⭐</div>
              <div className="ach-0100-stat-number">{stats.majors}</div>
              <div className="ach-0100-stat-label">Major Championships</div>
            </div>
            <div className="ach-0100-stat-card">
              <div className="ach-0100-stat-icon">🎖️</div>
              <div className="ach-0100-stat-number">{stats.tournaments}</div>
              <div className="ach-0100-stat-label">Tournament Wins</div>
            </div>
            <div className="ach-0100-stat-card">
              <div className="ach-0100-stat-icon">🏅</div>
              <div className="ach-0100-stat-number">{stats.awards}</div>
              <div className="ach-0100-stat-label">Awards</div>
            </div>
          </div>
        </div>
      </section>
    )}

    {/* Featured Achievements */}
    {featuredAchievements.length > 0 && (
      <section className="ach-0100-featured-section">
        <div className="ach-0100-container">
          <h2 className="ach-0100-section-title">
            <span className="ach-0100-title-icon">🔥</span>
            Featured Achievements
          </h2>
          <div className="ach-0100-featured-grid">
            {featuredAchievements.map((achievement) => (
              <AchievementCard key={achievement._id} achievement={achievement} />
            ))}
          </div>
        </div>
      </section>
    )}

    {/* Main Content */}
    <section className="ach-0100-achievements-content">
      <div className="ach-0100-container">
        {/* Filters */}
        <div className="ach-0100-filters-section">
          <div className="ach-0100-filters-header">
            <h3 className="ach-0100-filters-title">Filter Achievements</h3>
            <button className="ach-0100-clear-filters-btn" onClick={clearFilters}>
              Clear All
            </button>
          </div>

          <div className="ach-0100-filters-grid">
            {/* Category Filter */}
            <div className="ach-0100-filter-group">
              <label htmlFor="category-filter">Category</label>
              <select
                id="category-filter"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="ach-0100-filter-select"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="ach-0100-filter-group">
              <label htmlFor="year-filter">Year</label>
              <select
                id="year-filter"
                value={filters.year}
                onChange={(e) => handleFilterChange("year", e.target.value)}
                className="ach-0100-filter-select"
              >
                {yearOptions.map((year) => (
                  <option key={year.value} value={year.value}>
                    {year.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle Filters */}
            <div className="ach-0100-filter-group ach-0100-toggle-filters">
              <label className="ach-0100-toggle-label">
                <input
                  type="checkbox"
                  checked={filters.major}
                  onChange={(e) => handleFilterChange("major", e.target.checked)}
                />
                <span>Major Championships Only</span>
              </label>
              <label className="ach-0100-toggle-label">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => handleFilterChange("featured", e.target.checked)}
                />
                <span>Featured Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="ach-0100-loading-state">
            <div className="ach-0100-spinner"></div>
            <p>Loading achievements...</p>
          </div>
        ) : error ? (
          <div className="ach-0100-error-state">
            <span className="ach-0100-error-icon">⚠️</span>
            <p>{error}</p>
            <button onClick={fetchAchievements} className="ach-0100-retry-btn">
              Try Again
            </button>
          </div>
        ) : achievements.length === 0 ? (
          <div className="ach-0100-empty-state">
            <span className="ach-0100-empty-icon">🔍</span>
            <h3>No achievements found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="ach-0100-results-header">
              <p className="ach-0100-results-count">
                Showing {achievements.length} of {pagination.total} achievements
              </p>
            </div>

            <div className="ach-0100-achievements-grid">
              {achievements.map((achievement) => (
                <AchievementCard key={achievement._id} achievement={achievement} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="ach-0100-pagination">
                <button
                  className="ach-0100-pagination-btn"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  ← Previous
                </button>

                <div className="ach-0100-pagination-pages">
                  {[...Array(pagination.pages)].map((_, index) => (
                    <button
                      key={index}
                      className={`ach-0100-pagination-page ${
                        pagination.page === index + 1 ? "ach-0100-active" : ""
                      }`}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  className="ach-0100-pagination-btn"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  </div>
);
};

export default AchievementsPage;