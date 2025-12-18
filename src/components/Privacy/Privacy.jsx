import React, { useState } from 'react';
import './Privacy.css';

const Privacy = () => {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', title: 'Introduction', icon: '📋' },
    { id: 'information', title: 'Information We Collect', icon: '📊' },
    { id: 'usage', title: 'How We Use Your Information', icon: '🎯' },
    { id: 'sharing', title: 'Information Sharing', icon: '🔗' },
    { id: 'security', title: 'Data Security', icon: '🔒' },
    { id: 'rights', title: 'Your Rights', icon: '⚖️' },
    { id: 'cookies', title: 'Cookies & Tracking', icon: '🍪' },
    { id: 'updates', title: 'Policy Updates', icon: '📝' }
  ];

  const content = {
    introduction: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: December 10, 2025',
      text: `Welcome to our Privacy Policy. Your privacy is critically important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site or use our services.

We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert you about any changes by updating the "Last updated" date of this Privacy Policy. You are encouraged to periodically review this Privacy Policy to stay informed of updates.`
    },
    information: {
      title: 'Information We Collect',
      text: `We collect information that you provide directly to us when you:
      
• Create or modify your account
• Request customer support or communicate with us
• Participate in surveys, contests, or promotions
• Use our services and features

Personal Information: This may include your name, email address, phone number, postal address, payment information, and any other information you choose to provide.

Usage Information: We automatically collect information about your interaction with our services, including the pages or content you view, your searches, and other actions.

Device Information: We collect information about the devices you use to access our services, including hardware model, operating system, browser type, IP address, and mobile network information.

Location Information: With your permission, we may collect information about your precise location using GPS, WiFi, and cellular data.`
    },
    usage: {
      title: 'How We Use Your Information',
      text: `We use the information we collect for various purposes, including to:

• Provide, maintain, and improve our services
• Process transactions and send related information
• Send you technical notices, updates, and security alerts
• Respond to your comments, questions, and customer service requests
• Communicate with you about products, services, offers, and events
• Monitor and analyze trends, usage, and activities
• Detect, prevent, and address technical issues and security incidents
• Personalize and improve your experience
• Facilitate contests, sweepstakes, and promotions
• Comply with legal obligations and protect our rights

We process your personal information based on the following legal grounds: your consent, our legitimate business interests, contractual necessity, and legal compliance.`
    },
    sharing: {
      title: 'Information Sharing and Disclosure',
      text: `We may share your information in the following circumstances:

With Service Providers: We share information with third-party vendors, consultants, and service providers who perform services on our behalf, such as payment processing, data analysis, email delivery, and customer service.

For Legal Reasons: We may disclose your information if required to do so by law or in response to valid requests by public authorities, including to meet national security or law enforcement requirements.

Business Transfers: In connection with any merger, sale of company assets, financing, or acquisition of all or a portion of our business, your information may be transferred.

With Your Consent: We may share your information with third parties when you give us consent to do so.

Aggregated or De-identified Information: We may share information that has been aggregated or de-identified so that it can no longer reasonably be used to identify you.

We do not sell your personal information to third parties for their marketing purposes without your explicit consent.`
    },
    security: {
      title: 'Data Security',
      text: `We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:

• Encryption of data in transit using SSL/TLS protocols
• Encryption of sensitive data at rest
• Regular security assessments and penetration testing
• Access controls and authentication mechanisms
• Employee training on data protection and security
• Incident response procedures

However, please be aware that no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.

In the event of a data breach that affects your personal information, we will notify you and relevant authorities as required by applicable law.`
    },
    rights: {
      title: 'Your Rights and Choices',
      text: `You have certain rights regarding your personal information, depending on your location:

Access and Portability: You can request access to your personal information and receive a copy in a portable format.

Correction: You can request that we correct inaccurate or incomplete personal information.

Deletion: You can request that we delete your personal information, subject to certain exceptions.

Restriction: You can request that we restrict the processing of your personal information in certain circumstances.

Objection: You can object to our processing of your personal information based on legitimate interests.

Withdraw Consent: Where we rely on your consent to process your information, you can withdraw that consent at any time.

To exercise these rights, please contact us using the contact information provided at the end of this policy. We will respond to your request within the timeframe required by applicable law.

You also have the right to lodge a complaint with a data protection authority if you believe we have violated your privacy rights.`
    },
    cookies: {
      title: 'Cookies and Tracking Technologies',
      text: `We use cookies and similar tracking technologies to collect and track information and to improve and analyze our services.

Types of Cookies We Use:

Essential Cookies: Necessary for the website to function properly and cannot be disabled.

Functional Cookies: Enable enhanced functionality and personalization, such as remembering your preferences.

Analytics Cookies: Help us understand how visitors interact with our website by collecting and reporting information anonymously.

Advertising Cookies: Used to deliver relevant advertisements and track advertising campaign performance.

Cookie Management: Most web browsers are set to accept cookies by default. You can usually modify your browser settings to decline cookies if you prefer. However, this may prevent you from taking full advantage of our services.

Do Not Track: Some browsers include a "Do Not Track" feature. Our services do not currently respond to Do Not Track signals.

Third-Party Analytics: We use third-party analytics services like Google Analytics to help analyze how users use our services. These services use cookies and similar technologies to collect information about your use of our services.`
    },
    updates: {
      title: 'Changes to This Privacy Policy',
      text: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.

When we make changes to this Privacy Policy, we will:

• Update the "Last updated" date at the top of this policy
• Notify you via email or through a notice on our website if the changes are significant
• In some cases, obtain your consent if required by applicable law

We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.

Your continued use of our services after any changes to this Privacy Policy indicates your acceptance of such changes.

Contact Information: If you have any questions, concerns, or complaints about this Privacy Policy or our data practices, please contact us at:

Email: privacy@company.com
Phone: +1 (555) 123-4567
Address: 123 Business St, Suite 100, San Francisco, CA 94105

We will respond to your inquiry within 30 days.`
    }
  };

  return (
    <div className="pri-99001-container">
      <div className="pri-99001-sidebar">
        <div className="pri-99001-sidebar-header">
          <h2 className="pri-99001-sidebar-title">Privacy Center</h2>
        </div>
        <nav className="pri-99001-nav">
          {sections.map(section => (
            <button
              key={section.id}
              className={`pri-99001-nav-item ${activeSection === section.id ? 'pri-99001-nav-active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="pri-99001-nav-icon">{section.icon}</span>
              <span className="pri-99001-nav-text">{section.title}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="pri-99001-main">
        <div className="pri-99001-content-wrapper">
          <div className="pri-99001-header">
            <h1 className="pri-99001-title">{content[activeSection].title}</h1>
            {content[activeSection].lastUpdated && (
              <p className="pri-99001-updated">{content[activeSection].lastUpdated}</p>
            )}
          </div>

          <div className="pri-99001-content">
            {content[activeSection].text.split('\n\n').map((paragraph, index) => (
              <p key={index} className="pri-99001-paragraph">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="pri-99001-actions">
            <button className="pri-99001-action-btn pri-99001-primary-btn">
              Download PDF
            </button>
            <button className="pri-99001-action-btn pri-99001-secondary-btn">
              Print Policy
            </button>
          </div>

          <div className="pri-99001-footer-note">
            <svg className="pri-99001-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <line x1="12" y1="16" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="8" r="0.5" fill="currentColor" strokeWidth="2"/>
            </svg>
            <p>If you have questions about this Privacy Policy, please contact our Privacy Team at privacy@company.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;