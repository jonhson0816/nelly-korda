import React, { useState } from 'react';
import './FAQPage.css';

const FAQPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // FAQ Data - Organized by Categories (Facebook Style)
  const faqData = [
    {
      category: 'Getting Started',
      icon: '🚀',
      questions: [
        {
          question: 'What is Nelly Korda Fan Community?',
          answer: 'This is the official fan community platform dedicated to celebrating Nelly Korda\'s achievements, tournaments, and sharing memorable moments with fellow fans and loved ones. Instead of scattered posts across Facebook, Instagram, or X, everything is in one beautiful place.'
        },
        {
          question: 'How do I create an account?',
          answer: 'Click the "Join Now" button on the homepage or navigation bar. Fill in your details including name, email, username, and password. Once registered, you can immediately start exploring posts, achievements, and tournaments.'
        },
        {
          question: 'Is this platform free to use?',
          answer: 'Yes! The platform is completely free for all fans. You can view posts, share achievements, comment, like, and participate in the community without any charges.'
        }
      ]
    },
    {
      category: 'Account & Profile',
      icon: '👤',
      questions: [
        {
          question: 'How do I update my profile information?',
          answer: 'Navigate to Settings from the navigation menu. You can update your profile picture, bio, personal information, and privacy settings. Changes are saved automatically.'
        },
        {
          question: 'Can I change my username?',
          answer: 'Yes, you can change your username in the Settings page. Note that your username must be unique and can only contain letters, numbers, and underscores.'
        },
        {
          question: 'How do I reset my password?',
          answer: 'On the login page, click "Forgot Password" and enter your email. You\'ll receive a password reset link. Follow the instructions to create a new password.'
        }
      ]
    },
    {
      category: 'Posts & Content',
      icon: '📝',
      questions: [
        {
          question: 'How do I create a post?',
          answer: 'Click the "Create Post" button on the homepage. You can add text, upload images or videos, and share your thoughts about Nelly\'s achievements or tournaments. Posts can include multiple media files.'
        },
        {
          question: 'Can I edit or delete my posts?',
          answer: 'Yes! Click the three-dot menu on your post and select "Edit" or "Delete". You can edit the text and captions, but uploaded media cannot be changed once posted.'
        },
        {
          question: 'What file types are supported for uploads?',
          answer: 'You can upload images (JPG, PNG, GIF) up to 10MB each, and videos (MP4, MOV) up to 100MB. Multiple files can be uploaded in a single post.'
        }
      ]
    },
    {
      category: 'Stories',
      icon: '📸',
      questions: [
        {
          question: 'How long do stories last?',
          answer: 'Stories automatically expire after 24 hours. However, admins can save important stories as "Highlights" which remain permanently visible in special categories.'
        },
        {
          question: 'Can I create text-only stories?',
          answer: 'Yes! When creating a story, choose "Text" mode. You can customize font size, colors, backgrounds, add emojis, and create beautiful text stories without photos or videos.'
        },
        {
          question: 'Who can see my story?',
          answer: 'All registered members can view stories. You can see view counts, and admins can access detailed analytics including viewer lists and engagement metrics.'
        }
      ]
    },
    {
      category: 'Achievements & Tournaments',
      icon: '🏆',
      questions: [
        {
          question: 'How are achievements added?',
          answer: 'Achievements are curated and added by community admins to celebrate Nelly\'s milestones, tournament wins, records, and special moments. Members can comment and react to achievements.'
        },
        {
          question: 'Can I suggest an achievement?',
          answer: 'Yes! Use the Contact page to suggest achievements you think should be featured. Admins review all suggestions and add verified accomplishments.'
        },
        {
          question: 'Where can I find tournament schedules?',
          answer: 'Visit the Tournaments page to see upcoming tournaments, results, and detailed information about Nelly\'s participation, performance, and rankings.'
        }
      ]
    },
    {
      category: 'Gallery & Media',
      icon: '🖼️',
      questions: [
        {
          question: 'What is the Gallery feature?',
          answer: 'The Gallery is a curated collection of photos and videos showcasing Nelly\'s best moments, tournament highlights, and memorable experiences. You can view, like, and share gallery items.'
        },
        {
          question: 'Can I contribute to the gallery?',
          answer: 'Gallery content is primarily managed by admins to maintain quality. However, exceptional photos from community members may be featured. Contact admins to submit your best shots!'
        }
      ]
    },
    {
      category: 'Interaction & Engagement',
      icon: '💬',
      questions: [
        {
          question: 'How do comments work?',
          answer: 'Click the comment icon on any post to share your thoughts. You can reply to other comments, like comments, and have conversations with fellow fans. Be respectful and follow community guidelines.'
        },
        {
          question: 'Can I send direct messages?',
          answer: 'Yes! Use the Messenger feature to send private messages to other community members. Click the chat icon in the navigation or visit someone\'s profile to start a conversation.'
        },
        {
          question: 'What are notifications for?',
          answer: 'You receive notifications when someone likes your post, comments on your content, replies to your comment, or sends you a message. Manage notification settings in your profile.'
        }
      ]
    },
    {
      category: 'Privacy & Safety',
      icon: '🔒',
      questions: [
        {
          question: 'Is my personal information safe?',
          answer: 'Absolutely. We use industry-standard encryption and security measures. Your email and personal details are never shared publicly. Review our Privacy Policy for complete details.'
        },
        {
          question: 'How do I report inappropriate content?',
          answer: 'Click the three-dot menu on any post or comment and select "Report". Choose a reason and our moderation team will review it promptly. We take community safety seriously.'
        },
        {
          question: 'Can I block or mute users?',
          answer: 'Yes. Visit a user\'s profile and use the block/mute options. Blocked users cannot see your content or interact with you. You can manage blocked users in Settings.'
        }
      ]
    },
    {
      category: 'Technical Support',
      icon: '⚙️',
      questions: [
        {
          question: 'The website is loading slowly. What should I do?',
          answer: 'Try clearing your browser cache, ensuring you have a stable internet connection, or try a different browser. If issues persist, contact support with details about your device and browser.'
        },
        {
          question: 'I can\'t upload photos/videos. Help!',
          answer: 'Ensure your files meet size requirements (images: 10MB max, videos: 100MB max). Check your internet connection. If using mobile, ensure the app has camera/storage permissions.'
        },
        {
          question: 'How do I contact support?',
          answer: 'Visit the Contact page or Help Center. Fill out the support form with your issue details, and our team will respond within 24-48 hours. For urgent matters, check the Help Center for instant solutions.'
        }
      ]
    }
  ];

  // Toggle FAQ Answer
  const toggleFAQ = (categoryIndex, questionIndex) => {
    const newIndex = `${categoryIndex}-${questionIndex}`;
    setActiveIndex(activeIndex === newIndex ? null : newIndex);
  };

  // Filter FAQs based on search
  const filteredFAQs = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="faq-page">
      {/* Hero Section */}
      <div className="faq-hero">
        <div className="faq-hero-content">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about the Nelly Korda Fan Community</p>
          
          {/* Search Bar */}
          <div className="faq-search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="faq-container">
        {filteredFAQs.length === 0 ? (
          <div className="no-results">
            <span className="no-results-icon">🔍</span>
            <h3>No results found</h3>
            <p>Try searching with different keywords</p>
          </div>
        ) : (
          filteredFAQs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="faq-category">
              <div className="faq-category-header">
                <span className="category-icon">{category.icon}</span>
                <h2>{category.category}</h2>
              </div>

              <div className="faq-list">
                {category.questions.map((item, questionIndex) => {
                  const isActive = activeIndex === `${categoryIndex}-${questionIndex}`;
                  
                  return (
                    <div
                      key={questionIndex}
                      className={`faq-item ${isActive ? 'active' : ''}`}
                    >
                      <div
                        className="faq-question"
                        onClick={() => toggleFAQ(categoryIndex, questionIndex)}
                      >
                        <h3>{item.question}</h3>
                        <span className="faq-toggle">{isActive ? '−' : '+'}</span>
                      </div>

                      {isActive && (
                        <div className="faq-answer">
                          <p>{item.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Still Need Help Section */}
      <div className="faq-help-section">
        <div className="help-card">
          <span className="help-icon">💬</span>
          <h3>Still have questions?</h3>
          <p>Can't find what you're looking for? Our support team is here to help!</p>
          <div className="help-buttons">
            <a href="/contact" className="btn-primary">Contact Support</a>
            <a href="/help" className="btn-secondary">Visit Help Center</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;