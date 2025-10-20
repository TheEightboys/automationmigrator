import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface SubscriptionInfo {
  plan: 'free' | 'basic' | 'pro';
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  migrationsUsed: number;
  migrationsLimit: number;
  periodEnd: Date | null;
  canMigrate: boolean;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    plan: 'free',
    status: 'inactive',
    migrationsUsed: 0,
    migrationsLimit: 10,
    periodEnd: null,
    canMigrate: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_plan, subscription_status, subscription_period_end, migrations_used')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const plan = (data?.subscription_plan || 'free') as 'free' | 'basic' | 'pro';
      const migrationsLimit = plan === 'pro' ? -1 : plan === 'basic' ? 20 : 10;
      const migrationsUsed = data?.migrations_used || 0;
      const canMigrate = migrationsLimit === -1 || migrationsUsed < migrationsLimit;

      setSubscription({
        plan,
        status: data?.subscription_status || 'inactive',
        migrationsUsed,
        migrationsLimit,
        periodEnd: data?.subscription_period_end ? new Date(data.subscription_period_end) : null,
        canMigrate,
      });
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementMigrationCount = async () => {
    if (!user) return false;

    const { data } = await supabase
      .from('profiles')
      .select('migrations_used')
      .eq('id', user.id)
      .single();

    const newCount = (data?.migrations_used || 0) + 1;

    const { error } = await supabase
      .from('profiles')
      .update({ migrations_used: newCount })
      .eq('id', user.id);

    if (error) return false;

    await loadSubscription();
    return true;
  };

  return {
    subscription,
    loading,
    incrementMigrationCount,
    refreshSubscription: loadSubscription,
  };
};
