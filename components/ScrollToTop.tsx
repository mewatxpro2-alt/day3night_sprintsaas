import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop
 * 
 * A utility component that automatically scrolls the window to the top
 * whenever the route path changes. This ensures valid UX navigation
 * behavior in the SPA.
 */
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Instant scroll to top on route change
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
