import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Subscription } from '../types/model';

export function useSubscriptionData(userId: string) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, [userId]);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setSubscriptions(data.map(sub => ({
        tier: sub.tier,
        monthlyPrice: sub.monthly_price,
        subscriberCount: sub.subscriber_count,
        mrr: sub.mrr
      })));

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const updateSubscription = async (index: number, subscription: Subscription) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          tier: subscription.tier,
          monthly_price: subscription.monthlyPrice,
          subscriber_count: subscription.subscriberCount,
          mrr: subscription.mrr
        });

      if (error) throw error;

      const newSubscriptions = [...subscriptions];
      newSubscriptions[index] = subscription;
      setSubscriptions(newSubscriptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const deleteSubscription = async (index: number) => {
    try {
      const subscription = subscriptions[index];
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', userId)
        .eq('tier', subscription.tier);

      if (error) throw error;

      setSubscriptions(subscriptions.filter((_, i) => i !== index));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return {
    subscriptions,
    loading,
    error,
    updateSubscription,
    deleteSubscription,
    refetch: fetchSubscriptions
  };
}