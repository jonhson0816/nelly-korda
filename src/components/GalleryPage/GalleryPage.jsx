import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';
import './GalleryPage.css';

const GalleryPage = ({ token }) => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [media, setMedia] = useState([]);
  const [filteredMedia, setFilteredMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [albums, setAlbums] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [user, setUser] = useState(null);


  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchGalleryData();
  }, [userId]);

  useEffect(() => {
    filterMedia();
  }, [activeTab, media]);

  const fetchGalleryData = async () => {
    try {
      setLoading(true);
      const endpoint = userId 
        ? `${API_URL}/gallery/user/${userId}`
        : `${API_URL}/gallery`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMedia(response.data.media || []);
      setUser(response.data.user);

      // Fetch albums if needed
      if (activeTab === 'albums') {
        const albumsEndpoint = userId 
          ? `${API_URL}/gallery/albums/user/${userId}`
          : `${API_URL}/gallery/albums`;
        
        const albumsRes = await axios.get(albumsEndpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAlbums(albumsRes.data.albums || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      setLoading(false);
    }
  };

  const filterMedia = () => {
    switch (activeTab) {
      case 'photos':
        setFilteredMedia(media.filter(item => item.type === 'image'));
        break;
      case 'videos':
        setFilteredMedia(media.filter(item => item.type === 'video'));
        break;
      case 'all':
      default:
        setFilteredMedia(media);
        break;
    }
  };

  const openLightbox = (item, index) => {
    setSelectedMedia(item);
    setCurrentIndex(index);
    setShowLightbox(true);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    setSelectedMedia(null);
  };

  const navigateMedia = (direction) => {
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % filteredMedia.length
      : (currentIndex - 1 + filteredMedia.length) % filteredMedia.length;
    
    setCurrentIndex(newIndex);
    setSelectedMedia(filteredMedia[newIndex]);
  };

  const handleKeyPress = (e) => {
    if (!showLightbox) return;
    if (e.key === 'ArrowRight') navigateMedia('next');
    if (e.key === 'ArrowLeft') navigateMedia('prev');
    if (e.key === 'Escape') closeLightbox();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showLightbox, currentIndex]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="gallery-loading">
        <div className="spinner"></div>
        <p>Loading gallery...</p>
      </div>
    );
  }

  return (
    <div className="gallery-page">
      <div className="gallery-container">
        {/* HEADER */}
        <div className="gallery-header">
          <div className="gallery-header-left">
            <button 
              className="back-btn"
              onClick={() => navigate(userId ? `/profile/${user?.username}` : '/profile')}
            >
              ← Back to Profile
            </button>
            <div className="gallery-title">
              <h1>Photos & Videos</h1>
              {user && (
                <p className="gallery-subtitle">
                  {user.firstName} {user.lastName}'s Gallery
                </p>
              )}
            </div>
          </div>
          <div className="gallery-stats">
            <div className="stat-item">
              <span className="stat-value">
                {media.filter(m => m.type === 'image').length}
              </span>
              <span className="stat-label">Photos</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {media.filter(m => m.type === 'video').length}
              </span>
              <span className="stat-label">Videos</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{media.length}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="gallery-tabs">
          <button
            className={`gallery-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <span className="tab-icon">📂</span>
            All Media
          </button>
          <button
            className={`gallery-tab ${activeTab === 'photos' ? 'active' : ''}`}
            onClick={() => setActiveTab('photos')}
          >
            <span className="tab-icon">📸</span>
            Photos ({media.filter(m => m.type === 'image').length})
          </button>
          <button
            className={`gallery-tab ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            <span className="tab-icon">🎬</span>
            Videos ({media.filter(m => m.type === 'video').length})
          </button>
          <button
            className={`gallery-tab ${activeTab === 'albums' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('albums');
              fetchGalleryData();
            }}
          >
            <span className="tab-icon">📅</span>
            Albums
          </button>
        </div>

        {/* CONTENT */}
        {activeTab === 'albums' ? (
          // ALBUMS VIEW
          <div className="albums-grid">
            {albums.length > 0 ? (
              albums.map((album) => (
                <div 
                  key={album.id} 
                  className="album-card"
                  onClick={() => {
                    setActiveTab('all');
                    // Could add filtering by date range here
                  }}
                >
                  <div className="album-cover">
                    {album.coverPhoto ? (
                      <img src={album.coverPhoto} alt={album.name} />
                    ) : (
                      <div className="album-placeholder">
                        <span className="album-icon">📁</span>
                      </div>
                    )}
                    <div className="album-overlay">
                      <span className="album-count">
                        {album.photos + album.videos} items
                      </span>
                    </div>
                  </div>
                  <div className="album-info">
                    <h3 className="album-name">{album.name}</h3>
                    <p className="album-stats">
                      {album.photos} photos, {album.videos} videos
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span className="icon">📅</span>
                <h3>No albums yet</h3>
                <p>Albums will be created automatically as you add media</p>
              </div>
            )}
          </div>
        ) : (
          // MEDIA GRID
          <div className="gallery-grid">
            {filteredMedia.length > 0 ? (
              filteredMedia.map((item, index) => (
                <div
                  key={item._id}
                  className="gallery-item"
                  onClick={() => openLightbox(item, index)}
                >
                  {item.type === 'video' ? (
                    <>
                      <video src={item.url} />
                      <div className="video-overlay">
                        <span className="play-icon">▶</span>
                      </div>
                    </>
                  ) : (
                    <img src={item.url} alt={item.caption || 'Media'} />
                  )}
                  {item.caption && (
                    <div className="media-overlay">
                      <p className="media-caption">{item.caption}</p>
                    </div>
                  )}
                  {item.source === 'post' && (
                    <button
                      className="view-post-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/post/${item.sourceId}`);
                      }}
                    >
                      View Post
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span className="icon">
                  {activeTab === 'photos' ? '📸' : activeTab === 'videos' ? '🎬' : '📂'}
                </span>
                <h3>No {activeTab === 'all' ? 'media' : activeTab} yet</h3>
                <p>
                  {activeTab === 'photos' 
                    ? 'Photos from your posts and profile will appear here'
                    : activeTab === 'videos'
                    ? 'Videos from your posts and profile will appear here'
                    : 'Your photos and videos will appear here'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* LIGHTBOX */}
      {showLightbox && selectedMedia && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>
              ✕
            </button>

            {filteredMedia.length > 1 && (
              <>
                <button
                  className="lightbox-nav lightbox-prev"
                  onClick={() => navigateMedia('prev')}
                >
                  ‹
                </button>
                <button
                  className="lightbox-nav lightbox-next"
                  onClick={() => navigateMedia('next')}
                >
                  ›
                </button>
              </>
            )}

            <div className="lightbox-content">
              <div className="lightbox-media">
                {selectedMedia.type === 'video' ? (
                  <video src={selectedMedia.url} controls autoPlay />
                ) : (
                  <img src={selectedMedia.url} alt={selectedMedia.caption} />
                )}
              </div>

              <div className="lightbox-sidebar">
                <div className="lightbox-header">
                  <div className="lightbox-user">
                    <img
                      src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`}
                      alt={user?.firstName}
                      className="user-avatar"
                    />
                    <div>
                      <h4>{user?.firstName} {user?.lastName}</h4>
                      <p className="media-date">
                        {formatDate(selectedMedia.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedMedia.caption && (
                  <div className="lightbox-caption">
                    <p>{selectedMedia.caption}</p>
                  </div>
                )}

                {selectedMedia.location && (
                  <div className="lightbox-location">
                    <span className="location-icon">📍</span>
                    {selectedMedia.location.name}
                  </div>
                )}

                <div className="lightbox-info">
                  <div className="info-item">
                    <span className="info-label">Source:</span>
                    <span className="info-value">
                      {selectedMedia.source === 'post' ? 'Post' : 'Profile Gallery'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Type:</span>
                    <span className="info-value">
                      {selectedMedia.type === 'image' ? 'Photo' : 'Video'}
                    </span>
                  </div>
                  {selectedMedia.width && selectedMedia.height && (
                    <div className="info-item">
                      <span className="info-label">Dimensions:</span>
                      <span className="info-value">
                        {selectedMedia.width} × {selectedMedia.height}
                      </span>
                    </div>
                  )}
                </div>

                {selectedMedia.source === 'post' && (
                  <button
                    className="view-original-post"
                    onClick={() => navigate(`/post/${selectedMedia.sourceId}`)}
                  >
                    View Original Post
                  </button>
                )}

                <div className="lightbox-counter">
                  {currentIndex + 1} of {filteredMedia.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;