"use client";

import { useRef, useEffect, useState } from "react";

interface UseScrollRevealOptions {
  threshold?: number;
  margin?: string;
  once?: boolean;
}

/**
 * IntersectionObserver hook for scroll-triggered reveals.
 * Returns a ref to attach and a boolean `isInView`.
 *
 * Usage:
 *   const ref = useScrollReveal<HTMLDivElement>({ once: true });
 *   <motion.div ref={ref} animate={isInView ? "visible" : "hidden"}>
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
) {
  const { threshold = 0.1, margin = "-60px", once = true } = options;
  const ref = useRef<T>(null!);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin: margin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, margin, once]);

  return { ref, isInView };
}
