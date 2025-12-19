import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config/api';
import './MediaViewer.css';

// Pass token as prop or use React context
const MediaViewer = ({ post, initialMediaIndex = 0, isOpen, onClose, currentUser, token }) => {
  const [currentIndex, setCurrentIndex] = useState(initialMediaIndex);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [reactions, setReactions] = useState([]);
  const [showReactions, setShowReactions] = useState(false);
  const [mediaReactions, setMediaReactions] = useState({});


  const reactionEmojis = {
    like: '👍',
    love: '❤️',
    haha: '😂',
    wow: '😮',
    sad: '😢',
    angry: '😠'
  };

  useEffect(() => {
    if (isOpen && post && post.media[currentIndex]) {
      fetchMediaComments();
      fetchMediaReactions();
    }
  }, [currentIndex, isOpen]);

  const fetchMediaComments = async () => {
    if (!currentUser?.isAdmin) {
      setComments([]);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/posts/${post._id}/media/${currentIndex}/comments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching media comments:', error);
    }
  };

  const fetchMediaReactions = async () => {
    try {
      const response = await fetch(
        `${API_URL}/posts/${post._id}/media/${currentIndex}/reactions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setReactions(data.reactions || []);
      
      const userReaction = data.reactions?.find(
        r => r.user._id === currentUser?.id
      );
      setMediaReactions(prev => ({
        ...prev,
        [currentIndex]: {
          myReaction: userReaction?.reaction,
          count: data.count
        }
      }));
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const handleReact = async (reaction) => {
    try {
      const response = await fetch(
        `${API_URL}/posts/${post._id}/media/${currentIndex}/react`,
        {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ reaction })
        }
      );
      const data = await response.json();

      setMediaReactions(prev => ({
        ...prev,
        [currentIndex]: {
          myReaction: data.liked ? reaction : null,
          count: data.likesCount
        }
      }));
      
      fetchMediaReactions();
      setShowReactionPicker(false);
    } catch (error) {
      console.error('Error reacting:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const response = await fetch(
        `${API_URL}/posts/${post._id}/media/${currentIndex}/comments`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({
            content: commentText,
            parentCommentId: replyingTo
          })
        }
      );
      const data = await response.json();

      if (data.success) {
        setCommentText('');
        setReplyingTo(null);
        fetchMediaComments();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleNext = () => {
    if (currentIndex < post.media.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await fetch(
        `${API_URL}/posts/media-comments/${commentId}/like`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchMediaComments();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now - commentDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return commentDate.toLocaleDateString();
  };

  if (!isOpen || !post) return null;

  const currentMedia = post.media[currentIndex];
  const mediaReactionData = mediaReactions[currentIndex] || { myReaction: null, count: 0 };

  return (
    <div className="media-viewer-overlay">
      {/* Back/Close Button */}
      <button className="media-viewer-back" onClick={onClose} aria-label="Back">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </button>

      {/* Close Button */}
      <button className="media-viewer-close" onClick={onClose} aria-label="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>

      {/* Navigation Buttons */}
      {currentIndex > 0 && (
        <button className="media-viewer-nav media-viewer-nav-prev" onClick={handlePrev} aria-label="Previous">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
      )}

      {currentIndex < post.media.length - 1 && (
        <button className="media-viewer-nav media-viewer-nav-next" onClick={handleNext} aria-label="Next">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
      )}

      {/* Main Container */}
      <div className="media-viewer-container">
        {/* Media Section */}
        <div className="media-viewer-media-section">
          <div className="media-viewer-media-wrapper">
            {currentMedia.type === 'video' ? (
              <video
                src={currentMedia.url}
                controls
                autoPlay
                className="media-viewer-video"
              />
            ) : (
              <img
                src={currentMedia.url}
                alt={`Media ${currentIndex + 1}`}
                className="media-viewer-image"
              />
            )}
          </div>

          {/* Media Counter */}
          <div className="media-viewer-counter">
            {currentIndex + 1} / {post.media.length}
          </div>
        </div>

        {/* Sidebar */}
        <div className="media-viewer-sidebar">
          {/* Header */}
          <div className="media-viewer-header">
            <img
              src={post.author?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.firstName || 'User')}&size=40&background=1877f2&color=fff`}
              alt={post.author?.firstName}
              className="media-viewer-author-avatar"
            />
            <div className="media-viewer-author-info">
              <h3 className="media-viewer-author-name">
                {post.author?.firstName} {post.author?.lastName}
                {post.author?.isAdmin && <span className="verified-badge">✓</span>}
              </h3>
              <p className="media-viewer-post-time">
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>

          {/* Reactions Summary */}
          <div className="media-viewer-reactions-summary">
            <div className="reactions-left">
              <span className="reaction-icon">👍</span>
              <span className="reaction-icon">❤️</span>
              <span className="reaction-icon">😂</span>
              <span
                className="reaction-count"
                onClick={() => setShowReactions(!showReactions)}
              >
                {mediaReactionData.count || 0}
              </span>
            </div>
            <span className="comments-count">
              {currentMedia.commentsCount || 0} comments
            </span>
          </div>

          {/* Action Buttons */}
          <div className="media-viewer-actions">
            <div className="action-btn-wrapper">
              <button
                className={`action-btn ${mediaReactionData.myReaction ? 'active' : ''}`}
                onClick={() => mediaReactionData.myReaction ? handleReact(mediaReactionData.myReaction) : setShowReactionPicker(!showReactionPicker)}
                onMouseEnter={() => setShowReactionPicker(true)}
                onMouseLeave={() => setTimeout(() => setShowReactionPicker(false), 300)}
              >
                <span className="action-icon">
                  {mediaReactionData.myReaction ? reactionEmojis[mediaReactionData.myReaction] : '👍'}
                </span>
                <span className="action-text">
                  {mediaReactionData.myReaction ? mediaReactionData.myReaction.charAt(0).toUpperCase() + mediaReactionData.myReaction.slice(1) : 'Like'}
                </span>
              </button>

              {showReactionPicker && (
                <div
                  className="reaction-picker"
                  onMouseEnter={() => setShowReactionPicker(true)}
                  onMouseLeave={() => setShowReactionPicker(false)}
                >
                  {Object.entries(reactionEmojis).map(([key, emoji]) => (
                    <button
                      key={key}
                      className="reaction-option"
                      onClick={() => handleReact(key)}
                      title={key.charAt(0).toUpperCase() + key.slice(1)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="action-btn">
              <span className="action-icon">💬</span>
              <span className="action-text">Comment</span>
            </button>

            <button className="action-btn">
              <span className="action-icon">↗️</span>
              <span className="action-text">Share</span>
            </button>
          </div>

          {/* Comments Section */}
          <div className="media-viewer-comments">
            {post.caption && (
              <div className="post-caption-section">
                <img
                  src={post.author?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.firstName || 'User')}&size=32&background=1877f2&color=fff`}
                  alt={post.author?.firstName}
                  className="comment-avatar"
                />
                <div className="comment-content">
                  <div className="comment-bubble">
                    <span className="comment-author">{post.author?.firstName} {post.author?.lastName}</span>
                    <p className="comment-text">{post.caption}</p>
                  </div>
                </div>
              </div>
            )}

            {comments.length === 0 ? (
              <div className="empty-comments">
                <div className="empty-icon">💬</div>
                <p className="empty-text">No comments yet</p>
                <p className="empty-subtext">Be the first to comment</p>
              </div>
            ) : (
              <div className="comments-list">
                {comments.map((comment) => (
                  <div key={comment._id} className="comment-item">
                    <img
                      src={comment.author?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author?.firstName || 'User')}&size=32&background=1877f2&color=fff`}
                      alt={comment.author?.firstName}
                      className="comment-avatar"
                    />
                    <div className="comment-content">
                      <div className="comment-bubble">
                        <h4 className="comment-author">
                          {comment.author?.firstName} {comment.author?.lastName}
                        </h4>
                        <p className="comment-text">{comment.content}</p>
                      </div>
                      <div className="comment-actions">
                        <button
                          className={`comment-action ${comment.isLikedByMe ? 'active' : ''}`}
                          onClick={() => handleLikeComment(comment._id)}
                        >
                          Like
                        </button>
                        <button
                          className="comment-action"
                          onClick={() => setReplyingTo(comment._id)}
                        >
                          Reply
                        </button>
                        <span className="comment-time">{formatDate(comment.createdAt)}</span>
                        {comment.likesCount > 0 && (
                          <span className="comment-likes">👍 {comment.likesCount}</span>
                        )}
                      </div>

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="comment-replies">
                          {comment.replies.map((reply) => (
                            <div key={reply._id} className="comment-item reply">
                              <img
                                src={reply.author?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.author?.firstName || 'User')}&size=28&background=1877f2&color=fff`}
                                alt={reply.author?.firstName}
                                className="comment-avatar reply-avatar"
                              />
                              <div className="comment-content">
                                <div className="comment-bubble">
                                  <h4 className="comment-author">
                                    {reply.author?.firstName} {reply.author?.lastName}
                                  </h4>
                                  <p className="comment-text">{reply.content}</p>
                                </div>
                                <div className="comment-actions">
                                  <button className="comment-action">Like</button>
                                  <button className="comment-action">Reply</button>
                                  <span className="comment-time">{formatDate(reply.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comment Input */}
          {token && (
            <div className="media-viewer-comment-input">
              {replyingTo && (
                <div className="replying-to">
                  <span>Replying to comment</span>
                  <button onClick={() => setReplyingTo(null)} className="cancel-reply">
                    Cancel
                  </button>
                </div>
              )}
              <div className="comment-input-wrapper">
                <img
                  src={currentUser?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.firstName || 'User')}&size=32&background=1877f2&color=fff`}
                  alt={currentUser?.firstName}
                  className="comment-avatar"
                />
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleComment(e)}
                  className="comment-input"
                />
                <button
                  onClick={handleComment}
                  disabled={!commentText.trim()}
                  className="comment-submit"
                  aria-label="Send comment"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaViewer;