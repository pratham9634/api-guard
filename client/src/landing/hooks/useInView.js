import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to detect when an element enters the viewport.
 * Uses IntersectionObserver for performant scroll-triggered animations.
 */
export function useInView(options = {}) {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isInView];
}
