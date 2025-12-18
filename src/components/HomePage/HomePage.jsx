import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateStoryModal from '../../pages/StoryPage/CreateStoryModal';
import StoryRing from '../../components/StoryRing/StoryRing';
import MediaViewer from '../../components/MediaViewer/MediaViewer';
import { getAchievements } from '../../services/achievementService';
import tournamentService from '../../services/tournamentService';
import { getTrending } from '../../services/trendingService';
import PointsBadgeDisplay from '../../components/PointsBadgeDisplay/PointsBadgeDisplay';
import PlatformStatsWidget from '../PlatformStatsWidget/PlatformStatsWidget';
import axios from 'axios';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [showPostMenu, setShowPostMenu] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [achievements, setAchievements] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [trending, setTrending] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState(null);

  const API_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCurrentUser();
    fetchHomeData();
    fetchTrending();
  }, []);


  const fetchTrending = async () => {
    try {
      setTrendingLoading(true);
      setTrendingError(null);
      const response = await getTrending(5, 'weekly'); // Get top 5 weekly trending
      setTrending(response.trending || []);
    } catch (error) {
      console.error('Error fetching trending:', error);
      setTrendingError('Failed to load trending hashtags');
    } finally {
      setTrendingLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setCurrentUser(response.data.user);
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const fetchHomeData = async () => {
    try {
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch posts with authentication - ONLY ADMIN POSTS WILL BE RETURNED
      const postsRes = await axios.get(`${API_URL}/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Fetched posts:', postsRes.data.posts);

      // Try to fetch stories (if endpoint exists)
      let storiesData = [];
      try {
        const storiesRes = await axios.get(`${API_URL}/stories`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        storiesData = storiesRes.data.stories || [];
      } catch (err) {
        console.log('Stories endpoint not available yet');
      }

      // Fetch achievements
      let achievementsData = [];
      try {
        const achievementsRes = await getAchievements({ 
          limit: 5, 
          isFeatured: false,
          isPublished: true 
        });
        achievementsData = achievementsRes.achievements || [];
      } catch (err) {
        console.log('Error fetching achievements:', err);
      }

      // Fetch tournaments
      let tournamentsData = [];
      try {
        const tournamentsRes = await tournamentService.getTournaments({ 
          limit: 5,
          status: 'upcoming'
        });
        tournamentsData = tournamentsRes.tournaments || [];
      } catch (err) {
        console.log('Error fetching tournaments:', err);
      }

      setPosts(postsRes.data.posts || []);
      setStories(storiesData);
      setAchievements(achievementsData);
      setTournaments(tournamentsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching home data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      setLoading(false);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showPostMenu && !e.target.closest('.post-menu-wrapper')) {
        setShowPostMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showPostMenu]);



  const handleLike = async (postId) => {
    try {
      const response = await axios.put(
        `${API_URL}/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update the posts array with new like status
        setPosts(prevPosts => prevPosts.map(post => 
          post._id === postId 
            ? { 
                ...post, 
                likesCount: response.data.likesCount, 
                isLikedByMe: response.data.liked 
              }
            : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleCreatePost = async () => {
    // CHECK IF USER IS NOT ADMIN
    if (!currentUser?.isAdmin) {
      alert('Only admin can create posts');
      return;
    }

    if (!newPostContent.trim() && selectedFiles.length === 0) {
      alert('Please add some content or select media');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('caption', newPostContent);
      
      // Determine post type
      if (selectedFiles.length > 0) {
        const hasVideo = selectedFiles.some(file => file.type.startsWith('video/'));
        formData.append('type', hasVideo ? 'video' : selectedFiles.length > 1 ? 'gallery' : 'image');
        
        // Append all files
        selectedFiles.forEach((file) => {
          formData.append('media', file);
        });
      } else {
        formData.append('type', 'text');
      }

      const response = await axios.post(
        `${API_URL}/posts`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );

      if (response.data.success) {
        setPosts([response.data.post, ...posts]);
        setNewPostContent('');
        setSelectedFiles([]);
        setFilePreviews([]);
        setShowCreatePost(false);
        setUploading(false);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert(error.response?.data?.message || 'Failed to create post');
      setUploading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_URL}/posts/${postId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Remove post from state
        setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
        setShowPostMenu(null);
        alert('Post deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(error.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditPostContent(post.caption || '');
    setShowEditModal(true);
    setShowPostMenu(null);
  };

  const handleUpdatePost = async () => {
    if (!editPostContent.trim()) {
      alert('Please add some content');
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/posts/${editingPost._id}`,
        { caption: editPostContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update post in state
        setPosts(prevPosts => prevPosts.map(post => 
          post._id === editingPost._id 
            ? { ...post, caption: editPostContent }
            : post
        ));
        setShowEditModal(false);
        setEditingPost(null);
        setEditPostContent('');
        alert('Post updated successfully');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert(error.response?.data?.message || 'Failed to update post');
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate files
    const maxSize = 10 * 1024 * 1024; // 10MB for images
    const maxVideoSize = 100 * 1024 * 1024; // 100MB for videos
    
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        alert(`${file.name} is not a valid image or video file`);
        return false;
      }
      
      const sizeLimit = isVideo ? maxVideoSize : maxSize;
      if (file.size > sizeLimit) {
        alert(`${file.name} is too large. Max size: ${isVideo ? '100MB' : '10MB'}`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    // Limit to 10 files
    const filesToAdd = validFiles.slice(0, 10);
    setSelectedFiles(prev => [...prev, ...filesToAdd].slice(0, 10));

    // Create previews
    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews(prev => [...prev, {
          url: reader.result,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const closeCreatePostModal = () => {
    setShowCreatePost(false);
    setNewPostContent('');
    setSelectedFiles([]);
    setFilePreviews([]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navigateToProfile = (username) => {
    if (username) {
      navigate(`/profile/${username}`);
    } else {
      navigate('/profile');
    }
  };

  const getAvatarUrl = (avatarObj, name = 'User', size = 80) => {
    if (avatarObj?.url) {
      return avatarObj.url;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=1877f2&color=fff`;
  };

  const getPlaceholderImage = (text, size = 60) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(text)}&size=${size}&background=random`;
  };

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return postDate.toLocaleDateString();
  };

  const openMediaViewer = (post, mediaIndex = 0) => {
    setSelectedPost(post);
    setSelectedMediaIndex(mediaIndex);
    setShowMediaViewer(true);
  };

  return (
    <div className="hom-0330-homepage-container">
      <div className="hom-0330-homepage-main">
        {/* LEFT SIDEBAR */}
        <aside className="hom-0330-left-sidebar">
          <div className="hom-0330-sidebar-section">
            <div className="hom-0330-user-profile-card" onClick={() => navigateToProfile()}>
              <div className="hom-0330-profile-cover"></div>
              <StoryRing
                avatarUrl={currentUser?.avatar?.url}
                userName={`${currentUser?.firstName} ${currentUser?.lastName}`}
                hasStory={stories.length > 0}
                storyId={stories[0]?._id}
                size="large"
                onClick={() => {
                  if (stories.length > 0) {
                    navigate(`/story/${stories[0]._id}`);
                  } else {
                    navigateToProfile();
                  }
                }}
              />
              <h3 className="hom-0330-profile-name">
                {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Loading...'}
              </h3>
              <p className="hom-0330-profile-username">
                @{currentUser?.username || 'username'}
              </p>
              <PointsBadgeDisplay compact={true} showBadges={true} />
            </div>
          </div>

          <div className="hom-0330-sidebar-section">
            <h4 className="hom-0330-section-title">Menu</h4>
            <nav className="hom-0330-sidebar-nav">
              <a 
                href="#" 
                className="hom-0330-nav-item hom-0330-active"
                onClick={(e) => { e.preventDefault(); navigate('/'); }}
              >
                <span className="hom-0330-nav-icon">📰</span>
                <span className="hom-0330-nav-text">News Feed</span>
              </a>
              <a 
                href="#" 
                className="hom-0330-nav-item"
                onClick={(e) => { e.preventDefault(); navigateToProfile(); }}
              >
                <span className="hom-0330-nav-icon">👤</span>
                <span className="hom-0330-nav-text">My Profile</span>
              </a>
              <a 
                href="#" 
                className="hom-0330-nav-item"
                onClick={(e) => { e.preventDefault(); navigate('/achievements'); }}
              >
                <span className="hom-0330-nav-icon">🏆</span>
                <span className="hom-0330-nav-text">Achievements</span>
              </a>
              <a 
                href="#" 
                className="hom-0330-nav-item"
                onClick={(e) => { e.preventDefault(); navigate('/gallery'); }}
              >
                <span className="hom-0330-nav-icon">📸</span>
                <span className="hom-0330-nav-text">Gallery</span>
              </a>
              <a 
                href="#" 
                className="hom-0330-nav-item"
                onClick={(e) => { e.preventDefault(); navigate('/videos'); }}
              >
                <span className="hom-0330-nav-icon">🎬</span>
                <span className="hom-0330-nav-text">Videos</span>
              </a>
              <a 
                href="#" 
                className="hom-0330-nav-item"
                onClick={(e) => { e.preventDefault(); navigate('/events'); }}
              >
                <span className="hom-0330-nav-icon">📅</span>
                <span className="hom-0330-nav-text">Events</span>
              </a>
              <a 
                href="#" 
                className="hom-0330-nav-item"
                onClick={(e) => { e.preventDefault(); navigate('/settings'); }}
              >
                <span className="hom-0330-nav-icon">⚙️</span>
                <span className="hom-0330-nav-text">Settings</span>
              </a>
              <a 
                href="#" 
                className="hom-0330-nav-item"
                onClick={(e) => { e.preventDefault(); handleLogout(); }}
              >
                <span className="hom-0330-nav-icon">🚪</span>
                <span className="hom-0330-nav-text">Logout</span>
              </a>
            </nav>
          </div>

          <div className="hom-0330-sidebar-section">
            <h4 className="hom-0330-section-title">Quick Links</h4>
            <div className="hom-0330-quick-links">
              <a 
                href="#" 
                className="hom-0330-quick-link"
                onClick={(e) => { e.preventDefault(); navigate('/about'); }}
              >
                <span className="hom-0330-link-icon">ℹ️</span>
                About Nelly
              </a>
              <a 
                href="#" 
                className="hom-0330-quick-link"
                onClick={(e) => { e.preventDefault(); navigate('/contact'); }}
              >
                <span className="hom-0330-link-icon">📞</span>
                Contact
              </a>
              <a 
                href="#" 
                className="hom-0330-quick-link"
                onClick={(e) => { e.preventDefault(); navigate('/help'); }}
              >
                <span className="hom-0330-link-icon">❓</span>
                Help Center
              </a>
              <a 
                href="#" 
                className="hom-0330-quick-link"
                onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}
              >
                <span className="hom-0330-link-icon">🔒</span>
                Privacy
              </a>
            </div>
          </div>
        </aside>

        {/* MIDDLE FEED */}
        <main className="hom-0330-middle-feed">
          {/* STORIES SECTION - UPDATED */}
          <div className="hom-0330-stories-section">
            <div className="hom-0330-stories-container">
              {/* Create Story Button - Admin Only */}
              {currentUser?.isAdmin && (
                <div 
                  className="hom-0330-story-card hom-0330-create-story"
                  onClick={() => setShowCreateStoryModal(true)}
                >
                  <div className="hom-0330-story-avatar">
                    <span className="hom-0330-plus-icon">+</span>
                  </div>
                  <p className="hom-0330-story-name">Create Story</p>
                </div>
              )}

              {/* Existing Stories */}
              {stories.length > 0 ? (
                stories.map((story, index) => (
                  <div 
                    key={story._id || index} 
                    className="hom-0330-story-card"
                    onClick={() => navigate(`/story/${story._id}`)}
                  >
                    <div className="hom-0330-story-avatar">
                      <img 
                        src={story.author?.avatar?.url || getPlaceholderImage(`Story ${index + 1}`, 110)} 
                        alt="Story" 
                      />
                      <div className="hom-0330-story-ring"></div>
                    </div>
                    <p className="hom-0330-story-name">
                      {story.author?.firstName || `Story ${index + 1}`}
                    </p>
                  </div>
                ))
              ) : (
                // Placeholder stories when none exist
                [1, 2, 3, 4, 5, 6].map((num, index) => (
                  <div key={index} className="hom-0330-story-card">
                    <div className="hom-0330-story-avatar">
                      <img src={getPlaceholderImage(`S${num}`, 110)} alt={`Story ${num}`} />
                      <div className="hom-0330-story-ring"></div>
                    </div>
                    <p className="hom-0330-story-name">Story {num}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Create Story Modal - Add before closing tag */}
          <CreateStoryModal
            isOpen={showCreateStoryModal}
            onClose={() => setShowCreateStoryModal(false)}
            currentUser={currentUser}
          />

          {/* CREATE POST CARD - ONLY SHOW FOR ADMIN */}
          {currentUser?.isAdmin && (
            <div className="hom-0330-create-post-card">
              <div className="hom-0330-create-post-header">
                <img 
                  src={getAvatarUrl(currentUser?.avatar, `${currentUser?.firstName} ${currentUser?.lastName}`, 40)} 
                  alt="User" 
                  className="hom-0330-user-avatar-small"
                />
                <input 
                  type="text" 
                  placeholder="What's on your mind?" 
                  className="hom-0330-create-post-input"
                  onClick={() => setShowCreatePost(true)}
                  readOnly
                />
              </div>
              <div className="hom-0330-create-post-actions">
                <button 
                  className="hom-0330-action-btn"
                  onClick={() => setShowCreatePost(true)}
                >
                  <span className="hom-0330-icon">📸</span>
                  Photo/Video
                </button>
                <button 
                  className="hom-0330-action-btn"
                  onClick={() => setShowCreatePost(true)}
                >
                  <span className="hom-0330-icon">😊</span>
                  Feeling
                </button>
                <button 
                  className="hom-0330-action-btn"
                  onClick={() => setShowCreatePost(true)}
                >
                  <span className="hom-0330-icon">📍</span>
                  Check In
                </button>
              </div>
            </div>
          )}

          {/* CREATE POST MODAL */}
          {showCreatePost && (
            <div className="hom-0330-create-post-modal" onClick={closeCreatePostModal}>
              <div className="hom-0330-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="hom-0330-modal-header">
                  <h3>Create Post</h3>
                  <button 
                    className="hom-0330-close-btn"
                    onClick={closeCreatePostModal}
                  >
                    ✕
                  </button>
                </div>
                <div className="hom-0330-modal-body">
                  <div className="hom-0330-modal-user-info">
                    <img 
                      src={getAvatarUrl(currentUser?.avatar, `${currentUser?.firstName} ${currentUser?.lastName}`, 40)} 
                      alt="User"
                      className="hom-0330-modal-avatar"
                    />
                    <div>
                      <h4>{currentUser?.firstName} {currentUser?.lastName}</h4>
                      <select className="hom-0330-privacy-select">
                        <option>🌍 Public</option>
                        <option>👥 Friends</option>
                        <option>🔒 Only me</option>
                      </select>
                    </div>
                  </div>
                  <textarea
                    placeholder={`What's on your mind, ${currentUser?.firstName}?`}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows="6"
                    className="hom-0330-post-textarea"
                    autoFocus
                  />

                  {/* File Previews */}
                  {filePreviews.length > 0 && (
                    <div className="hom-0330-file-previews">
                      <div className="hom-0330-previews-grid">
                        {filePreviews.map((preview, index) => (
                          <div key={index} className="hom-0330-preview-item">
                            {preview.type === 'video' ? (
                              <video src={preview.url} className="hom-0330-preview-media" />
                            ) : (
                              <img src={preview.url} alt={preview.name} className="hom-0330-preview-media" />
                            )}
                            <button 
                              className="hom-0330-remove-preview-btn"
                              onClick={() => removeFile(index)}
                              type="button"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Media Options */}
                  <div className="hom-0330-add-to-post">
                    <p className="hom-0330-add-to-post-label">Add to your post</p>
                    <div className="hom-0330-add-to-post-actions">
                      <label className="hom-0330-add-media-btn" title="Photo/Video">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={handleFileSelect}
                          style={{ display: 'none' }}
                        />
                        <span className="hom-0330-media-icon">📸</span>
                        Photo/Video
                      </label>
                      <button className="hom-0330-add-media-btn" title="Tag People">
                        <span className="hom-0330-media-icon">👥</span>
                        Tag People
                      </button>
                      <button className="hom-0330-add-media-btn" title="Feeling/Activity">
                        <span className="hom-0330-media-icon">😊</span>
                        Feeling
                      </button>
                      <button className="hom-0330-add-media-btn" title="Check In">
                        <span className="hom-0330-media-icon">📍</span>
                        Check In
                      </button>
                    </div>
                  </div>
                </div>
                <div className="hom-0330-modal-footer">
                  <button 
                    className="hom-0330-btn-post"
                    onClick={handleCreatePost}
                    disabled={(!newPostContent.trim() && selectedFiles.length === 0) || uploading}
                  >
                    {uploading ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ACHIEVEMENTS SECTION */}
          {achievements.length > 0 && (
            <div className="hom-0330-achievements-feed-section">
              <div className="hom-0330-section-header">
                <h2>🏆 Latest Achievements</h2>
                <button 
                  className="hom-0330-view-all-btn"
                  onClick={() => navigate('/achievements')}
                >
                  View All →
                </button>
              </div>
              
              <div className="hom-0330-achievements-grid">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement._id} 
                    className="hom-0330-achievement-card"
                    onClick={() => navigate(`/achievements/${achievement._id}`)}
                  >
                    <div className="hom-0330-achievement-header">
                      {achievement.coverImage?.url ? (
                        <img 
                          src={achievement.coverImage.url} 
                          alt={achievement.title}
                          className="hom-0330-achievement-image"
                        />
                      ) : (
                        <div className="hom-0330-achievement-placeholder">
                          <span className="hom-0330-achievement-icon-large">
                            {achievement.icon || '🏆'}
                          </span>
                        </div>
                      )}
                      
                      {achievement.isMajor && (
                        <div className="hom-0330-achievement-major-badge">
                          ⭐ MAJOR
                        </div>
                      )}
                    </div>
                    
                    <div className="hom-0330-achievement-content">
                      <div className="hom-0330-achievement-category">
                        {achievement.category.replace('_', ' ').toUpperCase()}
                      </div>
                      
                      <h3 className="hom-0330-achievement-title">
                        {achievement.title}
                      </h3>
                      
                      <p className="hom-0330-achievement-description">
                        {achievement.description.length > 100
                          ? `${achievement.description.substring(0, 100)}...`
                          : achievement.description}
                      </p>
                      
                      <div className="hom-0330-achievement-footer">
                        <span className="hom-0330-achievement-year">
                          {achievement.year}
                        </span>
                        <span className="hom-0330-achievement-views">
                          👁️ {achievement.views || 0} views
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TOURNAMENTS SECTION */}
          {tournaments.length > 0 && (
            <div className="hom-0330-tournaments-feed-section">
              <div className="hom-0330-section-header">
                <h2>📅 Upcoming Tournaments</h2>
                <button 
                  className="hom-0330-view-all-btn"
                  onClick={() => navigate('/tournaments')}
                >
                  View All →
                </button>
              </div>
              
              <div className="hom-0330-tournaments-grid">
                {tournaments.map((tournament) => (
                  <div 
                    key={tournament._id} 
                    className="hom-0330-tournament-card-feed"
                    onClick={() => navigate(`/tournaments/${tournament._id}`)}
                  >
                    <div className="hom-0330-tournament-header-feed">
                      {tournament.coverImage?.url ? (
                        <img 
                          src={tournament.coverImage.url} 
                          alt={tournament.title}
                          className="hom-0330-tournament-image-feed"
                        />
                      ) : (
                        <div className="hom-0330-tournament-placeholder-feed">
                          <span className="hom-0330-tournament-icon-large-feed">🏌️‍♀️</span>
                        </div>
                      )}
                      
                      {tournament.isFeatured && (
                        <div className="hom-0330-tournament-featured-badge-feed">
                          ⭐ FEATURED
                        </div>
                      )}
                      
                      <div className="hom-0330-tournament-status-badge-feed">
                        {tournament.status}
                      </div>
                    </div>
                    
                    <div className="hom-0330-tournament-content-feed">
                      <div className="hom-0330-tournament-type-feed">
                        {tournament.type.toUpperCase()}
                      </div>
                      
                      <h3 className="hom-0330-tournament-title-feed">
                        {tournament.name}
                      </h3>
                      
                      <div className="hom-0330-tournament-location-feed">
                        <span className="hom-0330-tournament-icon-feed">📍</span>
                        {tournament.location?.city}, {tournament.location?.country}
                      </div>
                      
                      <div className="hom-0330-tournament-dates-feed">
                        <span className="hom-0330-tournament-icon-feed">📅</span>
                        {new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(tournament.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      
                      {tournament.prizeMoney?.total > 0 && (
                        <div className="hom-0330-tournament-prize-feed">
                          <span className="hom-0330-tournament-icon-feed">💰</span>
                          ${(tournament.prizeMoney.total / 1000000).toFixed(1)}M Prize
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* POSTS FEED */}
          <div className="hom-0330-posts-section">
            {loading ? (
              <div className="hom-0330-loading-state">
                <div className="hom-0330-spinner"></div>
                <p>Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="hom-0330-empty-state-feed">
                <span className="hom-0330-empty-icon">📝</span>
                <h3>No posts yet</h3>
                <p>Be the first to share something!</p>
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <div key={post._id} className="hom-0330-post-card">

                    {/* Post Header */}
                    <div className="hom-0330-post-header">
                      <div className="hom-0330-post-author">
                        <StoryRing
                          avatarUrl={post.author?.avatar?.url}
                          userName={`${post.author?.firstName} ${post.author?.lastName}`}
                          hasStory={false}
                          size="small"
                          onClick={() => navigateToProfile(post.author?.username)}
                        />

                        <div className="hom-0330-author-info">
                          <h4 
                            className="hom-0330-author-name"
                            onClick={() => navigateToProfile(post.author?.username)}
                            style={{ cursor: 'pointer' }}
                          >
                            {post.author?.firstName} {post.author?.lastName}
                            {post.author?.isAdmin && <span className="hom-0330-verified-badge">✓</span>}
                          </h4>

                          <p className="hom-0330-post-time">
                            {formatDate(post.createdAt)}
                            {post.location && <span> • 📍 {post.location.name}</span>}
                          </p>
                        </div>
                      </div>

                      {currentUser?.isAdmin && (
                        <div className="hom-0330-post-menu-wrapper">
                          <button 
                            className="hom-0330-post-menu-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPostMenu(showPostMenu === post._id ? null : post._id);
                            }}
                          >
                            ⋯
                          </button>
                          
                          {showPostMenu === post._id && (
                            <div className="hom-0330-post-menu-dropdown">
                              <button 
                                className="hom-0330-menu-option"
                                onClick={() => handleEditPost(post)}
                              >
                                <span className="hom-0330-menu-icon">✏️</span>
                                Edit Post
                              </button>
                              <button 
                                className="hom-0330-menu-option hom-0330-delete"
                                onClick={() => handleDeletePost(post._id)}
                              >
                                <span className="hom-0330-menu-icon">🗑️</span>
                                Delete Post
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Post Caption */}
                    {post.caption && (
                      <div className="hom-0330-post-content">
                        <p className="hom-0330-post-caption">{post.caption}</p>
                      </div>
                    )}

                    {/* Post Media */}
                    {post.media && post.media.length > 0 && (
                      <div 
                        className={`hom-0330-post-media hom-0330-media-count-${
                          post.media.length === 1 ? '1' :
                          post.media.length === 2 ? '2' :
                          post.media.length === 3 ? '3' :
                          post.media.length === 4 ? '4' : '5plus'
                        }`}
                      >
                        {post.media.slice(0, 4).map((item, idx) => (
                          <div 
                            key={idx} 
                            className="hom-0330-media-item"
                            onClick={() => openMediaViewer(post, idx)}
                            style={{ cursor: 'pointer' }}
                          >
                            {item.type === 'video' ? (
                              <video 
                                src={item.url}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/post/${post._id}`);
                                }}
                              />
                            ) : (
                              <img src={item.url} alt={`Media ${idx + 1}`} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Post Stats */}
                    <div className="hom-0330-post-stats">
                      <div className="hom-0330-post-stats-left">
                        {post.likesCount > 0 && (
                          <span className="hom-0330-stat-likes">
                            <span className="hom-0330-like-icon">👍</span>
                            {post.likesCount}
                          </span>
                        )}
                      </div>

                      <div className="hom-0330-post-stats-right">
                        {post.commentsCount > 0 && (
                          <span 
                            className="hom-0330-stat-link"
                            onClick={() => navigate(`/post/${post._id}#comments`)}
                          >
                            {post.commentsCount} comments
                          </span>
                        )}
                        {post.sharesCount > 0 && (
                          <span className="hom-0330-stat-link">
                            {post.sharesCount} shares
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Post Actions */}
                    <div className="hom-0330-post-actions">
                      <button 
                        className={`hom-0330-action-btn ${post.isLikedByMe ? 'hom-0330-active' : ''}`}
                        onClick={() => handleLike(post._id)}
                      >
                        <span className="hom-0330-icon">{post.isLikedByMe ? '👍' : '👍🏻'}</span>
                        Like
                      </button>

                      <button 
                        className="hom-0330-action-btn"
                        onClick={() => navigate(`/post/${post._id}#comments`)}
                      >
                        <span className="hom-0330-icon">💬</span>
                        Comment
                      </button>

                      <button 
                        className="hom-0330-action-btn"
                        onClick={() => navigate(`/post/${post._id}`)}
                      >
                        <span className="hom-0330-icon">↗️</span>
                        Share
                      </button>
                    </div>

                  </div>
                ))}
              </>
            )}
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hom-0330-right-sidebar">
          <div className="hom-0330-sidebar-section">
            <div className="hom-0330-section-header-sidebar">
              <h4 className="hom-0330-section-title">Upcoming Tournaments</h4>
              <button 
                className="hom-0330-view-all-link"
                onClick={() => navigate('/tournaments')}
              >
                View All →
              </button>
            </div>
            
            <div className="hom-0330-tournaments-list">
              {tournaments.length === 0 ? (
                // Loading or empty state
                <div className="hom-0330-empty-tournaments">
                  <span className="hom-0330-empty-icon">🏆</span>
                  <p>No upcoming tournaments</p>
                </div>
              ) : (
                // Display real tournaments from backend
                tournaments.slice(0, 3).map((tournament) => (
                  <div 
                    key={tournament._id} 
                    className="hom-0330-tournament-card"
                    onClick={() => navigate(`/tournaments/${tournament._id}`)}
                  >
                    <div className="hom-0330-tournament-icon-wrapper">
                      {tournament.coverImage?.url ? (
                        <img 
                          src={tournament.coverImage.url} 
                          alt={tournament.name}
                          className="hom-0330-tournament-thumb"
                        />
                      ) : (
                        <div className="hom-0330-tournament-icon">🏆</div>
                      )}
                      {tournament.isFeatured && (
                        <span className="hom-0330-featured-dot">⭐</span>
                      )}
                    </div>
                    
                    <div className="hom-0330-tournament-info">
                      <h5 className="hom-0330-tournament-name">{tournament.name}</h5>
                      <p className="hom-0330-tournament-date">
                        {new Date(tournament.startDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })} - {new Date(tournament.endDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="hom-0330-tournament-location">
                        📍 {tournament.location?.city}, {tournament.location?.country}
                      </p>
                      <div className="hom-0330-tournament-meta">
                        <span className="hom-0330-tournament-type-badge">
                          {tournament.type}
                        </span>
                        {tournament.status === 'upcoming' && (
                          <span className="hom-0330-tournament-status-upcoming">
                            {tournament.daysUntilStart > 0 && `${tournament.daysUntilStart}d`}
                          </span>
                        )}
                        {tournament.status === 'ongoing' && (
                          <span className="hom-0330-tournament-status-live">
                            🔴 LIVE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="hom-0330-sidebar-section">
            <div className="hom-0330-trending-section">
              <div className="hom-0330-trending-header">
                <h4 className="hom-0330-trending-title">
                  <span className="hom-0330-trending-icon">🔥</span>
                  Trending
                </h4>
                <button 
                  className="hom-0330-trending-refresh-btn"
                  onClick={fetchTrending}
                  disabled={trendingLoading}
                >
                  {trendingLoading ? '⟳' : '↻'} Refresh
                </button>
              </div>

              {trendingLoading ? (
                <div className="hom-0330-trending-loading">
                  <div className="hom-0330-trending-spinner"></div>
                  <p className="hom-0330-trending-loading-text">Loading trending...</p>
                </div>
              ) : trendingError ? (
                <div className="hom-0330-trending-error">
                  <span className="hom-0330-trending-error-icon">⚠️</span>
                  <p className="hom-0330-trending-error-text">{trendingError}</p>
                  <button 
                    className="hom-0330-trending-retry-btn"
                    onClick={fetchTrending}
                  >
                    Try Again
                  </button>
                </div>
              ) : trending.length === 0 ? (
                <div className="hom-0330-trending-empty">
                  <span className="hom-0330-trending-empty-icon">📊</span>
                  <h5 className="hom-0330-trending-empty-title">No trending topics</h5>
                  <p className="hom-0330-trending-empty-text">
                    Start using hashtags in posts to see trending topics!
                  </p>
                </div>
              ) : (
                <>
                  <div className="hom-0330-trending-list">
                    {trending.map((trend, index) => (
                      <div 
                        key={index} 
                        className="hom-0330-trending-item"
                        onClick={() => navigate(`/search?q=${encodeURIComponent(trend.tag)}`)}
                      >
                        <div className="hom-0330-trending-item-content">
                          <span className="hom-0330-trending-tag">{trend.tag}</span>
                          <span className="hom-0330-trending-count">
                            <span className="hom-0330-trending-count-icon">📝</span>
                            {trend.count} {trend.count === 1 ? 'post' : 'posts'}
                          </span>
                        </div>
                        <div className="hom-0330-trending-badge">
                          <span className="hom-0330-trending-badge-icon">🔥</span>
                          {Math.round(trend.score)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="hom-0330-trending-footer">
                    <a 
                      href="#" 
                      className="hom-0330-trending-view-all"
                      onClick={(e) => { 
                        e.preventDefault(); 
                        navigate('/trending'); 
                      }}
                    >
                      View All Trending →
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ✅ UPDATED: Latest Achievements - Now using real data from backend */}
          <div className="hom-0330-sidebar-section">
            <div className="hom-0330-section-header-sidebar">
              <h4 className="hom-0330-section-title">Latest Achievements</h4>
              <button 
                className="hom-0330-view-all-link"
                onClick={() => navigate('/achievements')}
              >
                View All →
              </button>
            </div>
            <div className="hom-0330-achievements-list">
              {achievements.length === 0 ? (
                // Loading or empty state
                <div className="hom-0330-empty-achievements">
                  <span className="hom-0330-empty-icon">🏆</span>
                  <p>No achievements yet</p>
                </div>
              ) : (
                // Display real achievements from backend
                achievements.slice(0, 5).map((achievement) => (
                  <div 
                    key={achievement._id} 
                    className="hom-0330-achievement-item"
                    onClick={() => navigate(`/achievements/${achievement._id}`)}
                  >
                    <span className="hom-0330-achievement-icon">
                      {achievement.icon || '🏆'}
                    </span>
                    <div className="hom-0330-achievement-info">
                      <h5>{achievement.title}</h5>
                      <p>
                        {achievement.category.replace('_', ' ')} • {achievement.year}
                      </p>
                      {achievement.isMajor && (
                        <span className="hom-0330-major-badge-small">⭐ Major</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <PlatformStatsWidget />
        </aside>
      </div>
      {/* EDIT POST MODAL */}
      {showEditModal && editingPost && (
        <div className="hom-0330-create-post-modal" onClick={() => setShowEditModal(false)}>
          <div className="hom-0330-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="hom-0330-modal-header">
              <h3>Edit Post</h3>
              <button 
                className="hom-0330-close-btn"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="hom-0330-modal-body">
              <div className="hom-0330-modal-user-info">
                <img 
                  src={getAvatarUrl(currentUser?.avatar, `${currentUser?.firstName} ${currentUser?.lastName}`, 40)} 
                  alt="User"
                  className="hom-0330-modal-avatar"
                />
                <div>
                  <h4>{currentUser?.firstName} {currentUser?.lastName}</h4>
                </div>
              </div>
              <textarea
                placeholder="What's on your mind?"
                value={editPostContent}
                onChange={(e) => setEditPostContent(e.target.value)}
                rows="6"
                className="hom-0330-post-textarea"
                autoFocus
              />
            </div>
            <div className="hom-0330-modal-footer">
              <button 
                className="hom-0330-btn-post"
                onClick={handleUpdatePost}
                disabled={!editPostContent.trim()}
              >
                Update Post
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ADD THIS BEFORE THE CLOSING TAG */}
      {showMediaViewer && (
        <MediaViewer
          post={selectedPost}
          initialMediaIndex={selectedMediaIndex}
          isOpen={showMediaViewer}
          onClose={() => setShowMediaViewer(false)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default HomePage;