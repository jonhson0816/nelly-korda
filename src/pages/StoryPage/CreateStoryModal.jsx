import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';
import axios from 'axios';
import './CreateStoryModal.css';

const CreateStoryModal = ({ isOpen, onClose, currentUser }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [storyType, setStoryType] = useState('media'); // 'media', 'text', 'mixed'
  
  // Text story state
  const [textContent, setTextContent] = useState({
    text: '',
    fontSize: 'medium',
    fontFamily: 'Arial',
    textColor: '#FFFFFF',
    textAlign: 'center',
    backgroundColor: '#000000',
    gradient: null,
  });
  
  // Stickers state
  const [stickers, setStickers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const token = localStorage.getItem('token');

  // Popular emojis
  const popularEmojis = ['😀', '😂', '❤️', '🔥', '👍', '🎉', '😍', '🤔', '😎', '💯', '✨', '🙌', '👏', '💪', '🎊', '🎈'];
  
  // Background gradients
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    '#000000', // Solid black
    '#FFFFFF', // Solid white
    '#FF0000', // Solid red
    '#0000FF', // Solid blue
  ];

  if (!isOpen) return null;

  // Handle file selection (multiple files)
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate files
    const validFiles = [];
    const newPreviews = [];

    files.forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        alert('Please select only image or video files');
        return;
      }

      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Max: ${isVideo ? '100MB' : '10MB'}`);
        return;
      }

      validFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({
          url: reader.result,
          type: isVideo ? 'video' : 'image',
          file,
        });

        if (newPreviews.length === validFiles.length) {
          setPreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setStoryType(validFiles.length > 0 ? 'media' : 'text');
  };

  // Remove media item
  const removeMedia = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Add emoji/sticker
  const addEmoji = (emoji) => {
    setStickers((prev) => [
      ...prev,
      {
        type: 'emoji',
        content: emoji,
        position: { x: 50, y: 50 },
        size: 50,
        rotation: 0,
      },
    ]);
    setShowEmojiPicker(false);
  };

  // Handle text content changes
  const handleTextChange = (field, value) => {
    setTextContent((prev) => ({ ...prev, [field]: value }));
  };

  // Create story
  const handleCreateStory = async () => {
    // Validation
    if (selectedFiles.length === 0 && !textContent.text.trim()) {
      alert('Please add media or text to your story');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      // Append files
      selectedFiles.forEach((file) => {
        formData.append('media', file);
      });

      // Append data
      formData.append('caption', caption);
      formData.append('storyType', storyType);
      
      if (textContent.text.trim()) {
        formData.append('textContent', JSON.stringify(textContent));
      }
      
      if (stickers.length > 0) {
        formData.append('stickers', JSON.stringify(stickers));
      }

      formData.append('backgroundColor', textContent.backgroundColor);
      formData.append('allowComments', true);
      formData.append('allowLikes', true);
      formData.append('allowSharing', true);

      const response = await axios.post(`${API_URL}/stories`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        alert('Story posted successfully!');
        handleClose();
        navigate(`/story/${response.data.story._id}`);
      }
    } catch (error) {
      console.error('Error creating story:', error);
      alert(error.response?.data?.message || 'Failed to create story');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setPreviews([]);
    setCaption('');
    setTextContent({
      text: '',
      fontSize: 'medium',
      fontFamily: 'Arial',
      textColor: '#FFFFFF',
      textAlign: 'center',
      backgroundColor: '#000000',
      gradient: null,
    });
    setStickers([]);
    setStoryType('media');
    setShowEmojiPicker(false);
    onClose();
  };

  return (
    <div className="create-story-modal-overlay" onClick={handleClose}>
      <div className="create-story-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-story-header">
          <h2>Create Story</h2>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </div>

        <div className="create-story-body">
          {/* Story Type Selector */}
          <div className="story-type-selector">
            <button
              className={`type-btn ${storyType === 'text' ? 'active' : ''}`}
              onClick={() => setStoryType('text')}
            >
              📝 Text
            </button>
            <button
              className={`type-btn ${storyType === 'media' ? 'active' : ''}`}
              onClick={() => setStoryType('media')}
            >
              📸 Photo/Video
            </button>
          </div>

          {/* Text Story Creator */}
          {storyType === 'text' && (
            <div className="text-story-creator">
              <div
                className="text-story-preview"
                style={{
                  background: textContent.gradient || textContent.backgroundColor,
                }}
              >
                <textarea
                  className="story-text-input"
                  style={{
                    fontSize: textContent.fontSize === 'small' ? '20px' : textContent.fontSize === 'large' ? '40px' : '30px',
                    fontFamily: textContent.fontFamily,
                    color: textContent.textColor,
                    textAlign: textContent.textAlign,
                  }}
                  placeholder="Type your story..."
                  value={textContent.text}
                  onChange={(e) => handleTextChange('text', e.target.value)}
                  maxLength="500"
                />
                
                {/* Display stickers */}
                {stickers.map((sticker, index) => (
                  <div
                    key={index}
                    className="sticker-item"
                    style={{
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

              {/* Text Controls */}
              <div className="text-controls">
                <div className="control-group">
                  <label>Font Size:</label>
                  <select
                    value={textContent.fontSize}
                    onChange={(e) => handleTextChange('fontSize', e.target.value)}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div className="control-group">
                  <label>Text Color:</label>
                  <input
                    type="color"
                    value={textContent.textColor}
                    onChange={(e) => handleTextChange('textColor', e.target.value)}
                  />
                </div>

                <div className="control-group">
                  <label>Alignment:</label>
                  <select
                    value={textContent.textAlign}
                    onChange={(e) => handleTextChange('textAlign', e.target.value)}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>

              {/* Background Gradients */}
              <div className="background-selector">
                <label>Background:</label>
                <div className="gradient-options">
                  {gradients.map((grad, index) => (
                    <div
                      key={index}
                      className="gradient-option"
                      style={{ background: grad }}
                      onClick={() => {
                        if (grad.startsWith('linear')) {
                          handleTextChange('gradient', grad);
                          handleTextChange('backgroundColor', null);
                        } else {
                          handleTextChange('backgroundColor', grad);
                          handleTextChange('gradient', null);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Emoji Picker */}
              <div className="emoji-section">
                <button
                  className="add-emoji-btn"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  😀 Add Emoji
                </button>
                {showEmojiPicker && (
                  <div className="emoji-picker">
                    {popularEmojis.map((emoji, index) => (
                      <span
                        key={index}
                        className="emoji-option"
                        onClick={() => addEmoji(emoji)}
                      >
                        {emoji}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Media Story Creator */}
          {storyType === 'media' && (
            <div className="media-story-creator">
              {previews.length === 0 ? (
                <div className="story-upload-area">
                  <div className="upload-icon">📸</div>
                  <h3>Add Photos or Videos</h3>
                  <p>Share multiple moments with your story</p>
                  <label className="upload-btn">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    Choose Files
                  </label>
                </div>
              ) : (
                <div className="media-preview-area">
                  <div className="media-grid">
                    {previews.map((preview, index) => (
                      <div key={index} className="media-item">
                        {preview.type === 'video' ? (
                          <video src={preview.url} className="preview-media" />
                        ) : (
                          <img src={preview.url} alt={`Preview ${index + 1}`} className="preview-media" />
                        )}
                        <button
                          className="remove-media-btn"
                          onClick={() => removeMedia(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    className="add-more-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    ➕ Add More
                  </button>

                  {/* Caption for media */}
                  <div className="caption-area">
                    <textarea
                      placeholder="Add a caption..."
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      rows="3"
                      maxLength="500"
                    />
                    <p className="char-count">{caption.length}/500</p>
                  </div>

                  {/* Emoji for media */}
                  <div className="emoji-section">
                    <button
                      className="add-emoji-btn"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      😀 Add Emoji
                    </button>
                    {showEmojiPicker && (
                      <div className="emoji-picker">
                        {popularEmojis.map((emoji, index) => (
                          <span
                            key={index}
                            className="emoji-option"
                            onClick={() => setCaption((prev) => prev + emoji)}
                          >
                            {emoji}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        {(previews.length > 0 || textContent.text.trim()) && (
          <div className="create-story-footer">
            <button className="btn-cancel" onClick={handleClose} disabled={uploading}>
              Cancel
            </button>
            <button
              className="btn-create"
              onClick={handleCreateStory}
              disabled={uploading}
            >
              {uploading ? 'Posting...' : 'Share to Story'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateStoryModal;