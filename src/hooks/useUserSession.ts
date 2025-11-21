'use client';

import { useState, useEffect } from 'react';

interface UserSession {
  name: string;
  phone: string;
  searchCount: number;
  registeredAt: string;
}

const STORAGE_KEY = 'intercity_user_session';
const MAX_FREE_SEARCHES = 1;

export function useUserSession() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load session from localStorage on mount
    const storedSession = localStorage.getItem(STORAGE_KEY);
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setSession(parsedSession);
      } catch (error) {
        console.error('Failed to parse session:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const saveSession = (sessionData: UserSession) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    setSession(sessionData);
  };

  const register = (name: string, phone: string) => {
    const newSession: UserSession = {
      name,
      phone,
      searchCount: session?.searchCount || 0,
      registeredAt: new Date().toISOString(),
    };
    saveSession(newSession);
  };

  const incrementSearchCount = () => {
    const updatedSession: UserSession = session
      ? { ...session, searchCount: session.searchCount + 1 }
      : {
          name: '',
          phone: '',
          searchCount: 1,
          registeredAt: new Date().toISOString(),
        };
    saveSession(updatedSession);
  };

  const canSearch = () => {
    if (!session || !session.phone) {
      // Not registered yet
      return session ? session.searchCount < MAX_FREE_SEARCHES : true;
    }
    // Registered users can search unlimited
    return true;
  };

  const needsRegistration = () => {
    if (!session || !session.phone) {
      return session ? session.searchCount >= MAX_FREE_SEARCHES : false;
    }
    return false;
  };

  const isRegistered = () => {
    return session ? !!session.phone : false;
  };

  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  };

  return {
    session,
    isLoading,
    register,
    incrementSearchCount,
    canSearch,
    needsRegistration,
    isRegistered,
    clearSession,
  };
}
