import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getTrending, searchByHashtag } from '../../services/trendingService';
import './TrendingPage.css';

const TrendingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryHashtag = searchParams.get('q');

  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('weekly');

  const [selectedHashtag, setSelectedHashtag] = useState(queryHashtag || null);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  useEffect(() => {
    fetchTrending();
  }, [period]);

  useEffect(() => {
    if (queryHashtag) {
      handleHashtagClick(queryHashtag);
    }
  }, [queryHashtag]);

  const fetchTrending = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTrending(20, period);
      setTrending(response.trending || []);
    } catch (err) {
      console.error('Error fetching trending:', err);
      setError('Failed to load trending hashtags');
    } finally {
      setLoading(false);
    }
  };

  const handleHashtagClick = async (hashtag) => {
    setSelectedHashtag(hashtag);
    setPostsLoading(true);

    try {
      const response = await searchByHashtag(hashtag, 1, 20);
      setPosts(response.posts || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  return (
    <div className="trending-page">
      <div className="trending-page-container">
        {/* Header */}
        <div className="trending-page-header">
          <div className="trending-page-header-content">
            <h1 className="trending-page-title">
              <span className="trending-page-icon">🔥</span>
              Trending Topics
            </h1>
            <p className="trending-page-subtitle">
              Discover what's popular in the Nelly Korda community
            </p>
          </div>

          {/* Period Filter */}
          <div className="trending-period-tabs">
            <button
              className={`trending-period-tab ${period === 'daily' ? 'active' : ''}`}
              onClick={() => setPeriod('daily')}
            >
              Today
            </button>
            <button
              className={`trending-period-tab ${period === 'weekly' ? 'active' : ''}`}
              onClick={() => setPeriod('weekly')}
            >
              This Week
            </button>
            <button
              className={`trending-period-tab ${period === 'monthly' ? 'active' : ''}`}
              onClick={() => setPeriod('monthly')}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="trending-page-content">
          {/* Left Sidebar - Trending List */}
          <div className="trending-list-sidebar">
            {loading ? (
              <div className="trending-loading-state">
                <div className="trending-spinner"></div>
                <p>Loading trending...</p>
              </div>
            ) : error ? (
              <div className="trending-error-state">
                <span className="error-icon">⚠️</span>
                <p>{error}</p>
                <button onClick={fetchTrending}>Try Again</button>
              </div>
            ) : trending.length === 0 ? (
              <div className="trending-empty-state">
                <span className="empty-icon">📊</span>
                <h3>No trending topics</h3>
                <p>Start using hashtags to see trending topics!</p>
              </div>
            ) : (
              <div className="trending-hashtags-list">
                {trending.map((trend, index) => (
                  <div
                    key={index}
                    className={`trending-hashtag-card ${selectedHashtag === trend.tag ? 'selected' : ''}`}
                    onClick={() => handleHashtagClick(trend.tag)}
                  >
                    <div className="trending-hashtag-rank">#{index + 1}</div>
                    <div className="trending-hashtag-content">
                      <div className="trending-hashtag-name">{trend.tag}</div>
                      <div className="trending-hashtag-stats">
                        <span className="stat-item">
                          📝 {trend.count} {trend.count === 1 ? 'post' : 'posts'}
                        </span>
                        <span className="stat-divider">•</span>
                        <span className="stat-item">
                          💬 {formatNumber(trend.engagement)} engagement
                        </span>
                      </div>
                    </div>
                    <div className="trending-hashtag-score">
                      <span className="score-icon">🔥</span>
                      {Math.round(trend.score)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Content - Posts */}
          <div className="trending-posts-content">
            {!selectedHashtag ? (
              <div className="trending-select-prompt">
                <span className="prompt-icon">👈</span>
                <h3>Select a trending topic</h3>
                <p>Click on any hashtag to see related posts</p>
              </div>
            ) : postsLoading ? (
              <div className="trending-posts-loading">
                <div className="trending-spinner"></div>
                <p>Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="trending-posts-empty">
                <span className="empty-icon">📭</span>
                <h3>No posts found</h3>
                <p>No posts with {selectedHashtag} yet</p>
              </div>
            ) : (
              <>
                <div className="trending-posts-header">
                  <h2>Posts with {selectedHashtag}</h2>
                  <span className="posts-count">{posts.length} posts</span>
                </div>
                <div className="trending-posts-grid">
                  {posts.map((post) => (
                    <div
                      key={post._id}
                      className="trending-post-card"
                      onClick={() => navigate(`/post/${post._id}`)}
                    >
                      {/* Post Media */}
                      {post.media && post.media.length > 0 && (
                        <div className="trending-post-media">
                          {post.media[0].type === 'video' ? (
                            <video src={post.media[0].url} />
                          ) : (
                            <img src={post.media[0].url} alt="Post" />
                          )}
                          {post.media.length > 1 && (
                            <div className="trending-post-media-count">
                              +{post.media.length - 1}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Post Content */}
                      <div className="trending-post-content">
                        <div className="trending-post-author">
                          <img
                            src={post.author?.avatar?.url || `https://ui-avatars.com/api/?name=${post.author?.firstName}`}
                            alt={post.author?.firstName}
                            className="trending-post-author-avatar"
                          />
                          <div className="trending-post-author-info">
                            <span className="author-name">
                              {post.author?.firstName} {post.author?.lastName}
                              {post.author?.isAdmin && <span className="verified-badge">✓</span>}
                            </span>
                            <span className="post-date">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {post.caption && (
                          <p className="trending-post-caption">
                            {post.caption.length > 150
                              ? `${post.caption.substring(0, 150)}...`
                              : post.caption}
                          </p>
                        )}

                        <div className="trending-post-stats">
                          <span className="stat">
                            👍 {post.likesCount || 0}
                          </span>
                          <span className="stat">
                            💬 {post.commentsCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingPage;