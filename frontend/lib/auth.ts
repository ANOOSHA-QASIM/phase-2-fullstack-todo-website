/**
 * Authentication utilities and hooks for Phase 3 AI-powered Todo Chatbot
 * Constitutional Compliance: This module strictly follows the Phase 3 System Constitution.
 */

'use client';

import { useState, useEffect } from 'react';

// Get the auth token from storage
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

// Set the auth token in storage
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
};

// Remove the auth token from storage
export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
};

// Check if the user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return token !== null && token !== '';
};

// Get user info from token (decode JWT payload)
export const getUserFromToken = (): any | null => {
  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    // Split the token to get the payload part (middle part of JWT)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    // Add padding if needed
    const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const decodedPayload = atob(paddedPayload);

    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * useAuth hook - Extract userId from JWT token and provide authentication state
 *
 * Returns:
 * - userId: string | null - User ID extracted from JWT token (sub claim)
 * - isAuthenticated: boolean - Whether user has valid token
 */
export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const decoded = getUserFromToken();
        if (decoded && decoded.sub) {
          setUserId(decoded.sub);
          setIsAuthenticated(true);
        } else {
          setUserId(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error extracting userId from token:', error);
        setUserId(null);
        setIsAuthenticated(false);
      }
    } else {
      setUserId(null);
      setIsAuthenticated(false);
    }
  }, []);

  return { userId, isAuthenticated };
}
