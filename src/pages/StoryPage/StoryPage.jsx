import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';
import axios from 'axios';
import './StoryPage.css';

const StoryPage = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [currentStory, setCurrentStory] = useState(null);
  const [allStories, setAllStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0); // For multiple media items
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [viewers, setViewers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  
  const progressIntervalRef = useRef(null);
  const storyDuration = 5000; // 5 seconds per media item
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStories();
    checkIfAdmin();
  }, [storyId]);

  useEffect(() => {
    if (currentStory && !isPaused) {
      startProgress();
      recordView();
    }
    return () => clearInterval(progressIntervalRef.current);
  }, [currentStory, isPaused, currentIndex, currentMediaIndex]);

  // Check if current user is admin
  const checkIfAdmin = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsAdmin(response.data.user.isAdmin || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  // Fetch all active stories
  const fetchStories = async () => {
    try {
      const response = await axios.get(`${API_URL}/stories`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const stories = response.data.stories || [];
      setAllStories(stories);

      // Find the story to display
      if (storyId) {
        const index = stories.findIndex(s => s._id === storyId);
        if (index !== -1) {
          setCurrentIndex(index);
          setCurrentStory(stories[index]);
        } else {
          setCurrentStory(stories[0]);
        }
      } else {
        setCurrentStory(stories[0]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setLoading(false);
    }
  };

  // Start progress bar animation
  const startProgress = () => {
    clearInterval(progressIntervalRef.current);
    setProgress(0);
    
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / storyDuration) * 100;
      
      if (newProgress >= 100) {
        nextMediaOrStory();
      } else {
        setProgress(newProgress);
      }
    }, 50);
  };

  // Record story view
  const recordView = async () => {
    if (!currentStory) return;
    
    try {
      await axios.post(
        `${API_URL}/stories/${currentStory._id}/view`,
        { viewDuration: 0, completed: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  // Fetch viewers list (admin only)
  const fetchViewers = async () => {
    if (!currentStory || !isAdmin) return;
    
    try {
      const response = await axios.get(
        `${API_URL}/stories/${currentStory._id}/analytics`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setViewers(response.data.analytics.viewers || []);
    } catch (error) {
      console.error('Error fetching viewers:', error);
    }
  };

  // Navigate to next media item or story
  const nextMediaOrStory = () => {
    // If story has multiple media items
    if (currentStory.mediaItems && currentStory.mediaItems.length > 0) {
      if (currentMediaIndex < currentStory.mediaItems.length - 1) {
        // Go to next media item in same story
        setCurrentMediaIndex(currentMediaIndex + 1);
        setProgress(0);
        return;
      }
    }
    
    // Go to next story
    if (currentIndex < allStories.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentStory(allStories[nextIndex]);
      setCurrentMediaIndex(0);
      setProgress(0);
    } else {
      navigate('/');
    }
  };

  // Navigate to previous media item or story
  const previousMediaOrStory = () => {
    // If not at first media item, go to previous media
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
      setProgress(0);
      return;
    }
    
    // Go to previous story
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentStory(allStories[prevIndex]);
      
      // Go to last media item of previous story
      const prevStory = allStories[prevIndex];
      if (prevStory.mediaItems && prevStory.mediaItems.length > 0) {
        setCurrentMediaIndex(prevStory.mediaItems.length - 1);
      } else {
        setCurrentMediaIndex(0);
      }
      setProgress(0);
    }
  };

  // Like story
  const handleLike = async () => {
    if (!currentStory) return;
    
    try {
      await axios.post(
        `${API_URL}/stories/${currentStory._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCurrentStory(prev => ({
        ...prev,
        hasLiked: true,
        stats: { ...prev.stats, totalLikes: (prev.stats?.totalLikes || 0) + 1 }
      }));
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  // Submit comment
  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !currentStory) return;
    
    try {
      await axios.post(
        `${API_URL}/stories/${currentStory._id}/comment`,
        { text: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setComment('');
      setShowComments(false);
      setIsPaused(false);
      alert('Comment sent!');
    } catch (error) {
      console.error('Error commenting:', error);
    }
  };

  // Share story
  const handleShare = async () => {
    if (!currentStory) return;
    
    try {
      await axios.post(
        `${API_URL}/stories/${currentStory._id}/share`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Story shared!');
    } catch (error) {
      console.error('Error sharing story:', error);
    }
  };

  // Handle viewers click (admin only)
  const handleViewersClick = () => {
    if (isAdmin) {
      setShowViewers(true);
      fetchViewers();
      setIsPaused(true);
    }
  };

  // Format time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const storyDate = new Date(date);
    const diffMs = now - storyDate;
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours === 1) return '1h ago';
    if (diffHours < 24) return `${diffHours}h ago`;
    return storyDate.toLocaleDateString();
  };

  // Get avatar URL
  const getAvatarUrl = (avatarObj, name = 'User') => {
    if (avatarObj?.url) return avatarObj.url;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1877f2&color=fff&size=80`;
  };

  // Get total number of segments (for progress bars)
  const getTotalSegments = () => {
    if (!currentStory) return 1;
    if (currentStory.mediaItems && currentStory.mediaItems.length > 0) {
      return currentStory.mediaItems.length;
    }
    return 1; // For text-only stories
  };

  // Render story content based on type
  const renderStoryContent = () => {
    if (!currentStory) return null;

    // Text-only story
    if (currentStory.storyType === 'text' && currentStory.textContent) {
      const { text, fontSize, fontFamily, textColor, textAlign, backgroundColor, gradient } = currentStory.textContent;
      
      return (
        <div 
          className="story-text-content"
          style={{
            background: gradient || backgroundColor || '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            height: '100%',
            position: 'relative',
          }}
        >
          <p style={{
            fontSize: fontSize === 'small' ? '24px' : fontSize === 'large' ? '48px' : '36px',
            fontFamily: fontFamily || 'Arial',
            color: textColor || '#FFFFFF',
            textAlign: textAlign || 'center',
            margin: 0,
            wordWrap: 'break-word',
            maxWidth: '90%',
          }}>
            {text}
          </p>
          
          {/* Render stickers */}
          {currentStory.stickers && currentStory.stickers.map((sticker, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: `${sticker.position.x}%`,
                top: `${sticker.position.y}%`,
                fontSize: `${sticker.size}px`,
                transform: `rotate(${sticker.rotation}deg)`,
              }}
            >
              {sticker.content}
            </div>
          ))}
        </div>
      );
    }

    // Media story (image/video)
    if (currentStory.mediaItems && currentStory.mediaItems.length > 0) {
      const currentMedia = currentStory.mediaItems[currentMediaIndex];
      
      return (
        <div className="story-media-wrapper">
          {currentMedia.mediaType === 'video' ? (
            <video
              src={currentMedia.mediaUrl}
              autoPlay
              muted
              playsInline
              className="story-media"
            />
          ) : (
            <img
              src={currentMedia.mediaUrl}
              alt="Story"
              className="story-media"
            />
          )}
          
          {/* Story Caption */}
          {currentStory.caption && (
            <div className="story-caption">
              <p>{currentStory.caption}</p>
            </div>
          )}
          
          {/* Render stickers on media */}
          {currentStory.stickers && currentStory.stickers.map((sticker, idx) => (
            <div
              key={idx}
              className="story-sticker"
              style={{
                position: 'absolute',
                left: `${sticker.position.x}%`,
                top: `${sticker.position.y}%`,
                fontSize: `${sticker.size}px`,
                transform: `rotate(${sticker.rotation}deg)`,
              }}
            >
              {sticker.content}
            </div>
          ))}
        </div>
      );
    }

    // Fallback for old single-media stories
    if (currentStory.mediaUrl) {
      return (
        <>
          {currentStory.mediaType === 'video' ? (
            <video
              src={currentStory.mediaUrl}
              autoPlay
              muted
              playsInline
              className="story-media"
            />
          ) : (
            <img
              src={currentStory.mediaUrl}
              alt="Story"
              className="story-media"
            />
          )}
          
          {currentStory.caption && (
            <div className="story-caption">
              <p>{currentStory.caption}</p>
            </div>
          )}
        </>
      );
    }

    return <div className="story-no-content">No content available</div>;
  };

  // Loading state
  if (loading) {
    return (
      <div className="story-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // No stories state
  if (!currentStory) {
    return (
      <div className="story-not-found">
        <h2>No stories available</h2>
        <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    );
  }

  const totalSegments = getTotalSegments();

  return (
    <div className="story-page">
      {/* Progress Bars at Top - Show segments for current story */}
      <div className="story-progress-bars">
        {Array.from({ length: totalSegments }).map((_, idx) => (
          <div key={idx} className="progress-bar-container">
            <div 
              className="progress-bar-fill"
              style={{
                width: idx < currentMediaIndex ? '100%' : 
                       idx === currentMediaIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Story Header */}
      <div className="story-header">
        <div className="story-author">
          <img 
            src={getAvatarUrl(
              currentStory.author?.avatar,
              `${currentStory.author?.firstName} ${currentStory.author?.lastName}`
            )}
            alt={currentStory.author?.firstName}
            className="story-author-avatar"
          />
          <div className="story-author-info">
            <h4>{currentStory.author?.firstName} {currentStory.author?.lastName}</h4>
            <p>{getTimeAgo(currentStory.createdAt)}</p>
          </div>
        </div>
        
        <div className="story-header-actions">
          <button 
            className="story-header-btn"
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Play' : 'Pause'}
          >
            {isPaused ? '▶️' : '⏸️'}
          </button>
          <button 
            className="story-header-btn"
            onClick={() => navigate('/')}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Story Content - Click to navigate or pause */}
      <div 
        className="story-content"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          
          // Left third: previous
          if (x < rect.width / 3) {
            previousMediaOrStory();
          } 
          // Right third: next
          else if (x > (rect.width * 2) / 3) {
            nextMediaOrStory();
          } 
          // Middle: pause/play
          else {
            setIsPaused(!isPaused);
          }
        }}
      >
        {renderStoryContent()}
      </div>

      {/* Story Footer */}
      <div className="story-footer">
        {/* View Count - Always visible, clickable for admin */}
        <div 
          className="story-views"
          onClick={handleViewersClick}
          style={{ cursor: isAdmin ? 'pointer' : 'default' }}
          title={isAdmin ? 'Click to see who viewed' : 'Total views'}
        >
          <span className="icon">👁️</span>
          <span>{currentStory.stats?.totalViews || 0} views</span>
        </div>

        {/* Action Buttons */}
        <div className="story-actions">
          <button 
            className={`story-action-btn ${currentStory.hasLiked ? 'liked' : ''}`}
            onClick={handleLike}
            title="Like"
          >
            <span className="icon">❤️</span>
            <span>{currentStory.stats?.totalLikes || 0}</span>
          </button>
          
          <button 
            className="story-action-btn"
            onClick={() => {
              setShowComments(true);
              setIsPaused(true);
            }}
            title="Comment"
          >
            <span className="icon">💬</span>
            <span>{currentStory.stats?.totalComments || 0}</span>
          </button>
          
          <button 
            className="story-action-btn"
            onClick={handleShare}
            title="Share"
          >
            <span className="icon">↗️</span>
          </button>
        </div>
      </div>

      {/* Viewers Modal - Admin Only */}
      {showViewers && isAdmin && (
        <div 
          className="story-modal-overlay" 
          onClick={() => {
            setShowViewers(false);
            setIsPaused(false);
          }}
        >
          <div className="story-modal" onClick={(e) => e.stopPropagation()}>
            <div className="story-modal-header">
              <h3>Viewers</h3>
              <button onClick={() => {
                setShowViewers(false);
                setIsPaused(false);
              }}>
                ✕
              </button>
            </div>
            <div className="story-modal-content">
              {viewers.length === 0 ? (
                <p className="no-viewers">No viewers yet</p>
              ) : (
                <div className="viewers-list">
                  {viewers.map((viewer, idx) => (
                    <div key={idx} className="viewer-item">
                      <img 
                        src={getAvatarUrl(viewer.user?.avatar, viewer.user?.firstName)}
                        alt={viewer.user?.firstName}
                      />
                      <div className="viewer-info">
                        <h4>{viewer.user?.firstName} {viewer.user?.lastName}</h4>
                        <p>{getTimeAgo(viewer.viewedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showComments && (
        <div 
          className="story-modal-overlay" 
          onClick={() => {
            setShowComments(false);
            setIsPaused(false);
          }}
        >
          <div 
            className="story-modal comment-modal" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="story-modal-header">
              <h3>Send Message</h3>
              <button onClick={() => {
                setShowComments(false);
                setIsPaused(false);
              }}>
                ✕
              </button>
            </div>
            <div className="comment-form">
              <input
                type="text"
                placeholder="Send a message..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleComment(e);
                  }
                }}
                autoFocus
              />
              <button 
                onClick={handleComment}
                disabled={!comment.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Hints */}
      <div 
        className="story-nav-hint left" 
        onClick={previousMediaOrStory}
        style={{ visibility: (currentIndex > 0 || currentMediaIndex > 0) ? 'visible' : 'hidden' }}
      >
        ◀
      </div>
      <div 
        className="story-nav-hint right" 
        onClick={nextMediaOrStory}
        style={{ 
          visibility: (currentIndex < allStories.length - 1 || currentMediaIndex < totalSegments - 1) ? 'visible' : 'hidden' 
        }}
      >
        ▶
      </div>
    </div>
  );
};

export default StoryPage;