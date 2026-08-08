'use client';

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router doesn't reset scroll position on navigation by itself —
// unlike a traditional multi-page site, moving to a new route in a
// single-page app keeps wherever you happened to be scrolled to. This
// component fixes that globally: it renders nothing, it just watches the
// URL and scrolls to the top every time it changes.
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;