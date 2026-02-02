import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoadPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const hasProcessedToken = useRef(false);

  useEffect(() => {
    // Prevent multiple validations (especially in React.StrictMode)
    if (hasProcessedToken.current) return;
    
    const processToken = async () => {
      hasProcessedToken.current = true;
      
      // Get token from URL parameter
      const token = searchParams.get('token');

      if (!token) {
        setError('No authentication token provided');
        return;
      }

      // Attempt to login with the token and wait for it to be ready
      const success = await login(token, () => {
        setAuthReady(true);
      });

      if (!success) {
        setError('Invalid or expired token');
      }
    };

    processToken();
  }, [searchParams, login]);
  
  // Only navigate after auth state is fully ready
  useEffect(() => {
    if (authReady) {
      // Remove token from URL for security
      navigate('/', { replace: true });
    }
  }, [authReady, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Authentication Error</h1>
          <p className="text-purple-200 mb-6">{error}</p>
          <p className="text-sm text-purple-300">
            Please return to the parent application and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="text-white text-lg">Authenticating...</p>
        </div>
      </div>
    </div>
  );
}
