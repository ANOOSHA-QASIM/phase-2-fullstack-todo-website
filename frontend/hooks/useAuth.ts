/**
 * Authentication hook for Phase 3 AI-powered Todo Chatbot.
 * Enhanced for inline authentication (US1: T018-T020)
 *
 * Constitutional Compliance: This hook strictly follows the Phase 3 System Constitution.
 */

'use client';

import { useState, useEffect } from 'react';
import { getUserFromToken, isAuthenticated, removeToken } from '@/lib/auth';

interface User {
  id: string;
  email?: string;
  [key: string]: any;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authenticated = isAuthenticated();

        if (authenticated) {
          const userData = getUserFromToken();

          if (userData) {
            // T020: Check token expiry if exp claim exists
            if (userData.exp) {
              const currentTime = Math.floor(Date.now() / 1000);
              if (userData.exp < currentTime) {
                console.log('Token expired, clearing from localStorage');
                // T026: Clear expired token from localStorage
                removeToken();
                setUser(null);
                setIsAuth(false);
                setLoading(false);
                return;
              }
            }

            // T019: Extract user ID from token payload
            // Common JWT payload fields: sub, user_id, id
            const userId = userData.sub || userData.user_id || userData.id;

            if (userId) {
              setUser({
                id: userId,
                email: userData.email,
                ...userData
              });
              setIsAuth(true);
            } else {
              console.error('No user ID found in token payload');
              setUser(null);
              setIsAuth(false);
            }
          } else {
            // Token exists but couldn't be decoded
            console.error('Invalid token structure');
            removeToken();
            setUser(null);
            setIsAuth(false);
          }
        } else {
          setUser(null);
          setIsAuth(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Clear invalid token on error
        removeToken();
        setUser(null);
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return {
    user,
    userId: user?.id || null,
    isAuthenticated: isAuth,
    loading
  };
}
