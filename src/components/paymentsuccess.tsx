import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Update user subscription in database
    updateSubscription();
  }, []);

  const updateSubscription = async () => {
    if (!user) return;

    // Get URL parameters from Dodo
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('payment_id');
    const plan = urlParams.get('plan') || 'basic';

    // Update user profile
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_plan: plan,
        subscription_status: 'active',
        subscription_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        migrations_used: 0,
        migrations_reset_date: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating subscription:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600" size={48} />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-8">
          Your subscription has been activated. You can now enjoy all the premium features.
        </p>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};
