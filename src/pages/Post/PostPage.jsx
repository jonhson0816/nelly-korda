import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import MediaViewer from '../../components/MediaViewer/MediaViewer';
import { API_URL } from '../../config/api';
import axios from 'axios';
import './PostPage.css';

const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const commentsRef = useRef(null);
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [showAllComments, setShowAllComments] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [editPostContent, setEditPostContent] = useState('');
  const [showCommentMenu, setShowCommentMenu] = useState(null); // Track which comment menu is open
  const [showEditCommentModal, setShowEditCommentModal] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPost();
    }
  }, [id, user]);

  // Auto-scroll to comments if hash is #comments
  useEffect(() => {
    if (location.hash === '#comments' && commentsRef.current && !loading) {
      setTimeout(() => {
        commentsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setShowAllComments(true);
      }, 500);
    }
  }, [location.hash, loading, comments]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showPostMenu && !e.target.closest('.post-menu-wrapper')) {
        setShowPostMenu(false);
      }
      if (showCommentMenu && !e.target.closest('.comment-menu-wrapper')) {
        setShowCommentMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showPostMenu, showCommentMenu]);

  const fetchUser = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const fetchPost = async () => {
    try {
      const response = await axios.get(`${API_URL}/posts/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      setPost(response.data.post);
      setLoading(false);
      
      // Fetch comments after post is loaded
      fetchComments();
    } catch (error) {
      console.error('Error fetching post:', error);
      setLoading(false);
    }
  };

  const fetchComments = async () => {
  // REMOVED ADMIN CHECK - Let backend handle authorization
  setCommentsLoading(true);
  try {
    const response = await axios.get(`${API_URL}/posts/${id}/comments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Fetched comments:', response.data);
    
    if (response.data.success && response.data.comments) {
      // Separate parent comments and replies
      const parentComments = response.data.comments.filter(c => !c.parentComment);
      const replies = response.data.comments.filter(c => c.parentComment);
      
      // Build comments tree with replies
      const commentsWithReplies = parentComments.map(comment => ({
        ...comment,
        replies: replies.filter(r => r.parentComment === comment._id)
      }));
      
      console.log('Comments with replies:', commentsWithReplies);
      setComments(commentsWithReplies);
    } else {
      setComments([]);
    }
  } catch (error) {
    console.error('Error fetching comments:', error);
    if (error.response?.status === 403) {
      console.log('Access denied to comments');
      setComments([]);
    }
  } finally {
    setCommentsLoading(false);
  }
};

  const handleLike = async () => {
    if (!token) {
      alert('Please login to like posts');
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/posts/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setPost(prev => ({
          ...prev,
          likesCount: response.data.likesCount,
          isLikedByMe: response.data.liked
        }));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleShare = async () => {
    if (!token) {
      alert('Please login to share posts');
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/posts/${id}/share`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setPost(prev => ({
          ...prev,
          sharesCount: response.data.sharesCount
        }));
        
        setShowShareModal(false);
        alert('Post shared successfully!');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please login to comment');
      return;
    }

    if (!commentText.trim()) return;

    try {
      const response = await axios.post(
        `${API_URL}/posts/${id}/comments`,
        {
          content: commentText,
          parentCommentId: replyingTo
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCommentText('');
        setReplyingTo(null);
        
        // Refresh post and comments
        await fetchPost();
        
        // Auto-expand comments after posting
        setShowAllComments(true);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    }
  };

  const handleCommentLike = async (commentId) => {
    if (!token) {
      alert('Please login to like comments');
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setComments(prevComments => prevComments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              likesCount: response.data.likesCount,
              isLikedByMe: response.data.liked
            };
          }
          
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply =>
                reply._id === commentId
                  ? {
                      ...reply,
                      likesCount: response.data.likesCount,
                      isLikedByMe: response.data.liked
                    }
                  : reply
              )
            };
          }
          
          return comment;
        }));
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_URL}/posts/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Post deleted successfully');
        navigate('/'); // Redirect to home
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(error.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleEditPost = () => {
    setEditPostContent(post.caption || '');
    setShowEditPostModal(true);
    setShowPostMenu(false);
  };

  const handleUpdatePost = async () => {
    if (!editPostContent.trim()) {
      alert('Please add some content');
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/posts/${id}`,
        { caption: editPostContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setPost(prev => ({ ...prev, caption: editPostContent }));
        setShowEditPostModal(false);
        alert('Post updated successfully');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert(error.response?.data?.message || 'Failed to update post');
    }
  };

  const handleDeleteComment = async (commentId, isReply = false, parentCommentId = null) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_URL}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Refresh comments and post
        await fetchComments();
        await fetchPost();
        setShowCommentMenu(null);
        alert('Comment deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert(error.response?.data?.message || 'Failed to delete comment');
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setEditCommentContent(comment.content);
    setShowEditCommentModal(true);
    setShowCommentMenu(null);
  };

  const handleUpdateComment = async () => {
    if (!editCommentContent.trim()) {
      alert('Please add some content');
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/comments/${editingComment._id}`,
        { content: editCommentContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Refresh comments
        await fetchComments();
        setShowEditCommentModal(false);
        setEditingComment(null);
        setEditCommentContent('');
        alert('Comment updated successfully');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert(error.response?.data?.message || 'Failed to update comment');
    }
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

  if (loading) {
    return (
      <div className="post-page-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-not-found">
        <h2>Post not found</h2>
        <button onClick={() => navigate('/')}>Back to Feed</button>
      </div>
    );
  }

  const openMediaViewer = (mediaIndex = 0) => {
    setSelectedMediaIndex(mediaIndex);
    setShowMediaViewer(true);
  };

  return (
    <div className="post-page">
      <div className="post-page-container">
        {/* Main Post Card */}
        <div className="post-card">
          {/* Post Header */}
          <div className="post-header">
            <div className="post-author">
              <img
                src={post.author?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.firstName || 'User')}&size=40&background=1877f2&color=fff`}
                alt={post.author?.firstName}
                className="author-avatar"
              />
              <div className="author-info">
                <h3 className="author-name">
                  {post.author?.firstName} {post.author?.lastName}
                  {post.author?.isAdmin && <span className="verified-badge">✓</span>}
                </h3>
                <p className="post-time">
                  {formatDate(post.createdAt)}
                  {post.location && (
                    <span className="post-location"> • 📍 {post.location.name}</span>
                  )}
                </p>
              </div>
            </div>
            
            {user?.isAdmin && (
              <div className="post-menu-wrapper">
                <button 
                  className="post-options-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPostMenu(!showPostMenu);
                  }}
                >
                  ⋯
                </button>
                
                {showPostMenu && (
                  <div className="post-menu-dropdown">
                    <button 
                      className="menu-option"
                      onClick={handleEditPost}
                    >
                      <span className="menu-icon">✏️</span>
                      Edit Post
                    </button>
                    <button 
                      className="menu-option delete"
                      onClick={handleDeletePost}
                    >
                      <span className="menu-icon">🗑️</span>
                      Delete Post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Post Caption */}
          {post.caption && (
            <div className="post-caption">
              <p>{post.caption}</p>
              {post.tags && post.tags.length > 0 && (
                <div className="post-tags">
                  {post.tags.map((tag, idx) => (
                    <span key={idx} className="post-tag">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Post Media */}
          {post.media && post.media.length > 0 && (
            <div className={`post-media post-media-${post.media.length > 1 ? 'grid' : 'single'}`}>
              {post.media.map((item, idx) => (
                <div 
                  key={idx} 
                  className="media-item"
                  onClick={() => openMediaViewer(idx)}
                  style={{ cursor: 'pointer' }}
                >
                  {item.type === 'video' ? (
                    <video src={item.url} controls />
                  ) : (
                    <img src={item.url} alt={`Media ${idx + 1}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Engagement Stats */}
          <div className="post-stats">
            <div className="post-stats-left">
              {post.likesCount > 0 && (
                <span className="stat-item">
                  <span className="like-icon">👍</span>
                  {post.likesCount}
                </span>
              )}
            </div>
            <div className="post-stats-right">
              {post.commentsCount > 0 && (
                <span 
                  className="stat-item clickable"
                  onClick={() => {
                    setShowAllComments(true);
                    setTimeout(() => {
                      commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                >
                  {post.commentsCount} comment{post.commentsCount !== 1 ? 's' : ''}
                </span>
              )}
              {post.sharesCount > 0 && (
                <span className="stat-item">{post.sharesCount} shares</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="post-actions">
            <button
              className={`action-btn ${post.isLikedByMe ? 'active' : ''}`}
              onClick={handleLike}
            >
              <span className="action-icon">{post.isLikedByMe ? '👍' : '👍🏻'}</span>
              Like
            </button>
            <button 
              className="action-btn"
              onClick={() => {
                setShowAllComments(true);
                setTimeout(() => {
                  document.querySelector('.comment-input')?.focus();
                }, 100);
              }}
            >
              <span className="action-icon">💬</span>
              Comment
            </button>
            <button className="action-btn" onClick={() => setShowShareModal(true)}>
              <span className="action-icon">↗️</span>
              Share
            </button>
          </div>

          {/* Comment Input */}
          {token && (
            <div className="comment-input-section">
              <img
                src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || 'User')}&size=32&background=1877f2&color=fff`}
                alt={user?.firstName}
                className="comment-avatar"
              />
              <form onSubmit={handleComment} className="comment-form">
                <input
                  type="text"
                  placeholder={replyingTo ? 'Write a reply...' : 'Write a comment...'}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="comment-input"
                />
                <button type="submit" className="comment-submit-btn">
                  ➤
                </button>
              </form>
            </div>
          )}

          {/* Comments Section */}
          <div className="comments-section" ref={commentsRef}>
            <div className="comments-header">
              <h3 className="comments-title">
                {post.commentsCount > 0 ? `${post.commentsCount} Comment${post.commentsCount !== 1 ? 's' : ''}` : 'Comments'}
              </h3>
              {user?.isAdmin && comments.length > 0 && (
                <button 
                  className="toggle-comments-btn"
                  onClick={() => setShowAllComments(!showAllComments)}
                >
                  {showAllComments ? (
                    <>
                      <span>Hide comments</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>View all comments</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
            
            {commentsLoading ? (
              <div className="comments-loading">
                <div className="spinner"></div>
                <p>Loading comments...</p>
              </div>
            ) : !user?.isAdmin ? (
              <div className="no-comments">
                <div className="no-comments-icon">🔒</div>
                <p>Only admin can view comments</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="no-comments">
                <div className="no-comments-icon">💬</div>
                <p>No comments yet.</p>
                <p className="no-comments-sub">Be the first to comment!</p>
              </div>
            ) : (
              <>
                {showAllComments && (
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
                              className={`comment-action-btn ${comment.isLikedByMe ? 'active' : ''}`}
                              onClick={() => handleCommentLike(comment._id)}
                            >
                              Like
                            </button>
                            <button
                              className="comment-action-btn"
                              onClick={() => {
                                setReplyingTo(comment._id);
                                document.querySelector('.comment-input').focus();
                              }}
                            >
                              Reply
                            </button>
                            <span className="comment-time">{formatDate(comment.createdAt)}</span>
                            {comment.likesCount > 0 && (
                              <span className="comment-likes">👍 {comment.likesCount}</span>
                            )}
                            
                            {user?.isAdmin && (
                              <div className="comment-menu-wrapper">
                                <button 
                                  className="comment-menu-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowCommentMenu(showCommentMenu === comment._id ? null : comment._id);
                                  }}
                                >
                                  ⋯
                                </button>
                                
                                {showCommentMenu === comment._id && (
                                  <div className="comment-menu-dropdown">
                                    <button 
                                      className="menu-option"
                                      onClick={() => handleEditComment(comment)}
                                    >
                                      <span className="menu-icon">✏️</span>
                                      Edit
                                    </button>
                                    <button 
                                      className="menu-option delete"
                                      onClick={() => handleDeleteComment(comment._id, false)}
                                    >
                                      <span className="menu-icon">🗑️</span>
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="replies-list">
                              {comment.replies.map((reply) => (
                                <div key={reply._id} className="comment-item reply-item">
                                  <img
                                    src={reply.author?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.author?.firstName || 'User')}&size=28&background=1877f2&color=fff`}
                                    alt={reply.author?.firstName}
                                    className="comment-avatar comment-avatar-small"
                                  />
                                  <div className="comment-content">
                                    <div className="comment-bubble">
                                      <h4 className="comment-author">
                                        {reply.author?.firstName} {reply.author?.lastName}
                                      </h4>
                                      <p className="comment-text">{reply.content}</p>
                                    </div>
                                    <div className="comment-actions">
                                      <button
                                        className={`comment-action-btn ${reply.isLikedByMe ? 'active' : ''}`}
                                        onClick={() => handleCommentLike(reply._id)}
                                      >
                                        Like
                                      </button>
                                      <span className="comment-time">{formatDate(reply.createdAt)}</span>
                                      {reply.likesCount > 0 && (
                                        <span className="comment-likes">👍 {reply.likesCount}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply Input */}
                          {replyingTo === comment._id && (
                            <div className="reply-input-section">
                              <img
                                src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || 'User')}&size=28&background=1877f2&color=fff`}
                                alt={user?.firstName}
                                className="comment-avatar-small"
                              />
                              <form onSubmit={handleComment} className="reply-form">
                                <input
                                  type="text"
                                  placeholder={`Reply to ${comment.author?.firstName}...`}
                                  value={commentText}
                                  onChange={(e) => setCommentText(e.target.value)}
                                  className="comment-input"
                                  autoFocus
                                />
                                <button type="submit" className="comment-submit-btn">
                                  ➤
                                </button>
                                <button 
                                  type="button" 
                                  className="comment-cancel-btn"
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setCommentText('');
                                  }}
                                >
                                  ✕
                                </button>
                              </form>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Share Post</h3>
                <button className="modal-close" onClick={() => setShowShareModal(false)}>
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <p>Share this post with your friends?</p>
                <div className="share-options">
                  <button className="share-option-btn" onClick={handleShare}>
                    <span className="share-icon">↗️</span>
                    Share Now
                  </button>
                  <button className="share-option-btn">
                    <span className="share-icon">📋</span>
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* EDIT POST MODAL */}
      {showEditPostModal && (
        <div className="modal-overlay" onClick={() => setShowEditPostModal(false)}>
          <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Post</h3>
              <button className="modal-close" onClick={() => setShowEditPostModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <textarea
                placeholder="What's on your mind?"
                value={editPostContent}
                onChange={(e) => setEditPostContent(e.target.value)}
                rows="6"
                className="edit-textarea"
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowEditPostModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-save"
                onClick={handleUpdatePost}
                disabled={!editPostContent.trim()}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT COMMENT MODAL */}
      {showEditCommentModal && editingComment && (
        <div className="modal-overlay" onClick={() => setShowEditCommentModal(false)}>
          <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Comment</h3>
              <button className="modal-close" onClick={() => setShowEditCommentModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <textarea
                placeholder="Write your comment..."
                value={editCommentContent}
                onChange={(e) => setEditCommentContent(e.target.value)}
                rows="4"
                className="edit-textarea"
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => {
                  setShowEditCommentModal(false);
                  setEditingComment(null);
                  setEditCommentContent('');
                }}
              >
                Cancel
              </button>
              <button 
                className="btn-save"
                onClick={handleUpdateComment}
                disabled={!editCommentContent.trim()}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {showMediaViewer && (
        <MediaViewer
          post={post}
          initialMediaIndex={selectedMediaIndex}
          isOpen={showMediaViewer}
          onClose={() => setShowMediaViewer(false)}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default PostPage;