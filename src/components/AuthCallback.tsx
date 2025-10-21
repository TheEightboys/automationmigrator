import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader } from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      if (data.session) {
        // User is authenticated, redirect to dashboard
        navigate('/dashboard');
      } else {
        // No session, redirect to login
        navigate('/');
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader className="mx-auto text-blue-600 animate-spin mb-4" size={48} />
        <p className="text-gray-600">Signing you in...</p>
      </div>
    </div>
  );
};
