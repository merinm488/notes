/**
 * Tooltip Component
 *
 * Provides instant tooltip feedback without browser delay
 * Automatically positions above or below based on available space
 * Disabled on mobile devices for better UX
 */
import { useState, useRef, useEffect } from 'react';

export function Tooltip({ children, text }) {
  const [showAbove, setShowAbove] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Check if device is mobile (screen width < 1024px)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (containerRef.current && !isMobile) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;

      // Show below if not enough space above
      setShowAbove(spaceAbove > 100);
    }
  }, [isMobile]);

  // On mobile, just return children without tooltip
  if (isMobile) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} className="relative group inline-block">
      {children}
      <div
        className={`absolute left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 ${
          showAbove ? 'bottom-full mb-2' : 'top-full mt-2'
        }`}
      >
        {text}
        <div
          className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${
            showAbove
              ? 'top-full border-t-gray-900 dark:border-t-gray-100'
              : 'bottom-full border-b-gray-900 dark:border-b-gray-100'
          }`}
        ></div>
      </div>
    </div>
  );
}
