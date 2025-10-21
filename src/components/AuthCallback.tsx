import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to process the OAuth response in the URL (hash or query)
    // supabase.auth.getSessionFromUrl will parse the url and set the session
    const handle = async () => {
      try {
        // supabase-js v2 provides getSessionFromUrl to handle OAuth redirects
        // If this method is not available in your installed version, this call will be a no-op
        // and the AuthContext's onAuthStateChange/getSession will pick up the session.
        if ((supabase.auth as any).getSessionFromUrl) {
          await (supabase.auth as any).getSessionFromUrl();
        }

        // Small delay to allow auth state to propagate, then navigate to dashboard
        setTimeout(() => navigate('/dashboard'), 800);
      } catch (err: any) {
        console.error('Error processing OAuth callback:', err);
        setError(err?.message ?? 'Unknown error');
        // Still try to navigate after showing error briefly
        setTimeout(() => navigate('/'), 2000);
      }
    };

    handle();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Loader className="mx-auto text-blue-400 animate-spin mb-4" size={48} />
        <p className="text-white text-lg font-semibold">Signing you in...</p>
        {error ? (
          <p className="text-red-300 text-sm mt-2">{error}</p>
        ) : (
          <p className="text-blue-300 text-sm mt-2">Redirecting to dashboard...</p>
        )}
      </div>
    </div>
  );
};
