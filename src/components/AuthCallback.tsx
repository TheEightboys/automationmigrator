import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Loader className="mx-auto text-blue-400 animate-spin mb-4" size={48} />
        <p className="text-white text-lg font-semibold">Signing you in...</p>
        <p className="text-blue-300 text-sm mt-2">Redirecting to dashboard...</p>
      </div>
    </div>
  );
};
