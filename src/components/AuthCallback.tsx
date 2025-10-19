import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { RefreshCw } from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get session after OAuth redirect
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/');
          return;
        }

        if (session) {
          // Successfully authenticated, redirect to dashboard
          navigate('/dashboard');
        } else {
          // No session, redirect to home
          navigate('/');
        }
      } catch (error) {
        console.error('Callback error:', error);
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="mx-auto text-orange-500 animate-spin mb-4" size={48} />
        <p className="text-gray-600 text-lg">Completing sign in...</p>
      </div>
    </div>
  );
};
