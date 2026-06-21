import { useState, useEffect, useRef } from 'react';

/**
 * Animated counter hook with easeOutExpo easing.
 * Counts from 0 to `end` when `shouldStart` is true.
 */
export function useCountUp(end, { duration = 2000, shouldStart = false, prefix = '', suffix = '' } = {}) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!shouldStart) return;

    const startTime = performance.now();
    const startVal = 0;

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const current = Math.round(startVal + (end - startVal) * easedProgress);

      setCount(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration, shouldStart]);

  return `${prefix}${count.toLocaleString()}${suffix}`;
}
