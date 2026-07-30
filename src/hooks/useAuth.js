import { useState, useCallback } from 'react';
import { generateHash, isValidKey, normalizeKey } from '../lib/cryptoUtils';

/**
 * Authentication Hook
 * Manages login, account creation via TextDB API
 */
export function useAuth() {
  const [userHash, setUserHash] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);

  /**
   * Login with a three-word key (existing account only)
   * @param {string} key - The three-word key
   * @returns {Promise<Object>} - Login result { success, error }
   */
  const login = useCallback(async (key) => {
    setIsLoading(true);
    setError(null);
    setErrorCode(null);

    try {
      const normalizedKey = normalizeKey(key);

      if (!isValidKey(normalizedKey)) {
        setError('Invalid key format. Use three words separated by hyphens (e.g., sky-fill-cycle)');
        setErrorCode('INVALID_FORMAT');
        setIsLoading(false);
        return { success: false, error: 'Invalid key format' };
      }

      // Send the key to server for hashing and authentication
      const response = await fetch('/api/notes/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: normalizedKey })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError('No account found with this key');
          setErrorCode('USER_NOT_FOUND');
          setIsLoading(false);
          return { success: false, error: 'No account found', code: 'USER_NOT_FOUND' };
        }

        throw new Error(data.error || 'Login failed');
      }

      // User exists - set session and login
      setUserHash(data.hash);
      setIsAuthenticated(true);
      sessionStorage.setItem('secure_notes_hash', data.hash);

      setIsLoading(false);
      return {
        success: true,
        message: 'Welcome back!'
      };

    } catch (err) {
      setError('Login failed. Please try again.');
      setErrorCode('LOGIN_ERROR');
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Create a new account with a three-word key
   * @param {string} key - The three-word key
   * @returns {Promise<Object>} - Creation result { success, error }
   */
  const createAccount = useCallback(async (key) => {
    setIsLoading(true);
    setError(null);
    setErrorCode(null);

    try {
      const normalizedKey = normalizeKey(key);

      if (!isValidKey(normalizedKey)) {
        setError('Invalid key format. Use three words separated by hyphens (e.g., sky-fill-cycle)');
        setErrorCode('INVALID_FORMAT');
        setIsLoading(false);
        return { success: false, error: 'Invalid key format' };
      }

      // Create account via API
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: normalizedKey })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'USER_EXISTS') {
          setError('An account with this key already exists');
          setErrorCode('USER_EXISTS');
        } else {
          setError(data.error || 'Account creation failed');
          setErrorCode('CREATE_ERROR');
        }
        setIsLoading(false);
        return { success: false, error: data.error };
      }

      // Account created - use server-generated hash
      setUserHash(data.hash);
      setIsAuthenticated(true);
      sessionStorage.setItem('secure_notes_hash', data.hash);

      setIsLoading(false);
      return {
        success: true,
        message: 'Account created successfully!'
      };

    } catch (err) {
      setError('Account creation failed. Please try again.');
      setErrorCode('CREATE_ERROR');
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Logout - clear session
   */
  const logout = useCallback(() => {
    setUserHash(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem('secure_notes_hash');
  }, []);

  /**
   * Check for existing session on mount
   */
  const checkSession = useCallback(async () => {
    const savedHash = sessionStorage.getItem('secure_notes_hash');
    if (savedHash) {
      try {
        const response = await fetch(`/api/notes?hash=${encodeURIComponent(savedHash)}`);
        if (response.ok) {
          setUserHash(savedHash);
          setIsAuthenticated(true);
          return true;
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }
    }
    return false;
  }, []);

  return {
    userHash,
    isAuthenticated,
    isLoading,
    error,
    errorCode,
    login,
    createAccount,
    logout,
    checkSession
  };
}
