import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Just redirect to dashboard, auth is already handled by Supabase
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader className="mx-auto text-blue-600 animate-spin mb-4" size={48} />
        <p className="text-gray-600 text-lg">Signing you in...</p>
        <p className="text-gray-400 text-sm mt-2">Redirecting to dashboard...</p>
      </div>
    </div>
  );
};
  