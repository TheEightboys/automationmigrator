// src/hooks/useSubscription.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface SubscriptionData {
  plan: 'free' | 'lite' | 'pro';
  status: 'active' | 'inactive' | 'cancelled';
  period_end: string | null;
}

export interface UsageData {
  used: number;
  total: number;
  remaining: number;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    plan: 'free',
    status: 'active',
    period_end: null
  });
  const [usage, setUsage] = useState<UsageData>({
    used: 0,
    total: 10,
    remaining: 10
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscription();
      loadUsage();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (data && !error) {
        setSubscription({
          plan: data.plan || 'free',
          status: data.status || 'active',
          period_end: data.period_end || null
        });
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      // Keep default values
    } finally {
      setLoading(false);
    }
  };

  const loadUsage = async () => {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from('migrations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .gte('created_at', startOfMonth.toISOString());

      const used = count || 0;
      const total = subscription.plan === 'free' ? 10 : 
                   subscription.plan === 'lite' ? 50 : 250;
      
      setUsage({
        used,
        total,
        remaining: Math.max(0, total - used)
      });
    } catch (error) {
      console.error('Error loading usage:', error);
      // Keep default values
    }
  };

  return {
    subscription,
    usage,
    loading,
    reload: () => {
      if (user) {
        loadSubscription();
        loadUsage();
      }
    }
  };
}
