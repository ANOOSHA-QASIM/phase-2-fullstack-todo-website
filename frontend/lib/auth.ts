/**
 * Authentication utilities for token handling only
 * This file contains functions for managing authentication tokens
 * as per the specification that requires token consumption only
 */

// Get the auth token from storage
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Set the auth token in storage
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
};

// Remove the auth token from storage
export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
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