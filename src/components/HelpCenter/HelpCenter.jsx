import React, { useState } from 'react';
import './HelpCenter.css';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics', icon: '📚' },
    { id: 'account', name: 'Account', icon: '👤' },
    { id: 'billing', name: 'Billing', icon: '💳' },
    { id: 'technical', name: 'Technical', icon: '⚙️' },
    { id: 'privacy', name: 'Privacy', icon: '🔒' }
  ];

  const faqs = [
    {
      id: 1,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'To create an account, click on the "Sign Up" button at the top right corner of the page. Fill in your details including name, email, and password. Verify your email address through the link sent to your inbox, and you\'re all set!'
    },
    {
      id: 2,
      category: 'account',
      question: 'How can I reset my password?',
      answer: 'Click on "Forgot Password" on the login page. Enter your registered email address, and we\'ll send you a password reset link. Follow the instructions in the email to create a new password.'
    },
    {
      id: 3,
      category: 'billing',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise customers. All payments are processed securely through our encrypted payment gateway.'
    },
    {
      id: 4,
      category: 'billing',
      question: 'How do I update my billing information?',
      answer: 'Go to Settings > Billing & Payment. Here you can update your payment method, billing address, and download invoices. Changes take effect immediately for your next billing cycle.'
    },
    {
      id: 5,
      category: 'technical',
      question: 'The app is not loading properly. What should I do?',
      answer: 'Try clearing your browser cache and cookies first. If the issue persists, try using a different browser or device. Make sure your internet connection is stable. If problems continue, contact our technical support team.'
    },
    {
      id: 6,
      category: 'technical',
      question: 'Is there a mobile app available?',
      answer: 'Yes! Our mobile app is available for both iOS and Android devices. You can download it from the App Store or Google Play Store. The mobile app offers all the features of the web version with a mobile-optimized interface.'
    },
    {
      id: 7,
      category: 'privacy',
      question: 'How is my data protected?',
      answer: 'We use industry-standard encryption (SSL/TLS) to protect your data in transit and at rest. We never share your personal information with third parties without your consent. For more details, please review our Privacy Policy.'
    },
    {
      id: 8,
      category: 'privacy',
      question: 'Can I delete my account?',
      answer: 'Yes, you can delete your account at any time from Settings > Account > Delete Account. Please note that this action is permanent and all your data will be removed from our servers within 30 days.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="hel-00011-container">
      <div className="hel-00011-hero">
        <h1 className="hel-00011-hero-title">How can we help you?</h1>
        <div className="hel-00011-search-wrapper">
          <svg className="hel-00011-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            className="hel-00011-search-input"
            placeholder="Search for help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="hel-00011-content">
        <div className="hel-00011-categories">
          <h2 className="hel-00011-section-title">Browse by Category</h2>
          <div className="hel-00011-category-grid">
            {categories.map(category => (
              <button
                key={category.id}
                className={`hel-00011-category-card ${selectedCategory === category.id ? 'hel-00011-category-active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="hel-00011-category-icon">{category.icon}</span>
                <span className="hel-00011-category-name">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="hel-00011-faqs">
          <h2 className="hel-00011-section-title">
            {selectedCategory === 'all' ? 'Frequently Asked Questions' : `${categories.find(c => c.id === selectedCategory)?.name} Questions`}
          </h2>
          
          {filteredFaqs.length === 0 ? (
            <div className="hel-00011-no-results">
              <svg className="hel-00011-no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="0.5" fill="currentColor" strokeWidth="2"/>
              </svg>
              <p>No results found. Try a different search term or category.</p>
            </div>
          ) : (
            <div className="hel-00011-faq-list">
              {filteredFaqs.map(faq => (
                <div key={faq.id} className="hel-00011-faq-item">
                  <button
                    className="hel-00011-faq-question"
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <span>{faq.question}</span>
                    <svg
                      className={`hel-00011-faq-icon ${expandedFaq === faq.id ? 'hel-00011-faq-icon-expanded' : ''}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="hel-00011-faq-answer">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hel-00011-contact-section">
          <div className="hel-00011-contact-card">
            <h3 className="hel-00011-contact-title">Still need help?</h3>
            <p className="hel-00011-contact-text">Our support team is here to assist you with any questions or concerns.</p>
            <button className="hel-00011-contact-btn">Contact Support</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;