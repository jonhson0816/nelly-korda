import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StoryRing from '../../components/StoryRing/StoryRing';
import { getAchievements } from '../../services/achievementService';
import tournamentService from '../../services/tournamentService';
import PointsBadgeDisplay from '../../components/PointsBadgeDisplay/PointsBadgeDisplay';
import axios from 'axios';
import './ProfilePage.css';

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  
  // Image error handling
  const [coverImageError, setCoverImageError] = useState(false);
  const [avatarImageError, setAvatarImageError] = useState(false);
  const [stories, setStories] = useState([]);
  
  // Edit states
  const [editData, setEditData] = useState({
    about: '',
    interests: [],
    socialLinks: {
      twitter: '',
      instagram: '',
      facebook: '',
      youtube: '',
      website: ''
    }
  });

  // Settings state
  const [settingsTab, setSettingsTab] = useState('privacy');
  const [privacySettings, setPrivacySettings] = useState({
    showEmail: false,
    showPhone: false,
    showLocation: true,
    showBio: true,
    allowMessages: true
  });

  const API_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  // Working fallback images
  const fallbackCoverPhoto = 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&h=400&fit=crop&q=80';
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${profile?.user?.firstName || 'User'}+${profile?.user?.lastName || ''}&background=random&size=200`;

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const endpoint = username 
        ? `${API_URL}/profiles/${username}`
        : `${API_URL}/profiles/me`;
      
      const response = await axios.get(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      console.log('Profile Response:', response.data); // DEBUG
      console.log('User Posts:', response.data.profile?.userPosts); // DEBUG
      
      // Add this to check comment counts
      response.data.profile?.userPosts?.forEach(post => {
        console.log(`Post ${post._id}: ${post.commentsCount} comments`);
      });
      
      setProfile(response.data.profile);
      setEditData({
        about: response.data.profile.about || '',
        interests: response.data.profile.interests || [],
        socialLinks: response.data.profile.socialLinks || {
          twitter: '',
          instagram: '',
          facebook: '',
          youtube: '',
          website: ''
        }
      });
      setPrivacySettings(response.data.profile.privacySettings || {
        showEmail: false,
        showPhone: false,
        showLocation: true,
        showBio: true,
        allowMessages: true
      });
      
      if (token && !username) {
        setIsOwnProfile(true);
      }
      
      // Fetch user's stories
      try {
        const storiesRes = await axios.get(`${API_URL}/stories`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        // Filter stories for this specific user
        const allStories = storiesRes.data.stories || [];
        const userStories = allStories.filter(
          story => story.author?._id === response.data.profile.user._id || 
                  story.author?.username === response.data.profile.user.username
        );
        
        console.log('User Stories:', userStories); // DEBUG
        setStories(userStories);
      } catch (storiesError) {
        console.log('Stories not available or error fetching:', storiesError);
        setStories([]); // Set empty array if stories fail
      }
      
      // Fetch achievements for ALL users (not just admin)
      try {
        const achievementsRes = await getAchievements({ 
          limit: 6,
          isPublished: true 
        });
        setAchievements(achievementsRes.achievements || []);
      } catch (achievementsError) {
        console.log('Achievements not available or error fetching:', achievementsError);
        setAchievements([]);
      }

      // Fetch tournaments for ALL users
      try {
        const tournamentsRes = await tournamentService.getTournaments({ 
          limit: 6,
          status: 'upcoming'
        });
        setTournaments(tournamentsRes.tournaments || []);
      } catch (tournamentsError) {
        console.log('Tournaments not available or error fetching:', tournamentsError);
        setTournaments([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/profiles/me`,
        editData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setProfile(response.data.profile);
      setIsEditingAbout(false);
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleUpdatePrivacySettings = async () => {
    try {
      await axios.put(
        `${API_URL}/profiles/me`,
        { privacySettings },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert('Privacy settings updated successfully!');
      fetchProfile();
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      alert('Failed to update privacy settings');
    }
  };

  const handleCoverPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('coverPhoto', file);

    try {
      const response = await axios.put(
        `${API_URL}/profiles/me/cover`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setProfile(prev => ({
        ...prev,
        coverPhoto: response.data.coverPhoto
      }));
      
      setCoverImageError(false);
      setUploading(false);
      alert('Cover photo updated successfully!');
      fetchProfile();
    } catch (error) {
      console.error('Error uploading cover photo:', error);
      setUploading(false);
      alert(error.response?.data?.message || 'Failed to upload cover photo');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      await axios.put(
        `${API_URL}/profiles/me/avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setAvatarImageError(false);
      setUploading(false);
      alert('Avatar updated successfully!');
      fetchProfile();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setUploading(false);
      alert(error.response?.data?.message || 'Failed to upload avatar');
    }
  };

  const handleGalleryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/', 'video/'];
    if (!validTypes.some(type => file.type.startsWith(type))) {
      alert('Please select an image or video file');
      return;
    }

    const maxSize = file.type.startsWith('video/') ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File size must be less than ${file.type.startsWith('video/') ? '100' : '10'}MB`);
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('media', file);

    try {
      const response = await axios.post(
        `${API_URL}/profiles/me/gallery`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setProfile(prev => ({
        ...prev,
        gallery: response.data.gallery
      }));
      
      setUploading(false);
      alert('Media added to gallery!');
      fetchProfile();
    } catch (error) {
      console.error('Error uploading to gallery:', error);
      setUploading(false);
      alert(error.response?.data?.message || 'Failed to upload media');
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-not-found">
        <h2>Profile not found</h2>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  // Show Settings Page
  if (showSettings) {
    return (
      <div className="settings-page">
        <div className="settings-container">
          <div className="settings-header">
            <button onClick={() => setShowSettings(false)} style={{ marginBottom: '12px', cursor: 'pointer', background: 'none', border: 'none', fontSize: '24px' }}>
              ← Back to Profile
            </button>
            <h1>Settings</h1>
          </div>

          <div className="settings-nav">
            <button 
              className={`settings-tab ${settingsTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setSettingsTab('privacy')}
            >
              Privacy
            </button>
            <button 
              className={`settings-tab ${settingsTab === 'account' ? 'active' : ''}`}
              onClick={() => setSettingsTab('account')}
            >
              Account
            </button>
            <button 
              className={`settings-tab ${settingsTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setSettingsTab('notifications')}
            >
              Notifications
            </button>
          </div>

          <div className="settings-content">
            {settingsTab === 'privacy' && (
              <>
                <div className="settings-section">
                  <h3>Profile Visibility</h3>
                  <div className="settings-row">
                    <div className="settings-row-info">
                      <h4>Show Email</h4>
                      <p>Allow others to see your email address</p>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={privacySettings.showEmail}
                        onChange={(e) => setPrivacySettings({...privacySettings, showEmail: e.target.checked})}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="settings-row">
                    <div className="settings-row-info">
                      <h4>Show Location</h4>
                      <p>Display your location on your profile</p>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={privacySettings.showLocation}
                        onChange={(e) => setPrivacySettings({...privacySettings, showLocation: e.target.checked})}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="settings-row">
                    <div className="settings-row-info">
                      <h4>Show Bio</h4>
                      <p>Make your bio visible to others</p>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={privacySettings.showBio}
                        onChange={(e) => setPrivacySettings({...privacySettings, showBio: e.target.checked})}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="settings-row">
                    <div className="settings-row-info">
                      <h4>Allow Messages</h4>
                      <p>Let others send you direct messages</p>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={privacySettings.allowMessages}
                        onChange={(e) => setPrivacySettings({...privacySettings, allowMessages: e.target.checked})}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <button className="btn-save" onClick={handleUpdatePrivacySettings}>
                  Save Privacy Settings
                </button>
              </>
            )}

            {settingsTab === 'account' && (
              <div className="settings-section">
                <h3>Account Information</h3>
                <p>Manage your account details and security settings</p>
                <div className="settings-row">
                  <div className="settings-row-info">
                    <h4>Email</h4>
                    <p>{profile.user.email}</p>
                  </div>
                  <button className="btn-secondary">Change</button>
                </div>
                <div className="settings-row">
                  <div className="settings-row-info">
                    <h4>Password</h4>
                    <p>Last changed 30 days ago</p>
                  </div>
                  <button className="btn-secondary">Change</button>
                </div>

                <div className="danger-zone">
                  <h3>Danger Zone</h3>
                  <p style={{ marginBottom: '16px', color: '#666' }}>Once you delete your account, there is no going back.</p>
                  <button className="btn-danger">Delete Account</button>
                </div>
              </div>
            )}

            {settingsTab === 'notifications' && (
              <div className="settings-section">
                <h3>Notification Preferences</h3>
                <div className="settings-row">
                  <div className="settings-row-info">
                    <h4>Email Notifications</h4>
                    <p>Receive email updates about your activity</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="settings-row">
                  <div className="settings-row-info">
                    <h4>Push Notifications</h4>
                    <p>Get push notifications on your device</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const user = profile.user;

  return (
    <div className="profile-page">
      {/* EDIT PROFILE MODAL */}
      {isEditingProfile && (
        <div className="modal-overlay" onClick={() => setIsEditingProfile(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="modal-close" onClick={() => setIsEditingProfile(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>About</label>
                <textarea
                  className="form-textarea"
                  placeholder="Tell us about yourself..."
                  value={editData.about}
                  onChange={(e) => setEditData({...editData, about: e.target.value})}
                  rows="4"
                />
              </div>
              
              <div className="form-group">
                <label>Interests (comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={editData.interests.join(', ')}
                  onChange={(e) => setEditData({
                    ...editData, 
                    interests: e.target.value.split(',').map(i => i.trim())
                  })}
                  placeholder="Golf, Sports, Travel..."
                />
              </div>

              <div className="form-group">
                <label>Instagram</label>
                <input
                  type="text"
                  className="form-input"
                  value={editData.socialLinks.instagram}
                  onChange={(e) => setEditData({
                    ...editData,
                    socialLinks: {...editData.socialLinks, instagram: e.target.value}
                  })}
                  placeholder="https://instagram.com/username"
                />
              </div>

              <div className="form-group">
                <label>Twitter</label>
                <input
                  type="text"
                  className="form-input"
                  value={editData.socialLinks.twitter}
                  onChange={(e) => setEditData({
                    ...editData,
                    socialLinks: {...editData.socialLinks, twitter: e.target.value}
                  })}
                  placeholder="https://twitter.com/username"
                />
              </div>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="text"
                  className="form-input"
                  value={editData.socialLinks.website}
                  onChange={(e) => setEditData({
                    ...editData,
                    socialLinks: {...editData.socialLinks, website: e.target.value}
                  })}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setIsEditingProfile(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleUpdateProfile}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="profile-container">
        {/* COVER PHOTO SECTION */}
        <div className="profile-cover-section">
          <div className="cover-photo">
            <img 
              src={coverImageError ? fallbackCoverPhoto : (profile.coverPhoto?.url || fallbackCoverPhoto)}
              alt="Cover"
              onError={() => setCoverImageError(true)}
            />
            {isOwnProfile && (
              <label 
                className="edit-cover-btn" 
                style={{ 
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  pointerEvents: uploading ? 'none' : 'auto'
                }}
                htmlFor="cover-photo-input"
              >
                <span className="icon">{uploading ? '⏳' : '📷'}</span>
                {uploading ? 'Uploading...' : 'Edit Cover Photo'}
              </label>
            )}
            <input 
              id="cover-photo-input"
              type="file" 
              accept="image/*" 
              onChange={handleCoverPhotoUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </div>

          {/* PROFILE INFO BAR */}
          <div className="profile-info-bar">
            <div className="profile-info-left">
              {/* Profile Avatar with Story Ring */}
              <div className="profile-avatar-large">
                <StoryRing
                  avatarUrl={user.avatar?.url}
                  userName={`${user.firstName} ${user.lastName}`}
                  hasStory={stories.length > 0}
                  storyId={stories[0]?._id}
                  size="profile"
                  onClick={() => {
                    if (stories.length > 0) {
                      navigate(`/story/${stories[0]._id}`);
                    }
                  }}
                >
                  {user.isVerified && <span className="verified-badge-large">✓</span>}
                  {isOwnProfile && (
                    <label className="edit-avatar-btn" style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}>
                      <span className="icon">{uploading ? '⏳' : '📷'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </StoryRing>
              </div>
              <div className="profile-identity">
                <h1 className="profile-name">
                  {user.firstName} {user.lastName}
                  {user.isAdmin && <span className="admin-badge">⭐ Admin</span>}
                </h1>
                <p className="profile-username">@{user.username}</p>
                {user.bio && <p className="profile-bio">{user.bio}</p>}
                {user.location && (
                  <p className="profile-location">
                    <span className="icon">📍</span>
                    {user.location}
                  </p>
                )}
              </div>
            </div>

            <div className="profile-actions">
              {isOwnProfile ? (
                <>
                  <button className="btn-primary" onClick={() => setIsEditingProfile(true)}>
                    <span className="icon">✏️</span>
                    Edit Profile
                  </button>
                  <button className="btn-secondary" onClick={() => setShowSettings(true)}>
                    <span className="icon">⚙️</span>
                    Settings
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-primary">
                    <span className="icon">➕</span>
                    Follow
                  </button>
                  <button className="btn-secondary">
                    <span className="icon">💬</span>
                    Message
                  </button>
                </>
              )}
            </div>
          </div>

          {/* STATS BAR */}
          <div className="profile-stats-bar">
            <div 
              className="stat-item"
              onClick={() => setActiveTab('posts')}
              style={{ cursor: 'pointer' }}
            >
              <span className="stat-value">{profile.userPosts?.length || 0}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div 
              className="stat-item"
              onClick={() => setActiveTab('photos')}
              style={{ cursor: 'pointer' }}
            >
              <span className="stat-value">
                {(() => {
                  const galleryPhotos = (profile.gallery || []).filter(m => m.type === 'image').length;
                  const postPhotos = (profile.userPosts || [])
                    .reduce((count, post) => 
                      count + (post.media || []).filter(m => m.type === 'image').length, 0
                    );
                  return galleryPhotos + postPhotos;
                })()}
              </span>
              <span className="stat-label">Photos</span>
            </div>
            <div 
              className="stat-item"
              onClick={() => setActiveTab('videos')}
              style={{ cursor: 'pointer' }}
            >
              <span className="stat-value">
                {(() => {
                  const galleryVideos = (profile.gallery || []).filter(m => m.type === 'video').length;
                  const postVideos = (profile.userPosts || [])
                    .reduce((count, post) => 
                      count + (post.media || []).filter(m => m.type === 'video').length, 0
                    );
                  return galleryVideos + postVideos;
                })()}
              </span>
              <span className="stat-label">Videos</span>
            </div>
            <div 
              className="stat-item"
              onClick={() => setActiveTab('achievements')}
              style={{ cursor: 'pointer' }}
            >
              <span className="stat-value">{user.stats?.points || 0}</span>
              <span className="stat-label">Points</span>
            </div>
          </div>

          {/* NAVIGATION TABS */}
          <div className="profile-tabs">
            <button 
              className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              Posts
            </button>
            <button 
              className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              About
            </button>
            <button 
              className={`tab-btn ${activeTab === 'photos' ? 'active' : ''}`}
              onClick={() => setActiveTab('photos')}
            >
              Photos
            </button>
            <button 
              className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
              onClick={() => setActiveTab('videos')}
            >
              Videos
            </button>
            <button 
              className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              Achievements
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="profile-main-content">
          {/* LEFT SIDEBAR */}
          <aside className="profile-left-sidebar">
            {/* INTRO CARD */}
            <div className="profile-card">
              <h3 className="card-title">Intro</h3>
              <div className="intro-content">
                {profile.about && (
                  <p className="intro-bio">{profile.about}</p>
                )}
                
                {user.location && (
                  <div className="intro-item">
                    <span className="icon">📍</span>
                    Lives in <strong>{user.location}</strong>
                  </div>
                )}
                
                {user.dateOfBirth && (
                  <div className="intro-item">
                    <span className="icon">🎂</span>
                    Born {new Date(user.dateOfBirth).toLocaleDateString()}
                  </div>
                )}

                {profile.interests?.length > 0 && (
                  <div className="intro-item">
                    <span className="icon">❤️</span>
                    <div className="interests-tags">
                      {profile.interests.slice(0, 5).map((interest, idx) => (
                        <span key={idx} className="interest-tag">{interest}</span>
                      ))}
                    </div>
                  </div>
                )}

                {isOwnProfile && (
                  <button 
                    className="btn-edit-details"
                    onClick={() => setIsEditingAbout(true)}
                  >
                    Edit Details
                  </button>
                )}
              </div>
            </div>

            {/* SOCIAL LINKS */}
            {Object.values(profile.socialLinks || {}).some(link => link) && (
              <div className="profile-card">
                <h3 className="card-title">Social Links</h3>
                <div className="social-links">
                  {profile.socialLinks.instagram && (
                    <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                      <span className="icon">📷</span> Instagram
                    </a>
                  )}
                  {profile.socialLinks.twitter && (
                    <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                      <span className="icon">🐦</span> Twitter
                    </a>
                  )}
                  {profile.socialLinks.facebook && (
                    <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                      <span className="icon">📘</span> Facebook
                    </a>
                  )}
                  {profile.socialLinks.youtube && (
                    <a href={profile.socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                      <span className="icon">📺</span> YouTube
                    </a>
                  )}
                  {profile.socialLinks.website && (
                    <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer">
                      <span className="icon">🌐</span> Website
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* BADGES */}
            {user.badges?.length > 0 && (
              <div className="profile-card">
                <h3 className="card-title">Badges</h3>
                <div className="badges-grid">
                  {user.badges.map((badge, idx) => (
                    <div key={idx} className="badge-item" title={badge.description}>
                      <span className="badge-icon">{badge.icon}</span>
                      <span className="badge-name">{badge.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* MIDDLE CONTENT */}
          <main className="profile-middle-content">
            {activeTab === 'posts' && (
              <div className="posts-section">
                {profile.userPosts && profile.userPosts.length > 0 ? (
                  profile.userPosts.map((post) => (
                    <div key={post._id} className="post-card">
                      {/* Post Header */}
                      <div className="post-header">
                        <div className="post-author">
                          <StoryRing
                            avatarUrl={user.avatar?.url}
                            userName={`${user.firstName} ${user.lastName}`}
                            hasStory={stories.length > 0}
                            storyId={stories[0]?._id}
                            size="small"
                          />
                          <div className="author-info">
                            <h4 className="author-name">
                              {user.firstName} {user.lastName}
                              {user.isAdmin && <span className="verified-badge">✓</span>}
                            </h4>
                            <p className="post-time">
                              {new Date(post.createdAt).toLocaleDateString()}
                              {post.location && <span> • 📍 {post.location.name}</span>}
                            </p>
                          </div>
                        </div>
                        {isOwnProfile && (
                          <button className="post-menu-btn">⋯</button>
                        )}
                      </div>

                      {/* Post Caption */}
                      {post.caption && (
                        <div className="post-content">
                          <p className="post-caption">{post.caption}</p>
                        </div>
                      )}

                      {/* Post Media */}
                      {post.media && post.media.length > 0 && (
                        <div 
                          className={`post-media media-count-${
                            post.media.length === 1 ? '1' :
                            post.media.length === 2 ? '2' :
                            post.media.length === 3 ? '3' :
                            post.media.length === 4 ? '4' :
                            '5plus'
                          }`}
                          onClick={() => navigate(`/post/${post._id}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          {post.media.slice(0, 4).map((item, idx) => (
                            <div 
                              key={idx} 
                              className="media-item"
                              data-remaining={post.media.length > 4 && idx === 3 ? `+${post.media.length - 4}` : ''}
                            >
                              {item.type === 'video' ? (
                                <video src={item.url} />
                              ) : (
                                <img src={item.url} alt={`Media ${idx + 1}`} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Post Stats */}
                      <div className="post-stats">
                        <div className="post-stats-left">
                          {post.likesCount > 0 && (
                            <span className="stat-likes">
                              <span className="like-icon">👍</span>
                              {post.likesCount}
                            </span>
                          )}
                        </div>
                        <div className="post-stats-right">
                          {post.commentsCount > 0 && (
                            <span className="stat-link">
                              {post.commentsCount} comments
                            </span>
                          )}
                          {post.sharesCount > 0 && (
                            <span className="stat-link">
                              {post.sharesCount} shares
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Post Actions */}
                      <div className="post-actions">
                        <button 
                          className={`action-btn ${post.isLikedByMe ? 'active' : ''}`}
                          onClick={async () => {
                            if (!token) {
                              alert('Please login to like posts');
                              return;
                            }
                            
                            try {
                              const response = await axios.put(
                                `${API_URL}/posts/${post._id}/like`,
                                {},
                                { headers: { Authorization: `Bearer ${token}` } }
                              );

                              if (response.data.success) {
                                // Update the profile state with new like data
                                setProfile(prev => ({
                                  ...prev,
                                  userPosts: prev.userPosts.map(p =>
                                    p._id === post._id
                                      ? {
                                          ...p,
                                          likesCount: response.data.likesCount,
                                          isLikedByMe: response.data.liked
                                        }
                                      : p
                                  )
                                }));
                              }
                            } catch (error) {
                              console.error('Error liking post:', error);
                              alert('Failed to like post');
                            }
                          }}
                        >
                          <span className="icon">{post.isLikedByMe ? '👍' : '👍🏻'}</span>
                          Like
                        </button>
                        <button 
                          className="action-btn"
                          onClick={() => navigate(`/post/${post._id}#comments`)}
                        >
                          <span className="icon">💬</span>
                          Comment
                        </button>
                        <button 
                          className="action-btn"
                          onClick={async () => {
                            try {
                              const response = await axios.put(
                                `${API_URL}/posts/${post._id}/share`,
                                {},
                                { headers: { Authorization: `Bearer ${token}` } }
                              );
                              
                              if (response.data.success) {
                                setProfile(prev => ({
                                  ...prev,
                                  userPosts: prev.userPosts.map(p =>
                                    p._id === post._id
                                      ? { ...p, sharesCount: response.data.sharesCount }
                                      : p
                                  )
                                }));
                                alert('Post shared successfully!');
                              }
                            } catch (error) {
                              console.error('Error sharing post:', error);
                            }
                          }}
                        >
                          <span className="icon">↗️</span>
                          Share
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <span className="icon">📝</span>
                    <h3>No posts yet</h3>
                    <p>Posts will appear here</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="photos-section">
                {isOwnProfile && (
                  <div className="upload-gallery-card">
                    <label className="upload-btn" style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}>
                      <span className="icon">{uploading ? '⏳' : '➕'}</span>
                      {uploading ? 'Uploading...' : 'Add Photos'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleGalleryUpload}
                        disabled={uploading}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                )}
                
                <div className="photos-grid">
                  {(() => {
                    // Collect all photos from gallery
                    const galleryPhotos = (profile.gallery || [])
                      .filter(media => media.type === 'image')
                      .map(media => ({
                        url: media.url,
                        caption: media.caption,
                        type: 'gallery'
                      }));

                    // Collect all photos from posts
                    const postPhotos = (profile.userPosts || [])
                      .flatMap(post => 
                        (post.media || [])
                          .filter(media => media.type === 'image')
                          .map(media => ({
                            url: media.url,
                            caption: post.caption,
                            type: 'post',
                            postId: post._id
                          }))
                      );

                    // Combine all photos
                    const allPhotos = [...galleryPhotos, ...postPhotos];

                    return allPhotos.length > 0 ? (
                      allPhotos.map((photo, idx) => (
                        <div 
                          key={idx} 
                          className="photo-item"
                          onClick={() => {
                            if (photo.type === 'post') {
                              navigate(`/post/${photo.postId}`);
                            }
                          }}
                          style={{ cursor: photo.type === 'post' ? 'pointer' : 'default' }}
                        >
                          <img src={photo.url} alt={photo.caption || 'Photo'} />
                          {photo.caption && (
                            <div className="photo-caption">{photo.caption}</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <span className="icon">📸</span>
                        <h3>No photos yet</h3>
                        <p>Photos from your posts and gallery will appear here</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="videos-section">
                {isOwnProfile && (
                  <div className="upload-gallery-card">
                    <label className="upload-btn" style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}>
                      <span className="icon">{uploading ? '⏳' : '➕'}</span>
                      {uploading ? 'Uploading...' : 'Add Videos'}
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleGalleryUpload}
                        disabled={uploading}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                )}
                
                <div className="videos-grid">
                  {(() => {
                    // Collect all videos from gallery
                    const galleryVideos = (profile.gallery || [])
                      .filter(media => media.type === 'video')
                      .map(media => ({
                        url: media.url,
                        caption: media.caption,
                        type: 'gallery'
                      }));

                    // Collect all videos from posts
                    const postVideos = (profile.userPosts || [])
                      .flatMap(post => 
                        (post.media || [])
                          .filter(media => media.type === 'video')
                          .map(media => ({
                            url: media.url,
                            caption: post.caption,
                            type: 'post',
                            postId: post._id
                          }))
                      );

                    // Combine all videos
                    const allVideos = [...galleryVideos, ...postVideos];

                    return allVideos.length > 0 ? (
                      allVideos.map((video, idx) => (
                        <div 
                          key={idx} 
                          className="video-item"
                          onClick={() => {
                            if (video.type === 'post') {
                              navigate(`/post/${video.postId}`);
                            }
                          }}
                          style={{ cursor: video.type === 'post' ? 'pointer' : 'default' }}
                        >
                          <video src={video.url} controls />
                          {video.caption && (
                            <div className="video-caption">{video.caption}</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <span className="icon">🎬</span>
                        <h3>No videos yet</h3>
                        <p>Videos from your posts and gallery will appear here</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="achievements-section">
                {/* Achievements Grid - Show for ALL users */}
                {achievements.length > 0 && (
                  <div className="profile-card" style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 className="card-title">🏆 Achievements</h3>
                      <button 
                        className="btn-secondary"
                        onClick={() => navigate('/achievements')}
                        style={{ fontSize: '14px', padding: '8px 16px' }}
                      >
                        View All →
                      </button>
                    </div>
                    
                    <div className="achievements-grid-profile">
                      {achievements.map((achievement) => (
                        <div 
                          key={achievement._id} 
                          className="achievement-card-profile"
                          onClick={() => navigate(`/achievements/${achievement._id}`)}
                        >
                          <div className="achievement-card-image-profile">
                            {achievement.coverImage?.url ? (
                              <img 
                                src={achievement.coverImage.url} 
                                alt={achievement.title}
                              />
                            ) : (
                              <div className="achievement-placeholder-profile">
                                <span className="achievement-icon-profile">
                                  {achievement.icon || '🏆'}
                                </span>
                              </div>
                            )}
                            
                            {achievement.isMajor && (
                              <div className="major-badge-profile">⭐ MAJOR</div>
                            )}
                          </div>
                          
                          <div className="achievement-card-content-profile">
                            <div className="achievement-category-profile">
                              {achievement.category.replace('_', ' ').toUpperCase()}
                            </div>
                            <h4 className="achievement-title-profile">{achievement.title}</h4>
                            <p className="achievement-year-profile">{achievement.year}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tournament Stats - Show if data exists */}
                {profile.achievements && (
                  <div className="profile-card">
                    <h3 className="card-title">Tournament Stats</h3>
                    <div className="stats-grid-large">
                      <div className="stat-card-large">
                        <span className="stat-icon">🏆</span>
                        <span className="stat-number">{profile.achievements.totalWins || 0}</span>
                        <span className="stat-label">Total Wins</span>
                      </div>
                      <div className="stat-card-large">
                        <span className="stat-icon">🥇</span>
                        <span className="stat-number">{profile.achievements.majorTitles || 0}</span>
                        <span className="stat-label">Major Titles</span>
                      </div>
                      <div className="stat-card-large">
                        <span className="stat-icon">🎯</span>
                        <span className="stat-number">{profile.achievements.tournamentParticipations || 0}</span>
                        <span className="stat-label">Tournaments</span>
                      </div>
                      <div className="stat-card-large">
                        <span className="stat-icon">⭐</span>
                        <span className="stat-number">#{profile.achievements.worldRanking || 'N/A'}</span>
                        <span className="stat-label">World Ranking</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {achievements.length === 0 && !profile.achievements && (
                  <div className="empty-state">
                    <span className="icon">🏆</span>
                    <h3>No achievements yet</h3>
                    <p>Achievements will appear here</p>
                  </div>
                )}
              </div>
            )}

            {/* Tournaments Section */}
            {tournaments.length > 0 && (
              <div className="profile-card" style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 className="card-title">📅 Upcoming Tournaments</h3>
                  <button 
                    className="btn-secondary"
                    onClick={() => navigate('/tournaments')}
                    style={{ fontSize: '14px', padding: '8px 16px' }}
                  >
                    View All →
                  </button>
                </div>
                
                <div className="tournaments-grid-profile">
                  {tournaments.map((tournament) => (
                    <div 
                      key={tournament._id} 
                      className="tournament-card-profile"
                      onClick={() => navigate(`/tournaments/${tournament._id}`)}
                    >
                      <div className="tournament-card-image-profile">
                        {tournament.coverImage?.url ? (
                          <img 
                            src={tournament.coverImage.url} 
                            alt={tournament.name}
                          />
                        ) : (
                          <div className="tournament-placeholder-profile">
                            <span className="tournament-icon-profile">🏌️‍♀️</span>
                          </div>
                        )}
                        
                        {tournament.isFeatured && (
                          <div className="tournament-featured-badge-profile">⭐ FEATURED</div>
                        )}
                        
                        <div className="tournament-status-badge-profile">
                          {tournament.status}
                        </div>
                      </div>
                      
                      <div className="tournament-card-content-profile">
                        <div className="tournament-type-profile">
                          {tournament.type.toUpperCase()}
                        </div>
                        <h4 className="tournament-title-profile">{tournament.name}</h4>
                        <p className="tournament-location-profile">
                          📍 {tournament.location?.city}, {tournament.location?.country}
                        </p>
                        <p className="tournament-dates-profile">
                          📅 {new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(tournament.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* RIGHT SIDEBAR */}
          <aside className="profile-right-sidebar">
            <div className="profile-card">
              <h3 className="card-title">Profile Completion</h3>
              <div className="completion-bar">
                <div 
                  className="completion-fill" 
                  style={{ width: `${profile.completionPercentage || 0}%` }}
                ></div>
              </div>
              <p className="completion-text">
                {profile.completionPercentage || 0}% Complete
              </p>
            </div>

            {user.isAdmin && profile.achievements && (
              <div className="profile-card">
                <h3 className="card-title">Quick Stats</h3>
                <div className="quick-stats">
                  <div className="quick-stat">
                    <span className="label">Career Earnings</span>
                    <span className="value">
                      ${(profile.achievements.careerEarnings || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div className="profile-card">
              <PointsBadgeDisplay compact={false} showBadges={true} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;