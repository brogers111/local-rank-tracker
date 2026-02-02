import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const justLoggedInRef = React.useRef(false);

  // Configuration - update this with your parent app's validation endpoint
  const PARENT_APP_VALIDATE_URL = import.meta.env.VITE_PARENT_APP_VALIDATE_URL || '/api/external-app/validate-token';
  const APP_ID = import.meta.env.VITE_APP_ID || 'local-rank-tracker';

  // Check if token is expired (client-side check)
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };

  // Validate token is for this app
  const isTokenForThisApp = (token) => {
    try {
      const decoded = jwtDecode(token);
      // Check 'aud' (audience) claim
      return decoded.aud === APP_ID;
    } catch (error) {
      console.error('Error validating app ID:', error);
      return false;
    }
  };

  // Validate token with parent app (server-side check)
  const validateTokenWithParent = async (token) => {
    try {
      const response = await fetch(PARENT_APP_VALIDATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        return { valid: false, error: 'Validation request failed' };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error validating token with parent app:', error);
      return { valid: false, error: error.message };
    }
  };

  // Login function - called when receiving token
  const login = async (newToken, onReady) => {
    setIsLoading(true);

    // Client-side expiration check
    if (isTokenExpired(newToken)) {
      console.error('Token is expired');
      setIsLoading(false);
      return false;
    }

    // Validate token is for this app
    if (!isTokenForThisApp(newToken)) {
      console.error('Token is not valid for this application');
      setIsLoading(false);
      return false;
    }

    // Validate with parent app
    const validationResult = await validateTokenWithParent(newToken);
    if (!validationResult.valid) {
      console.error('Token validation failed with parent app:', validationResult.error);
      setIsLoading(false);
      return false;
    }

    // Decode and store user info
    try {
      const decoded = jwtDecode(newToken);
      
      // Store in sessionStorage first (cleared when tab closes)
      sessionStorage.setItem('auth_token', newToken);
      
      // Mark that we just logged in to prevent redundant validation
      justLoggedInRef.current = true;
      
      // Batch all state updates together using React.startTransition or flushSync
      // For React 18, we can use flushSync to ensure updates happen immediately
      React.startTransition(() => {
        setUser(decoded);
        setToken(newToken);
        setIsAuthenticated(true);
        setIsLoading(false);
      });
      
      // Call the ready callback after state updates are scheduled
      // Use setTimeout to ensure state updates have been flushed
      if (onReady) {
        setTimeout(() => onReady(), 0);
      }
      
      return true;
    } catch (error) {
      console.error('Error processing token:', error);
      setIsLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem('auth_token');
  };

  // Get token for API calls
  const getToken = () => token;

  // Check for existing token on mount
  useEffect(() => {
    // Skip if we just logged in to prevent redundant validation
    if (justLoggedInRef.current) {
      justLoggedInRef.current = false;
      return;
    }
    
    const storedToken = sessionStorage.getItem('auth_token');
    if (storedToken) {
      if (!isTokenExpired(storedToken)) {
        try {
          const decoded = jwtDecode(storedToken);
          setUser(decoded);
          setToken(storedToken);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error restoring session:', error);
          sessionStorage.removeItem('auth_token');
        }
      } else {
        sessionStorage.removeItem('auth_token');
      }
    }
    setIsLoading(false);
  }, []);

  // Optional: Periodic token validation
  useEffect(() => {
    if (!token || !isAuthenticated) return;

    // Check expiration every minute
    const interval = setInterval(() => {
      if (isTokenExpired(token)) {
        console.log('Token expired, logging out');
        logout();
      }
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, [token, isAuthenticated]);

  const value = {
    token,
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    getToken,
    validateTokenWithParent
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
