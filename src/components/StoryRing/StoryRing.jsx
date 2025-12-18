import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StoryRing.css';

/**
 * StoryRing Component - Wraps an avatar with a story ring (Facebook-style)
 * 
 * @param {string} avatarUrl - The avatar image URL
 * @param {string} userName - User's name for fallback avatar
 * @param {boolean} hasStory - Whether user has an active story
 * @param {string} storyId - ID of the story to navigate to
 * @param {boolean} viewed - Whether the story has been viewed
 * @param {string} size - Size variant: 'small', 'medium', 'large', 'xlarge', 'profile'
 * @param {function} onClick - Optional custom click handler
 * @param {string} className - Additional CSS classes
 */
const StoryRing = ({ 
  avatarUrl, 
  userName = 'User',
  hasStory = false,
  storyId = null,
  viewed = false,
  size = 'medium',
  onClick = null,
  className = '',
  children = null
}) => {
  const navigate = useNavigate();

  // Generate fallback avatar if no URL provided
  const getAvatarUrl = () => {
    if (avatarUrl) return avatarUrl;
    const sizeMap = {
      small: 40,
      medium: 60,
      large: 80,
      xlarge: 120,
      profile: 180
    };
    const avatarSize = sizeMap[size] || 60;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&size=${avatarSize}&background=1877f2&color=fff`;
  };

  const handleClick = (e) => {
    e.stopPropagation();
    
    if (onClick) {
      onClick(e);
    } else if (hasStory && storyId) {
      navigate(`/story/${storyId}`);
    }
  };

  const wrapperClasses = [
    'story-ring-wrapper',
    `size-${size}`,
    hasStory ? (viewed ? 'viewed' : 'active') : 'no-story',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={wrapperClasses}
      onClick={handleClick}
      title={hasStory ? 'View story' : userName}
    >
      {hasStory && <div className="story-ring-gradient" />}
      
      <div className="story-ring-inner">
        <img 
          src={getAvatarUrl()} 
          alt={userName}
          className="story-ring-avatar"
        />
      </div>

      {children}
    </div>
  );
};

export default StoryRing;