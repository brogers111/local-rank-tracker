import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, ShieldAlert, ArrowRight } from 'lucide-react';
import amsiveLogo from '../assets/amsive-logo.png';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Fallback: check sessionStorage if state seems out of sync
  const hasStoredToken = sessionStorage.getItem('auth_token');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-white text-lg">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // If there's a token in storage but state isn't updated yet, show loading instead
    if (hasStoredToken) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <p className="text-white text-lg">Loading...</p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex items-center justify-center p-4">
        <div className="text-center">
          <img src={amsiveLogo} alt="Amsive" className="h-12 mx-auto mb-8" />
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Authentication Required
          </h1>
        </div>
      </div>
    );
  }

  return children;
}
