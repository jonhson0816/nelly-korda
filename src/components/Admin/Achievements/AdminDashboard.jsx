import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import AdminAchievementForm from '../Achievements/AdminAchievementForm';
import {
  getAchievements,
  deleteAchievement,
  getAchievementStats,
} from '../../../services/achievementService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats();
    } else if (activeTab === 'achievements') {
      fetchAchievements();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getAchievementStats();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const data = await getAchievements({ limit: 100 });
      setAchievements(data.achievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this achievement?')) {
      return;
    }

    try {
      await deleteAchievement(id);
      alert('Achievement deleted successfully!');
      fetchAchievements();
    } catch (error) {
      alert('Error deleting achievement: ' + error.message);
    }
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setEditingAchievement(null);
    fetchAchievements();
    fetchStats();
    alert('Achievement saved successfully!');
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="ach-5001-admin-dashboard">
      <div className="ach-5001-admin-header">
        <div className="ach-5001-admin-header-content">
          <h1>🔧 Admin Dashboard</h1>
          <p>Manage achievements, view statistics, and control content</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="ach-5001-admin-tabs">
        <button
          className={`ach-5001-admin-tab ${activeTab === 'overview' ? 'ach-5001-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`ach-5001-admin-tab ${activeTab === 'achievements' ? 'ach-5001-active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          🏆 Achievements
        </button>
        <button
          className={`ach-5001-admin-tab ${activeTab === 'settings' ? 'ach-5001-active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      <div className="ach-5001-admin-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="ach-5001-admin-overview">
            <h2>Statistics Overview</h2>

            {loading ? (
              <div className="ach-5001-loading-spinner">Loading...</div>
            ) : stats ? (
              <>
                <div className="ach-5001-stats-grid">
                  <div className="ach-5001-stat-card">
                    <div className="ach-5001-stat-icon">🏆</div>
                    <div className="ach-5001-stat-value">{stats.total}</div>
                    <div className="ach-5001-stat-label">Total Achievements</div>
                  </div>
                  <div className="ach-5001-stat-card ach-5001-highlight">
                    <div className="ach-5001-stat-icon">⭐</div>
                    <div className="ach-5001-stat-value">{stats.majors}</div>
                    <div className="ach-5001-stat-label">Major Championships</div>
                  </div>
                  <div className="ach-5001-stat-card">
                    <div className="ach-5001-stat-icon">🎖️</div>
                    <div className="ach-5001-stat-value">{stats.tournaments}</div>
                    <div className="ach-5001-stat-label">Tournament Wins</div>
                  </div>
                  <div className="ach-5001-stat-card">
                    <div className="ach-5001-stat-icon">🏅</div>
                    <div className="ach-5001-stat-value">{stats.awards}</div>
                    <div className="ach-5001-stat-label">Awards</div>
                  </div>
                </div>

                <div className="ach-5001-stats-details">
                  <div className="ach-5001-stats-section">
                    <h3>By Year</h3>
                    <div className="ach-5001-stats-list">
                      {stats.byYear?.map((item) => (
                        <div key={item._id} className="ach-5001-stats-item">
                          <span className="ach-5001-stats-item-label">{item._id}</span>
                          <span className="ach-5001-stats-item-value">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="ach-5001-stats-section">
                    <h3>By Category</h3>
                    <div className="ach-5001-stats-list">
                      {stats.byCategory?.map((item) => (
                        <div key={item._id} className="ach-5001-stats-item">
                          <span className="ach-5001-stats-item-label">{item._id}</span>
                          <span className="ach-5001-stats-item-value">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p>No statistics available</p>
            )}
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="ach-5001-admin-achievements">
            <div className="ach-5001-admin-section-header">
              <h2>Manage Achievements</h2>
              <button
                className="ach-5001-btn-create"
                onClick={() => setShowCreateForm(true)}
              >
                + Create Achievement
              </button>
            </div>

            {showCreateForm && (
              <div className="ach-5001-form-modal">
                <AdminAchievementForm
                  onSuccess={handleFormSuccess}
                  onCancel={() => setShowCreateForm(false)}
                />
              </div>
            )}

            {editingAchievement && (
              <div className="ach-5001-form-modal">
                <AdminAchievementForm
                  achievement={editingAchievement}
                  onSuccess={handleFormSuccess}
                  onCancel={() => setEditingAchievement(null)}
                />
              </div>
            )}

            {loading ? (
              <div className="ach-5001-loading-spinner">Loading achievements...</div>
            ) : (
              <div className="ach-5001-achievements-table">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Year</th>
                      <th>Status</th>
                      <th>Views</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {achievements.map((achievement) => (
                      <tr key={achievement._id}>
                        <td>
                          <div className="ach-5001-table-title">
                            <span className="ach-5001-table-icon">{achievement.icon}</span>
                            <span>{achievement.title}</span>
                          </div>
                        </td>
                        <td>{achievement.category}</td>
                        <td>{achievement.year}</td>
                        <td>
                          <span
                            className={`ach-5001-status-badge ${
                              achievement.isPublished ? 'ach-5001-published' : 'ach-5001-draft'
                            }`}
                          >
                            {achievement.isPublished ? '✓ Published' : '✗ Draft'}
                          </span>
                          {achievement.isFeatured && (
                            <span className="ach-5001-status-badge ach-5001-featured">Featured</span>
                          )}
                          {achievement.isMajor && (
                            <span className="ach-5001-status-badge ach-5001-major">Major</span>
                          )}
                        </td>
                        <td>{achievement.views || 0}</td>
                        <td>
                          <div className="ach-5001-table-actions">
                            <button
                              className="ach-5001-btn-edit"
                              onClick={() => setEditingAchievement(achievement)}
                            >
                              Edit
                            </button>
                            <button
                              className="ach-5001-btn-delete"
                              onClick={() => handleDelete(achievement._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {achievements.length === 0 && (
                  <div className="ach-5001-empty-state">
                    <p>No achievements yet. Create your first achievement!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="ach-5001-admin-settings">
            <h2>Admin Settings</h2>
            <div className="ach-5001-settings-section">
              <h3>Quick Actions</h3>
              <div className="ach-5001-quick-actions">
                <button
                  className="ach-5001-action-btn"
                  onClick={() => navigate('/achievements')}
                >
                  👁️ View Public Page
                </button>
                <button
                  className="ach-5001-action-btn"
                  onClick={() => {
                    setActiveTab('achievements');
                    setShowCreateForm(true);
                  }}
                >
                  ➕ Create New Achievement
                </button>
                <button className="ach-5001-action-btn" onClick={fetchStats}>
                  🔄 Refresh Statistics
                </button>
              </div>
            </div>

            <div className="ach-5001-settings-section">
              <h3>Admin Information</h3>
              <div className="ach-5001-info-box">
                <p>
                  <strong>Logged in as:</strong> {user?.firstName} {user?.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {user?.email}
                </p>
                <p>
                  <strong>Role:</strong> Administrator
                </p>
              </div>
            </div>

            <div className="ach-5001-settings-section">
              <h3>System Information</h3>
              <div className="ach-5001-info-box">
                <p>
                  <strong>Backend API:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}
                </p>
                <p>
                  <strong>Environment:</strong> {process.env.NODE_ENV || 'development'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;