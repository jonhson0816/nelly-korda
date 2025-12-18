import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Don't scroll to top for messenger/chat page
    if (pathname === '/chat') {
      return;
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use 'smooth' for smooth scrolling
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;