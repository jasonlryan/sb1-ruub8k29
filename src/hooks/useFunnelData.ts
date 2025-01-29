import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FunnelConversion } from '../types/model';

export function useFunnelData(userId: string) {
  const [conversions, setConversions] = useState<FunnelConversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversions();
  }, [userId]);

  const fetchConversions = async () => {
    try {
      const { data, error } = await supabase
        .from('funnel_conversions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setConversions(data.map(conv => ({
        channel: conv.channel,
        mql: conv.mql,
        mqlToSqlRate: conv.mql_to_sql_rate,
        sql: conv.sql,
        sqlToDealRate: conv.sql_to_deal_rate,
        deals: conv.deals
      })));

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const updateConversion = async (index: number, conversion: FunnelConversion) => {
    try {
      const { error } = await supabase
        .from('funnel_conversions')
        .upsert({
          user_id: userId,
          channel: conversion.channel,
          mql: conversion.mql,
          mql_to_sql_rate: conversion.mqlToSqlRate,
          sql: conversion.sql,
          sql_to_deal_rate: conversion.sqlToDealRate,
          deals: conversion.deals
        });

      if (error) throw error;

      const newConversions = [...conversions];
      newConversions[index] = conversion;
      setConversions(newConversions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const deleteConversion = async (index: number) => {
    try {
      const conversion = conversions[index];
      const { error } = await supabase
        .from('funnel_conversions')
        .delete()
        .eq('user_id', userId)
        .eq('channel', conversion.channel);

      if (error) throw error;

      setConversions(conversions.filter((_, i) => i !== index));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return {
    conversions,
    loading,
    error,
    updateConversion,
    deleteConversion,
    refetch: fetchConversions
  };
}