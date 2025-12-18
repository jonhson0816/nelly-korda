import React, { useState } from 'react';
import './TermsPage.css';

const TermsPage = () => {
  const [activeSection, setActiveSection] = useState(null);

  // Terms Sections Data
  const termsData = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      icon: '📜',
      content: `By accessing or using the Nelly Korda Fan Community platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.

These Terms apply to all visitors, users, and others who access or use the Service. We reserve the right to update these Terms at any time. Your continued use of the Service after changes are posted constitutes your acceptance of the revised Terms.`
    },
    {
      id: 'eligibility',
      title: '2. User Eligibility',
      icon: '✅',
      content: `You must be at least 13 years of age to use this Service. If you are under 18 years old, you must have permission from a parent or legal guardian to use the Service.

By using the Service, you represent and warrant that:
• You have the legal capacity to enter into these Terms
• You will comply with all applicable laws and regulations
• All information you provide is accurate and current
• You will maintain the security of your account credentials`
    },
    {
      id: 'account',
      title: '3. Account Registration',
      icon: '👤',
      content: `To access certain features of the Service, you must register for an account. When creating an account:

• You must provide accurate, complete, and current information
• You are responsible for maintaining the confidentiality of your password
• You are responsible for all activities that occur under your account
• You must notify us immediately of any unauthorized use of your account
• We reserve the right to suspend or terminate accounts that violate these Terms

You may not:
• Create an account using false information
• Create multiple accounts for deceptive purposes
• Share your account credentials with others
• Transfer your account to another person without our permission`
    },
    {
      id: 'conduct',
      title: '4. User Conduct and Content',
      icon: '⚖️',
      content: `You are solely responsible for all content you post, upload, or share on the Service. By posting content, you represent that you have all necessary rights to do so.

Prohibited Content and Activities:
• Harassment, bullying, or threatening behavior
• Hate speech, discrimination, or content promoting violence
• Sexually explicit, obscene, or pornographic material
• Spam, advertising, or commercial solicitation without permission
• Impersonation of others or misrepresentation of affiliation
• Infringement of intellectual property rights
• Sharing private information of others without consent
• Hacking, phishing, or distributing malware
• Manipulating platform features or circumventing restrictions
• Content that violates any applicable laws or regulations

We reserve the right to remove any content that violates these Terms and to suspend or terminate accounts of repeat offenders.`
    },
    {
      id: 'intellectual',
      title: '5. Intellectual Property Rights',
      icon: '©️',
      content: `Platform Content:
The Service and its original content, features, and functionality are owned by Nelly Korda Fan Community and are protected by international copyright, trademark, and other intellectual property laws.

User Content:
By posting content on the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and display your content for the purpose of operating and improving the Service.

You retain all ownership rights to your content. However, you are responsible for ensuring you have the right to post all content you share.

Third-Party Content:
The Service may contain content owned by third parties. Such content remains the property of its respective owners and is protected by applicable intellectual property laws.`
    },
    {
      id: 'privacy',
      title: '6. Privacy and Data Protection',
      icon: '🔒',
      content: `Your privacy is important to us. Our collection, use, and sharing of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.

By using the Service, you consent to:
• Collection of your personal and usage data as described in the Privacy Policy
• Use of cookies and similar tracking technologies
• Communication from us regarding your account and Service updates

We implement security measures to protect your data, but cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your account credentials.

For more information, please review our Privacy Policy.`
    },
    {
      id: 'termination',
      title: '7. Termination',
      icon: '🚫',
      content: `Account Termination by You:
You may terminate your account at any time by contacting us or using the account deletion feature in Settings. Upon termination, your right to use the Service will immediately cease.

Termination by Us:
We reserve the right to suspend or terminate your account and access to the Service at any time, with or without notice, for any reason, including but not limited to:
• Violation of these Terms
• Fraudulent, abusive, or illegal activity
• Extended periods of inactivity
• At our sole discretion to protect the Service or other users

Effect of Termination:
Upon termination, all licenses and rights granted to you will immediately cease. We may retain certain information as required by law or for legitimate business purposes.`
    },
    {
      id: 'disclaimer',
      title: '8. Disclaimers and Limitations',
      icon: '⚠️',
      content: `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

We do not warrant that:
• The Service will be uninterrupted, secure, or error-free
• The results obtained from using the Service will be accurate or reliable
• Any errors in the Service will be corrected
• The Service will meet your specific requirements

You use the Service at your own risk. We are not responsible for:
• User-generated content posted by others
• Actions or conduct of other users
• Loss of data or content
• Unauthorized access to your account
• Third-party websites or services linked from our platform`
    },
    {
      id: 'liability',
      title: '9. Limitation of Liability',
      icon: '🛡️',
      content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.

Our total liability to you for all claims arising from or relating to the Service shall not exceed the amount you paid to us in the twelve months prior to the claim, or $100, whichever is greater.

Some jurisdictions do not allow the exclusion of certain warranties or limitations of liability. In such jurisdictions, our liability will be limited to the maximum extent permitted by law.`
    },
    {
      id: 'indemnification',
      title: '10. Indemnification',
      icon: '🤝',
      content: `You agree to indemnify, defend, and hold harmless Nelly Korda Fan Community, its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorney fees, arising out of or in any way connected with:

• Your access to or use of the Service
• Your violation of these Terms
• Your violation of any rights of another party
• Your content posted on the Service
• Your conduct in connection with the Service

This indemnification obligation will survive the termination of these Terms and your use of the Service.`
    },
    {
      id: 'disputes',
      title: '11. Dispute Resolution',
      icon: '⚖️',
      content: `Informal Resolution:
If you have any dispute with us, you agree to contact us first and attempt to resolve the dispute informally by contacting our support team.

Governing Law:
These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which we operate, without regard to its conflict of law provisions.

Arbitration:
Any dispute arising from these Terms or the Service shall be resolved through binding arbitration, except that either party may seek injunctive relief in court for infringement of intellectual property rights.

Class Action Waiver:
You agree to resolve disputes with us on an individual basis and waive your right to participate in class action lawsuits or class-wide arbitration.`
    },
    {
      id: 'general',
      title: '12. General Provisions',
      icon: '📋',
      content: `Entire Agreement:
These Terms, together with our Privacy Policy, constitute the entire agreement between you and us regarding the Service.

Severability:
If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect.

Waiver:
Our failure to enforce any right or provision of these Terms will not be deemed a waiver of such right or provision.

Assignment:
You may not assign or transfer these Terms or your rights hereunder without our prior written consent. We may assign these Terms without restriction.

Updates to Terms:
We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on the Service. Your continued use after such changes constitutes acceptance of the modified Terms.

Contact Information:
If you have questions about these Terms, please contact us through the Contact page or email us at support@nellykordafans.com`
    }
  ];

  // Last Updated Date
  const lastUpdated = 'December 11, 2025';

  // Toggle Section
  const toggleSection = (id) => {
    setActiveSection(activeSection === id ? null : id);
  };

  return (
    <div className="terms-page">
      {/* Hero Section */}
      <div className="terms-hero">
        <div className="terms-hero-content">
          <h1>Terms of Service</h1>
          <p>Please read these terms carefully before using our platform</p>
          <div className="terms-meta">
            <span className="last-updated">Last Updated: {lastUpdated}</span>
            <a href="#" className="download-link">📄 Download PDF</a>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="terms-nav">
        <div className="terms-nav-content">
          <h3>Quick Navigation</h3>
          <div className="nav-links">
            {termsData.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(section.id)?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }}
              >
                {section.icon} {section.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Terms Content */}
      <div className="terms-container">
        {/* Introduction */}
        <div className="terms-intro">
          <h2>Welcome to Nelly Korda Fan Community</h2>
          <p>
            These Terms of Service ("Terms") govern your access to and use of the Nelly Korda Fan Community 
            platform, including any content, functionality, and services offered through our website and 
            mobile applications.
          </p>
          <p>
            By creating an account or using our Service, you acknowledge that you have read, understood, 
            and agree to be bound by these Terms and our Privacy Policy. If you do not agree with any part 
            of these Terms, you must not use the Service.
          </p>
        </div>

        {/* Terms Sections */}
        {termsData.map((section) => (
          <div key={section.id} id={section.id} className="terms-section">
            <div
              className="terms-section-header"
              onClick={() => toggleSection(section.id)}
            >
              <div className="section-title">
                <span className="section-icon">{section.icon}</span>
                <h2>{section.title}</h2>
              </div>
              <span className="section-toggle">
                {activeSection === section.id ? '−' : '+'}
              </span>
            </div>

            <div className={`terms-section-content ${activeSection === section.id ? 'active' : ''}`}>
              <div className="content-text">
                {section.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Agreement Section */}
        <div className="terms-agreement">
          <div className="agreement-box">
            <span className="agreement-icon">✓</span>
            <div className="agreement-content">
              <h3>By using our Service, you agree to these Terms</h3>
              <p>
                If you have any questions or concerns about these Terms of Service, please contact 
                our support team. We're here to help clarify any aspect of our policies.
              </p>
              <div className="agreement-buttons">
                <a href="/contact" className="btn-contact">Contact Support</a>
                <a href="/privacy" className="btn-privacy">View Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;