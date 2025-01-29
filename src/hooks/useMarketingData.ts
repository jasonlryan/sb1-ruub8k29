import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { MarketingChannel, Employee } from '../types/model';

export function useMarketingData(userId: string) {
  const [channels, setChannels] = useState<MarketingChannel[]>([]);
  const [team, setTeam] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMarketingData();
  }, [userId]);

  const fetchMarketingData = async () => {
    try {
      // Fetch marketing channels
      const { data: channelsData, error: channelsError } = await supabase
        .from('marketing_channels')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (channelsError) throw channelsError;

      // Fetch marketing team
      const { data: teamData, error: teamError } = await supabase
        .from('marketing_team')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (teamError) throw teamError;

      setChannels(channelsData.map(channel => ({
        name: channel.name,
        monthlyBudget: channel.monthly_budget,
        costPerLead: channel.cost_per_lead,
        leadsGenerated: channel.leads_generated,
        notes: channel.notes || ''
      })));

      setTeam(teamData.map(member => ({
        role: member.role,
        fte: member.fte,
        salaryPerFte: member.salary_per_fte,
        monthlyTotal: member.monthly_total
      })));

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const updateChannel = async (index: number, channel: MarketingChannel) => {
    try {
      const { error } = await supabase
        .from('marketing_channels')
        .upsert({
          user_id: userId,
          name: channel.name,
          monthly_budget: channel.monthlyBudget,
          cost_per_lead: channel.costPerLead,
          leads_generated: channel.leadsGenerated,
          notes: channel.notes
        });

      if (error) throw error;

      const newChannels = [...channels];
      newChannels[index] = channel;
      setChannels(newChannels);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const updateTeamMember = async (index: number, member: Employee) => {
    try {
      const { error } = await supabase
        .from('marketing_team')
        .upsert({
          user_id: userId,
          role: member.role,
          fte: member.fte,
          salary_per_fte: member.salaryPerFte,
          monthly_total: member.monthlyTotal
        });

      if (error) throw error;

      const newTeam = [...team];
      newTeam[index] = member;
      setTeam(newTeam);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const deleteChannel = async (index: number) => {
    try {
      const channel = channels[index];
      const { error } = await supabase
        .from('marketing_channels')
        .delete()
        .eq('user_id', userId)
        .eq('name', channel.name);

      if (error) throw error;

      setChannels(channels.filter((_, i) => i !== index));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const deleteTeamMember = async (index: number) => {
    try {
      const member = team[index];
      const { error } = await supabase
        .from('marketing_team')
        .delete()
        .eq('user_id', userId)
        .eq('role', member.role);

      if (error) throw error;

      setTeam(team.filter((_, i) => i !== index));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return {
    channels,
    team,
    loading,
    error,
    updateChannel,
    updateTeamMember,
    deleteChannel,
    deleteTeamMember,
    refetch: fetchMarketingData
  };
}