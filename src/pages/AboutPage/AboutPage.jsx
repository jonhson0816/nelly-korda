import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutPage.css';

const AboutPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('story');

  const achievements = [
    { year: '2024', title: 'Olympic Gold Medal', location: 'Paris, France', icon: '🥇' },
    { year: '2023', title: 'LPGA Championship Winner', location: 'New York, USA', icon: '🏆' },
    { year: '2022', title: 'World #1 Ranking', location: 'Global', icon: '⭐' },
    { year: '2021', title: 'Multiple Tour Victories', location: 'USA', icon: '🎖️' },
    { year: '2019', title: 'LPGA Tour Rookie', location: 'USA', icon: '🌟' },
  ];

  const stats = [
    { label: 'Major Championships', value: '2', icon: '🏆' },
    { label: 'LPGA Tour Wins', value: '13+', icon: '⭐' },
    { label: 'Olympic Medals', value: '1 Gold', icon: '🥇' },
    { label: 'World Ranking', value: '#1', icon: '👑' },
    { label: 'Years Pro', value: '6+', icon: '📅' },
    { label: 'Countries Played', value: '25+', icon: '🌍' },
  ];

  const timeline = [
    { year: '1998', event: 'Born in Bradenton, Florida', icon: '🎂' },
    { year: '2016', event: 'Turned Professional', icon: '⛳' },
    { year: '2018', event: 'First LPGA Tour Win', icon: '🏆' },
    { year: '2021', event: 'First Major Championship', icon: '⭐' },
    { year: '2022', event: 'Reached World #1', icon: '👑' },
    { year: '2024', event: 'Olympic Gold Medal', icon: '🥇' },
  ];

  const family = [
    { name: 'Petr Korda', relation: 'Father', description: 'Former Tennis Pro, Grand Slam Winner', icon: '🎾' },
    { name: 'Regina Rajchrtová', relation: 'Mother', description: 'Former Tennis Professional', icon: '🎾' },
    { name: 'Jessica Korda', relation: 'Sister', description: 'LPGA Tour Professional', icon: '⛳' },
    { name: 'Sebastian Korda', relation: 'Brother', description: 'Professional Tennis Player', icon: '🎾' },
  ];

  return (
    <div className="abo-090-about-page">
      <div className="abo-090-about-container">
        {/* Header */}
        <div className="abo-090-header">
          <button onClick={() => navigate(-1)} className="abo-090-back-button">
            ← Back
          </button>
          <h1 className="abo-090-page-title">About Nelly Korda</h1>
        </div>

        {/* Hero Section */}
        <div className="abo-090-hero-section">
          <div className="abo-090-hero-background">
            <img 
              src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&h=400&fit=crop" 
              alt="Golf Course" 
              className="abo-090-hero-bg-image"
            />
            <div className="abo-090-hero-overlay"></div>
          </div>
          <div className="abo-090-hero-content">
            <div className="abo-090-hero-profile">
              <img 
                src="https://ui-avatars.com/api/?name=Nelly+Korda&size=150&background=0077B5&color=fff&bold=true" 
                alt="Nelly Korda" 
                className="abo-090-hero-avatar"
              />
            </div>
            <h2 className="abo-090-hero-title">Nelly Korda</h2>
            <p className="abo-090-hero-subtitle">Professional Golfer • Olympic Champion • World #1</p>
            <div className="abo-090-hero-badges">
              <span className="abo-090-badge">🏆 Major Winner</span>
              <span className="abo-090-badge">🥇 Olympic Gold</span>
              <span className="abo-090-badge">👑 World #1</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="abo-090-stats-section">
          <h2 className="abo-090-section-title">Career Highlights</h2>
          <div className="abo-090-stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="abo-090-stat-card">
                <div className="abo-090-stat-icon">{stat.icon}</div>
                <div className="abo-090-stat-value">{stat.value}</div>
                <div className="abo-090-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="abo-090-tabs-section">
          <div className="abo-090-tabs-nav">
            <button 
              className={`abo-090-tab-button ${activeTab === 'story' ? 'abo-090-active' : ''}`}
              onClick={() => setActiveTab('story')}
            >
              📖 Story
            </button>
            <button 
              className={`abo-090-tab-button ${activeTab === 'achievements' ? 'abo-090-active' : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              🏆 Achievements
            </button>
            <button 
              className={`abo-090-tab-button ${activeTab === 'timeline' ? 'abo-090-active' : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              📅 Timeline
            </button>
            <button 
              className={`abo-090-tab-button ${activeTab === 'family' ? 'abo-090-active' : ''}`}
              onClick={() => setActiveTab('family')}
            >
              👨‍👩‍👧‍👦 Family
            </button>
          </div>

          <div className="abo-090-tabs-content">
            {/* Story Tab */}
            {activeTab === 'story' && (
              <div className="abo-090-story-content">
                <div className="abo-090-content-card">
                  <h3>Early Life & Background</h3>
                  <p>
                    Born on July 28, 1998, in Bradenton, Florida, Nelly Korda grew up in a family 
                    of exceptional athletes. Her father, Petr Korda, won the 1998 Australian Open 
                    tennis championship, while her mother, Regina Rajchrtová, was also a professional 
                    tennis player. Growing up in such a competitive environment instilled in Nelly a 
                    strong work ethic and determination from an early age.
                  </p>
                </div>

                <div className="abo-090-content-card">
                  <h3>Junior Career</h3>
                  <p>
                    Nelly's talent was evident from a young age. She competed in junior golf 
                    tournaments throughout her teenage years, consistently showing promise and skill 
                    that would later define her professional career. Her dedication to the sport and 
                    natural athleticism set her apart from her peers.
                  </p>
                </div>

                <div className="abo-090-content-card">
                  <h3>Professional Journey</h3>
                  <p>
                    Turning professional in 2016 at the age of 17, Nelly quickly made her mark on 
                    the LPGA Tour. Her breakthrough came in 2018 with her first LPGA Tour victory, 
                    and she hasn't looked back since. Known for her powerful drives and precise 
                    short game, Nelly has become one of the most dominant players in women's golf.
                  </p>
                </div>

                <div className="abo-090-content-card">
                  <h3>Peak Performance</h3>
                  <p>
                    In 2021, Nelly won her first major championship at the KPMG Women's PGA 
                    Championship and ascended to the World #1 ranking. Her crowning achievement came 
                    at the 2024 Paris Olympics, where she won the gold medal, cementing her legacy 
                    as one of golf's all-time greats.
                  </p>
                </div>

                <div className="abo-090-content-card">
                  <h3>Playing Style</h3>
                  <p>
                    Nelly is known for her aggressive yet calculated playing style. Her powerful 
                    drives off the tee combined with exceptional precision on approach shots make 
                    her a formidable competitor on any course. Her mental toughness and ability to 
                    perform under pressure have been key factors in her major championship victories.
                  </p>
                </div>

                <div className="abo-090-content-card">
                  <h3>Off the Course</h3>
                  <p>
                    Beyond golf, Nelly is passionate about fitness, fashion, and giving back to her 
                    community. She actively supports junior golf programs and uses her platform to 
                    inspire the next generation of female golfers. Her engaging personality and 
                    authenticity have made her a fan favorite worldwide.
                  </p>
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="abo-090-achievements-content">
                {achievements.map((achievement, index) => (
                  <div key={index} className="abo-090-achievement-card">
                    <div className="abo-090-achievement-icon">{achievement.icon}</div>
                    <div className="abo-090-achievement-details">
                      <div className="abo-090-achievement-year">{achievement.year}</div>
                      <h4 className="abo-090-achievement-title">{achievement.title}</h4>
                      <p className="abo-090-achievement-location">📍 {achievement.location}</p>
                    </div>
                  </div>
                ))}

                <div className="abo-090-achievements-summary">
                  <h3>Tournament Victories</h3>
                  <ul className="abo-090-victories-list">
                    <li>🏆 13+ LPGA Tour Wins</li>
                    <li>⭐ 2 Major Championships</li>
                    <li>🥇 1 Olympic Gold Medal</li>
                    <li>🎖️ Multiple Solheim Cup Appearances</li>
                    <li>👑 Rolex Player of the Year Nominee</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="abo-090-timeline-content">
                <div className="abo-090-timeline">
                  {timeline.map((item, index) => (
                    <div key={index} className="abo-090-timeline-item">
                      <div className="abo-090-timeline-marker">
                        <div className="abo-090-timeline-icon">{item.icon}</div>
                      </div>
                      <div className="abo-090-timeline-content">
                        <div className="abo-090-timeline-year">{item.year}</div>
                        <div className="abo-090-timeline-event">{item.event}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Family Tab */}
            {activeTab === 'family' && (
              <div className="abo-090-family-content">
                <div className="abo-090-family-intro">
                  <h3>The Korda Family Legacy</h3>
                  <p>
                    The Korda family is renowned for producing world-class athletes across multiple 
                    sports. With a rich heritage in both tennis and golf, the family's commitment 
                    to excellence and sportsmanship continues to inspire athletes worldwide.
                  </p>
                </div>

                <div className="abo-090-family-grid">
                  {family.map((member, index) => (
                    <div key={index} className="abo-090-family-card">
                      <div className="abo-090-family-icon">{member.icon}</div>
                      <h4 className="abo-090-family-name">{member.name}</h4>
                      <p className="abo-090-family-relation">{member.relation}</p>
                      <p className="abo-090-family-description">{member.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="abo-090-cta-section">
          <h2>Join the Journey</h2>
          <p>Follow Nelly's career and be part of her incredible story</p>
          <div className="abo-090-cta-buttons">
            <button onClick={() => navigate('/')} className="abo-090-cta-primary">
              View News Feed
            </button>
            <button onClick={() => navigate('/tournaments')} className="abo-090-cta-secondary">
              Upcoming Tournaments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;