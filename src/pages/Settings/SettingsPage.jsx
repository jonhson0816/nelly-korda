import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';
import axios from 'axios';
import './SettingsPage.css';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('privacy');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);

  
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSettings();
    if (activeTab === 'blocking') fetchBlockedUsers();
    if (activeTab === 'security') fetchActiveSessions();
  }, [activeTab]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data.settings);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoading(false);
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/settings/blocked`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlockedUsers(response.data.blockedUsers);
    } catch (error) {
      console.error('Error fetching blocked users:', error);
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const response = await axios.get(`${API_URL}/settings/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveSessions(response.data.sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handlePrivacyUpdate = async (field, value) => {
    try {
      const updatedPrivacy = { ...settings.privacy, [field]: value };
      
      await axios.put(
        `${API_URL}/settings/privacy`,
        updatedPrivacy,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSettings(prev => ({
        ...prev,
        privacy: updatedPrivacy
      }));
    } catch (error) {
      console.error('Error updating privacy:', error);
      alert('Failed to update privacy settings');
    }
  };

  const handleNotificationUpdate = async (field, value) => {
    try {
      const updatedNotifications = { ...settings.notifications, [field]: value };
      
      await axios.put(
        `${API_URL}/settings/notifications`,
        updatedNotifications,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSettings(prev => ({
        ...prev,
        notifications: updatedNotifications
      }));
    } catch (error) {
      console.error('Error updating notifications:', error);
      alert('Failed to update notification settings');
    }
  };

  const handleSecurityUpdate = async (field, value) => {
    try {
      await axios.put(
        `${API_URL}/settings/security`,
        { [field]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSettings(prev => ({
        ...prev,
        security: { ...prev.security, [field]: value }
      }));

      alert('Security setting updated successfully');
    } catch (error) {
      console.error('Error updating security:', error);
      alert('Failed to update security settings');
    }
  };

  const handleUnblockUser = async (userId) => {
    if (!confirm('Are you sure you want to unblock this user?')) return;

    try {
      await axios.delete(
        `${API_URL}/settings/block/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBlockedUsers(prev => prev.filter(blocked => blocked.user._id !== userId));
      alert('User unblocked successfully');
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('Failed to unblock user');
    }
  };

  const handleRemoveSession = async (sessionId) => {
    if (!confirm('Remove this session?')) return;

    try {
      await axios.delete(
        `${API_URL}/settings/sessions/${sessionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setActiveSessions(prev => prev.filter(session => session._id !== sessionId));
      alert('Session removed successfully');
    } catch (error) {
      console.error('Error removing session:', error);
      alert('Failed to remove session');
    }
  };

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* HEADER */}
        <div className="settings-header">
          <button onClick={() => navigate(-1)} className="back-button">
            ← Back
          </button>
          <h1>Settings</h1>
        </div>

        {/* NAVIGATION */}
        <div className="settings-navigation">
          <button
            className={`settings-nav-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <span className="nav-icon">🔒</span>
            Privacy
          </button>
          <button
            className={`settings-nav-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <span className="nav-icon">🛡️</span>
            Security
          </button>
          <button
            className={`settings-nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <span className="nav-icon">🔔</span>
            Notifications
          </button>
          <button
            className={`settings-nav-btn ${activeTab === 'blocking' ? 'active' : ''}`}
            onClick={() => setActiveTab('blocking')}
          >
            <span className="nav-icon">🚫</span>
            Blocking
          </button>
          <button
            className={`settings-nav-btn ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <span className="nav-icon">⚙️</span>
            Account
          </button>
        </div>

        {/* CONTENT */}
        <div className="settings-content">
          {/* PRIVACY TAB */}
          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h2>Privacy Settings</h2>
              <p className="section-description">
                Control who can see your content and interact with you
              </p>

              <div className="settings-group">
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Profile Visibility</h3>
                    <p>Who can see your profile</p>
                  </div>
                  <select
                    value={settings?.privacy?.profileVisibility || 'public'}
                    onChange={(e) => handlePrivacyUpdate('profileVisibility', e.target.value)}
                    className="setting-select"
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Who can see my posts</h3>
                    <p>Control post visibility</p>
                  </div>
                  <select
                    value={settings?.privacy?.whoCanSeeMyPosts || 'public'}
                    onChange={(e) => handlePrivacyUpdate('whoCanSeeMyPosts', e.target.value)}
                    className="setting-select"
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends</option>
                    <option value="only_me">Only Me</option>
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Who can send me messages</h3>
                    <p>Control direct messaging</p>
                  </div>
                  <select
                    value={settings?.privacy?.whoCanSendMeMessages || 'friends'}
                    onChange={(e) => handlePrivacyUpdate('whoCanSendMeMessages', e.target.value)}
                    className="setting-select"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="friends">Friends</option>
                    <option value="no_one">No One</option>
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Who can tag me</h3>
                    <p>Control photo and post tagging</p>
                  </div>
                  <select
                    value={settings?.privacy?.whoCanTagMe || 'friends'}
                    onChange={(e) => handlePrivacyUpdate('whoCanTagMe', e.target.value)}
                    className="setting-select"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="friends">Friends</option>
                    <option value="no_one">No One</option>
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Show online status</h3>
                    <p>Let others see when you're active</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings?.privacy?.showOnlineStatus || false}
                      onChange={(e) => handlePrivacyUpdate('showOnlineStatus', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Show read receipts</h3>
                    <p>Show when you've read messages</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings?.privacy?.showReadReceipts || false}
                      onChange={(e) => handlePrivacyUpdate('showReadReceipts', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Show email address</h3>
                    <p>Display your email on profile</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings?.privacy?.showEmail || false}
                      onChange={(e) => handlePrivacyUpdate('showEmail', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Show location</h3>
                    <p>Display your location on profile</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings?.privacy?.showLocation !== false}
                      onChange={(e) => handlePrivacyUpdate('showLocation', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security & Login</h2>
              <p className="section-description">
                Manage your account security settings
              </p>

              <div className="settings-group">
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Two-Factor Authentication</h3>
                    <p>Add an extra layer of security</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings?.security?.twoFactorEnabled || false}
                      onChange={(e) => handleSecurityUpdate('twoFactorEnabled', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Login Alerts</h3>
                    <p>Get notified of unrecognized logins</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings?.security?.loginAlerts !== false}
                      onChange={(e) => handleSecurityUpdate('loginAlerts', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Login Approvals</h3>
                    <p>Approve new device logins</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings?.security?.loginApprovals || false}
                      onChange={(e) => handleSecurityUpdate('loginApprovals', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="sessions-section">
                <h3>Active Sessions</h3>
                <p>Where you're logged in</p>
                {activeSessions.length > 0 ? (
                  <div className="sessions-list">
                    {activeSessions.map((session) => (
                      <div key={session._id} className="session-item">
                        <div className="session-info">
                          <h4>{session.deviceName || 'Unknown Device'}</h4>
                          <p>{session.location || 'Unknown Location'}</p>
                          <span className="session-time">
                            {new Date(session.loginTime).toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveSession(session._id)}
                          className="btn-remove"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">No active sessions</p>
                )}
              </div>

              <div className="password-section">
                <button className="btn-primary" onClick={() => navigate('/change-password')}>
                  Change Password
                </button>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Settings</h2>
              <p className="section-description">
                Choose what notifications you receive
              </p>

              <div className="settings-group">
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Email Notifications</h3>
                    <p>Receive updates via email</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings?.notifications?.emailNotifications !== false}
                      onChange={(e) => handleNotificationUpdate('emailNotifications', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Push Notifications</h3>
                    <p>Receive push notifications</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings?.notifications?.pushNotifications !== false}
                      onChange={(e) => handleNotificationUpdate('pushNotifications', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Likes and Reactions</h3>
                    <p>When someone reacts to your posts</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings?.notifications?.likesAndReactions !== false}
                      onChange={(e) => handleNotificationUpdate('likesAndReactions', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Comments</h3>
                    <p>When someone comments on your posts</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings?.notifications?.comments !== false}
                      onChange={(e) => handleNotificationUpdate('comments', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>New Followers</h3>
                    <p>When someone follows you</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings?.notifications?.newFollowers !== false}
                      onChange={(e) => handleNotificationUpdate('newFollowers', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Messages</h3>
                    <p>When you receive new messages</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings?.notifications?.messages !== false}
                      onChange={(e) => handleNotificationUpdate('messages', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Event Reminders</h3>
                    <p>Reminders for upcoming events</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings?.notifications?.eventReminders !== false}
                      onChange={(e) => handleNotificationUpdate('eventReminders', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Weekly Digest</h3>
                    <p>Weekly summary of activity</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings?.notifications?.weeklyDigest || false}
                      onChange={(e) => handleNotificationUpdate('weeklyDigest', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* BLOCKING TAB */}
          {activeTab === 'blocking' && (
            <div className="settings-section">
              <h2>Blocked Users</h2>
              <p className="section-description">
                Manage users you've blocked
              </p>

              {blockedUsers.length > 0 ? (
                <div className="blocked-users-list">
                  {blockedUsers.map((blocked) => (
                    <div key={blocked.user._id} className="blocked-user-item">
                      <div className="blocked-user-info">
                        <img
                          src={blocked.user.avatar?.url || `https://ui-avatars.com/api/?name=${blocked.user.firstName}+${blocked.user.lastName}`}
                          alt={blocked.user.firstName}
                          className="blocked-user-avatar"
                        />
                        <div>
                          <h4>{blocked.user.firstName} {blocked.user.lastName}</h4>
                          <p>@{blocked.user.username}</p>
                          <span className="blocked-date">
                            Blocked {new Date(blocked.blockedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnblockUser(blocked.user._id)}
                        className="btn-unblock"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">🚫</span>
                  <p>You haven't blocked anyone</p>
                </div>
              )}
            </div>
          )}

          {/* ACCOUNT TAB */}
          {activeTab === 'account' && (
            <div className="settings-section">
              <h2>Account Settings</h2>
              <p className="section-description">
                Manage your account preferences
              </p>

              <div className="settings-group">
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Language</h3>
                    <p>Choose your preferred language</p>
                  </div>
                  <select className="setting-select">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Autoplay Videos</h3>
                    <p>Automatically play videos in feed</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="danger-zone">
                <h3>Danger Zone</h3>
                <p>Permanent actions that cannot be undone</p>
                <button className="btn-danger" onClick={() => navigate('/deactivate-account')}>
                  Deactivate Account
                </button>
                <button className="btn-danger" onClick={() => navigate('/delete-account')}>
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;