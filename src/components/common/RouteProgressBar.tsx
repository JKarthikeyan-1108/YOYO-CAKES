import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * RouteProgressBar provides an innovative visual transition indicator across page navigations.
 * It sweeps across the top of the viewport with a glowing golden honey sheen.
 */
export default function RouteProgressBar() {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start progress pulse on route change
    const startTimer = setTimeout(() => {
      setIsNavigating(true);
      setProgress(35);
    }, 0);

    const midTimer = setTimeout(() => {
      setProgress(75);
    }, 90);

    const finishTimer = setTimeout(() => {
      setProgress(100);
      const hideTimer = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 180);
      return () => clearTimeout(hideTimer);
    }, 240);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(midTimer);
      clearTimeout(finishTimer);
    };
  }, [location.pathname, location.search]);

  if (!isNavigating && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[3px] z-[9999] pointer-events-none bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#FEF08A] shadow-[0_0_10px_#F59E0B] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
