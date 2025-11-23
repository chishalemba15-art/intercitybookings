'use client';

import { useEffect, useRef } from 'react';

interface ScrollAnalytics {
  maxScrollDepth: number;
  timeOnPage: number;
  sectionsViewed: string[];
  scrollEvents: number;
}

export function useScrollAnalytics(userId?: string) {
  const analyticsRef = useRef<ScrollAnalytics>({
    maxScrollDepth: 0,
    timeOnPage: 0,
    sectionsViewed: [],
    scrollEvents: 0,
  });

  const startTimeRef = useRef<number>(Date.now());
  const hasTrackedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      analyticsRef.current.scrollEvents++;
      analyticsRef.current.maxScrollDepth = Math.max(
        analyticsRef.current.maxScrollDepth,
        scrollDepth
      );

      // Track sections in viewport
      const sections = document.querySelectorAll('[data-section]');
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const sectionName = section.getAttribute('data-section');

        if (
          rect.top < window.innerHeight &&
          rect.bottom > 0 &&
          sectionName &&
          !hasTrackedRef.current.has(sectionName)
        ) {
          analyticsRef.current.sectionsViewed.push(sectionName);
          hasTrackedRef.current.add(sectionName);
        }
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveAnalytics();
      }
    };

    const saveAnalytics = async () => {
      const timeOnPage = Math.round((Date.now() - startTimeRef.current) / 1000);
      analyticsRef.current.timeOnPage = timeOnPage;

      try {
        await fetch('/api/analytics/scroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            maxScrollDepth: analyticsRef.current.maxScrollDepth,
            timeOnPage,
            sectionsViewed: analyticsRef.current.sectionsViewed,
            scrollEvents: analyticsRef.current.scrollEvents,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.error('Failed to save scroll analytics:', error);
      }
    };

    // Set up event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Save analytics on unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      saveAnalytics();
    };
  }, [userId]);

  return analyticsRef.current;
}
