import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const JoinNow = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to register page immediately
    navigate('/register', { replace: true });
  }, [navigate]);

  // Show loading screen while redirecting
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f3f2ef'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px',
          animation: 'spin 1s linear infinite'
        }}>
          ⚡
        </div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#0a66c2',
          margin: '0 0 12px'
        }}>
          Redirecting to Registration...
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#666666',
          margin: 0
        }}>
          Join the Nelly Korda Fan Community
        </p>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default JoinNow;