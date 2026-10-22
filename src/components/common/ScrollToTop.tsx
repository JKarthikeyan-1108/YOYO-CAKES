import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop guarantees that whenever a user navigates from one page to another
 * (e.g. clicking a product card from the shop page), the browser smoothly scrolls
 * to the very top (0, 0) instead of retaining the prior page's scroll position.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Check if there is an explicit hash target (e.g. #reviews)
    if (!window.location.hash) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
    }
  }, [pathname, search]);

  return null;
}
