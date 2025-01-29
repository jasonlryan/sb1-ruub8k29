import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { MarketingSection } from './components/MarketingSection';
import { FunnelSection } from './components/FunnelSection';
import { SubscriptionSection } from './components/SubscriptionSection';
import { RevenueSection } from './components/RevenueSection';
import { ExpensesSection } from './components/ExpensesSection';
import { FinancingSection } from './components/FinancingSection';
import { Calculator, TrendingUp, Users, CreditCard, Building2, Briefcase, LogOut, Save } from 'lucide-react';
import { FinancialSummary } from './components/FinancialSummary';
import { AuthForm } from './components/AuthForm';
import { useSupabase } from './contexts/SupabaseContext';
import { migrateInitialData } from './migration';
import { supabase } from './lib/supabase';
import {
  MarketingChannel,
  Employee,
  FunnelConversion,
  Subscription,
  OperatingExpense,
  FundingRound,
  ActiveSubscribers,
  COGS,
  Department
} from './types/model';

function App() {
  const { user, signOut } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Initialize state variables
  const [marketingChannels, setMarketingChannels] = useState<MarketingChannel[]>([]);
  const [marketingTeam, setMarketingTeam] = useState<Employee[]>([]);
  const [funnelConversions, setFunnelConversions] = useState<FunnelConversion[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activeSubscribers, setActiveSubscribers] = useState<ActiveSubscribers[]>([]);
  const [cogs, setCogs] = useState<COGS[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [operatingExpenses, setOperatingExpenses] = useState<OperatingExpense[]>([]);
  const [fundingRounds, setFundingRounds] = useState<FundingRound[]>([]);

  // Load data from Supabase
  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('Starting data load...');
        
        // First, migrate initial data if needed
        const migrationResult = await migrateInitialData(user.id);
        if (!migrationResult.success) {
          console.error('Migration failed:', migrationResult.error);
          throw new Error('Failed to migrate initial data');
        }
        console.log('Migration completed:', migrationResult);

        // Now fetch all data
        console.log('Fetching data from Supabase...');
        const [
          { data: channelsData, error: channelsError },
          { data: teamData, error: teamError },
          { data: funnelData, error: funnelError },
          { data: subsData, error: subsError },
          { data: activeSubsData, error: activeSubsError },
          { data: cogsData, error: cogsError },
          { data: deptsData, error: deptsError },
          { data: opexData, error: opexError },
          { data: fundingData, error: fundingError }
        ] = await Promise.all([
          supabase.from('marketing_channels').select('*').eq('user_id', user.id),
          supabase.from('marketing_team').select('*').eq('user_id', user.id),
          supabase.from('funnel_conversions').select('*').eq('user_id', user.id),
          supabase.from('subscriptions').select('*').eq('user_id', user.id),
          supabase.from('active_subscribers').select('*').eq('user_id', user.id),
          supabase.from('cogs').select('*').eq('user_id', user.id),
          supabase.from('departments').select('*').eq('user_id', user.id),
          supabase.from('operating_expenses').select('*').eq('user_id', user.id),
          supabase.from('funding_rounds').select('*').eq('user_id', user.id)
        ]);

        if (channelsError) {
          console.error('Channels error:', channelsError);
          throw channelsError;
        }
        if (teamError) {
          console.error('Team error:', teamError);
          throw teamError;
        }
        if (funnelError) {
          console.error('Funnel error:', funnelError);
          throw funnelError;
        }
        if (subsError) {
          console.error('Subscriptions error:', subsError);
          throw subsError;
        }
        if (activeSubsError) {
          console.error('Active subscribers error:', activeSubsError);
          throw activeSubsError;
        }
        if (cogsError) {
          console.error('COGS error:', cogsError);
          throw cogsError;
        }
        if (deptsError) {
          console.error('Departments error:', deptsError);
          throw deptsError;
        }
        if (opexError) {
          console.error('Operating expenses error:', opexError);
          throw opexError;
        }
        if (fundingError) {
          console.error('Funding rounds error:', fundingError);
          throw fundingError;
        }

        console.log('Data fetched successfully:', {
          channels: channelsData?.length || 0,
          team: teamData?.length || 0,
          funnel: funnelData?.length || 0,
          subs: subsData?.length || 0,
          activeSubs: activeSubsData?.length || 0,
          cogs: cogsData?.length || 0,
          depts: deptsData?.length || 0,
          opex: opexData?.length || 0,
          funding: fundingData?.length || 0
        });

        // Update state with fetched data
        if (channelsData) {
          setMarketingChannels(channelsData.map(channel => ({
            name: channel.name,
            monthlyBudget: channel.monthly_budget,
            costPerLead: channel.cost_per_lead,
            leadsGenerated: channel.leads_generated,
            notes: channel.notes || ''
          })));
        }

        if (teamData) {
          setMarketingTeam(teamData.map(member => ({
            role: member.role,
            fte: member.fte,
            salaryPerFte: member.salary_per_fte,
            monthlyTotal: member.monthly_total
          })));
        }

        if (funnelData) {
          setFunnelConversions(funnelData.map(conv => ({
            channel: conv.channel,
            mql: conv.mql,
            mqlToSqlRate: conv.mql_to_sql_rate,
            sql: conv.sql,
            sqlToDealRate: conv.sql_to_deal_rate,
            deals: conv.deals
          })));
        }

        if (subsData) {
          setSubscriptions(subsData.map(sub => ({
            tier: sub.tier,
            monthlyPrice: sub.monthly_price,
            subscriberCount: sub.subscriber_count,
            mrr: sub.mrr
          })));
        }

        if (activeSubsData) {
          setActiveSubscribers(activeSubsData.map(sub => ({
            month: sub.month,
            existingSubs: sub.existing_subs,
            newDeals: sub.new_deals,
            churnedSubs: sub.churned_subs,
            endingSubs: sub.ending_subs
          })));
        }

        if (cogsData) {
          setCogs(cogsData.map(cost => ({
            category: cost.category,
            monthlyCost: cost.monthly_cost,
            notes: cost.notes || ''
          })));
        }

        if (deptsData) {
          setDepartments(deptsData.map(dept => ({
            name: dept.name,
            fte: dept.fte,
            salary: dept.salary,
            additionalCosts: dept.additional_costs,
            monthlyTotal: dept.monthly_total
          })));
        }

        if (opexData) {
          setOperatingExpenses(opexData.map(expense => ({
            category: expense.category,
            monthlyCost: expense.monthly_cost,
            notes: expense.notes || ''
          })));
        }

        if (fundingData) {
          setFundingRounds(fundingData.map(round => ({
            round: round.round,
            amountRaised: round.amount_raised,
            valuationPre: round.valuation_pre,
            equitySold: round.equity_sold,
            closeDate: round.close_date || ''
          })));
        }

        console.log('All data loaded successfully');
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  // Calculate financial totals
  const financialTotals = useMemo(() => {
    const marketingCosts = marketingChannels.reduce((sum, channel) => sum + channel.monthlyBudget, 0);
    const payrollCosts = departments.reduce((sum, dept) => sum + dept.monthlyTotal, 0);
    const cogsCosts = cogs.reduce((sum, cost) => sum + cost.monthlyCost, 0);
    const opexCosts = operatingExpenses.reduce((sum, expense) => sum + expense.monthlyCost, 0);
    
    const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.mrr, 0);
    const totalCosts = marketingCosts + payrollCosts + cogsCosts + opexCosts;

    return {
      totalRevenue,
      totalCosts,
      sectionTotals: {
        marketing: marketingCosts,
        payroll: payrollCosts,
        cogs: cogsCosts,
        opex: opexCosts
      },
      annual: {
        revenue: totalRevenue * 12,
        costs: totalCosts * 12
      }
    };
  }, [marketingChannels, departments, cogs, operatingExpenses, subscriptions]);

  // Handle row updates
  const handleMarketingChannelUpdate = useCallback(async (index: number, field: keyof MarketingChannel, value: string) => {
    if (!user) return;
    
    try {
      const newChannels = [...marketingChannels];
      const channel = { ...newChannels[index] };
      
      if (field === 'monthlyBudget' || field === 'costPerLead' || field === 'leadsGenerated') {
        channel[field] = parseFloat(value) || 0;
      } else {
        channel[field] = value;
      }
      
      if (field === 'monthlyBudget' || field === 'costPerLead') {
        channel.leadsGenerated = channel.costPerLead ? Math.floor(channel.monthlyBudget / channel.costPerLead) : 0;
      }
      
      const { error } = await supabase
        .from('marketing_channels')
        .upsert({
          name: channel.name,
          monthly_budget: channel.monthlyBudget,
          cost_per_lead: channel.costPerLead,
          leads_generated: channel.leadsGenerated,
          notes: channel.notes,
          user_id: user.id
        });

      if (error) throw error;
      
      newChannels[index] = channel;
      setMarketingChannels(newChannels);
    } catch (err) {
      console.error('Error updating marketing channel:', err);
      setError(err instanceof Error ? err.message : 'Failed to update marketing channel');
    }
  }, [marketingChannels, user]);

  const handleMarketingTeamUpdate = useCallback(async (index: number, field: keyof Employee, value: string) => {
    if (!user) return;
    
    try {
      const newTeam = [...marketingTeam];
      const employee = { ...newTeam[index] };
      
      if (field === 'fte' || field === 'salaryPerFte') {
        employee[field] = parseFloat(value) || 0;
      } else {
        employee[field] = value;
      }
      
      employee.monthlyTotal = (employee.salaryPerFte / 12) * employee.fte;
      
      const { error } = await supabase
        .from('marketing_team')
        .upsert({
          role: employee.role,
          fte: employee.fte,
          salary_per_fte: employee.salaryPerFte,
          monthly_total: employee.monthlyTotal,
          user_id: user.id
        });

      if (error) throw error;
      
      newTeam[index] = employee;
      setMarketingTeam(newTeam);
    } catch (err) {
      console.error('Error updating team member:', err);
      setError(err instanceof Error ? err.message : 'Failed to update team member');
    }
  }, [marketingTeam, user]);

  const handleAddRow = useCallback(async (section: string) => {
    if (!user) return;
    
    try {
      switch (section) {
        case 'marketing': {
          const newChannel = {
            name: 'New Channel',
            monthlyBudget: 0,
            costPerLead: 0,
            leadsGenerated: 0,
            notes: ''
          };
          
          const { error } = await supabase
            .from('marketing_channels')
            .insert({
              ...newChannel,
              user_id: user.id
            });

          if (error) throw error;
          
          setMarketingChannels(prev => [...prev, newChannel]);
          break;
        }
        case 'team': {
          const newMember = {
            role: 'New Role',
            fte: 0,
            salaryPerFte: 0,
            monthlyTotal: 0
          };
          
          const { error } = await supabase
            .from('marketing_team')
            .insert({
              ...newMember,
              user_id: user.id
            });

          if (error) throw error;
          
          setMarketingTeam(prev => [...prev, newMember]);
          break;
        }
        // Add other cases for different sections
      }
    } catch (err) {
      console.error('Error adding row:', err);
      setError(err instanceof Error ? err.message : 'Failed to add row');
    }
  }, [user]);

  const handleDeleteRow = useCallback(async (section: string, index: number) => {
    if (!user) return;
    
    try {
      switch (section) {
        case 'marketing': {
          const channel = marketingChannels[index];
          const { error } = await supabase
            .from('marketing_channels')
            .delete()
            .eq('name', channel.name)
            .eq('user_id', user.id);

          if (error) throw error;
          
          setMarketingChannels(prev => prev.filter((_, i) => i !== index));
          break;
        }
        case 'team': {
          const member = marketingTeam[index];
          const { error } = await supabase
            .from('marketing_team')
            .delete()
            .eq('role', member.role)
            .eq('user_id', user.id);

          if (error) throw error;
          
          setMarketingTeam(prev => prev.filter((_, i) => i !== index));
          break;
        }
        // Add other cases for different sections
      }
    } catch (err) {
      console.error('Error deleting row:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete row');
    }
  }, [marketingChannels, marketingTeam, user]);

  const handleSync = async () => {
    if (!user || syncing) return;

    setSyncing(true);
    try {
      console.log('Starting data sync...');
      
      // Sync marketing channels
      for (const channel of marketingChannels) {
        await supabase
          .from('marketing_channels')
          .upsert({
            name: channel.name,
            monthly_budget: channel.monthlyBudget,
            cost_per_lead: channel.costPerLead,
            leads_generated: channel.leadsGenerated,
            notes: channel.notes,
            user_id: user.id
          });
      }

      // Sync marketing team
      for (const member of marketingTeam) {
        await supabase
          .from('marketing_team')
          .upsert({
            role: member.role,
            fte: member.fte,
            salary_per_fte: member.salaryPerFte,
            monthly_total: member.monthlyTotal,
            user_id: user.id
          });
      }

      // Sync funnel conversions
      for (const conv of funnelConversions) {
        await supabase
          .from('funnel_conversions')
          .upsert({
            channel: conv.channel,
            mql: conv.mql,
            mql_to_sql_rate: conv.mqlToSqlRate,
            sql: conv.sql,
            sql_to_deal_rate: conv.sqlToDealRate,
            deals: conv.deals,
            user_id: user.id
          });
      }

      // Sync subscriptions
      for (const sub of subscriptions) {
        await supabase
          .from('subscriptions')
          .upsert({
            tier: sub.tier,
            monthly_price: sub.monthlyPrice,
            subscriber_count: sub.subscriberCount,
            mrr: sub.mrr,
            user_id: user.id
          });
      }

      // Sync active subscribers
      for (const sub of activeSubscribers) {
        await supabase
          .from('active_subscribers')
          .upsert({
            month: sub.month,
            existing_subs: sub.existingSubs,
            new_deals: sub.newDeals,
            churned_subs: sub.churnedSubs,
            ending_subs: sub.endingSubs,
            user_id: user.id
          });
      }

      // Sync COGS
      for (const cost of cogs) {
        await supabase
          .from('cogs')
          .upsert({
            category: cost.category,
            monthly_cost: cost.monthlyCost,
            notes: cost.notes,
            user_id: user.id
          });
      }

      // Sync departments
      for (const dept of departments) {
        await supabase
          .from('departments')
          .upsert({
            name: dept.name,
            fte: dept.fte,
            salary: dept.salary,
            additional_costs: dept.additionalCosts,
            monthly_total: dept.monthlyTotal,
            user_id: user.id
          });
      }

      // Sync operating expenses
      for (const expense of operatingExpenses) {
        await supabase
          .from('operating_expenses')
          .upsert({
            category: expense.category,
            monthly_cost: expense.monthlyCost,
            notes: expense.notes,
            user_id: user.id
          });
      }

      // Sync funding rounds
      for (const round of fundingRounds) {
        await supabase
          .from('funding_rounds')
          .upsert({
            round: round.round,
            amount_raised: round.amountRaised,
            valuation_pre: round.valuationPre,
            equity_sold: round.equitySold,
            close_date: round.closeDate,
            user_id: user.id
          });
      }

      console.log('Data sync completed successfully');
      alert('Data synchronized successfully!');
    } catch (error) {
      console.error('Sync error:', error);
      alert('Error synchronizing data. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  if (!user) {
    return <AuthForm />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center text-red-600">
          <p>Error loading data: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            HomeTruth Business Model v1
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSync}
              disabled={syncing}
              className={`flex items-center gap-2 px-4 py-2 text-sm ${
                syncing
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              <Save className="w-4 h-4" />
              {syncing ? 'Syncing...' : 'Sync'}
            </button>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
        
        <div className="space-y-8">
          <FinancialSummary
            totalRevenue={financialTotals.totalRevenue}
            totalCosts={financialTotals.totalCosts}
            sectionTotals={financialTotals.sectionTotals}
            annualRevenue={financialTotals.annual.revenue}
            annualCosts={financialTotals.annual.costs}
          />
          
          <MarketingSection
            channels={marketingChannels}
            team={marketingTeam}
            onUpdateChannel={handleMarketingChannelUpdate}
            onUpdateTeam={handleMarketingTeamUpdate}
            onAddRow={handleAddRow}
            onDeleteChannel={(index) => handleDeleteRow('marketing', index)}
            onDeleteTeam={(index) => handleDeleteRow('team', index)}
            icon={<Calculator className="w-6 h-6 text-blue-600" />}
          />
          
          <FunnelSection
            conversions={funnelConversions}
            setConversions={setFunnelConversions}
            marketingChannels={marketingChannels}
            onAddRow={() => handleAddRow('funnel')}
            onDelete={(index) => handleDeleteRow('funnel', index)}
            icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          />
          
          <SubscriptionSection
            subscriptions={subscriptions}
            activeSubscribers={activeSubscribers}
            setSubscriptions={setSubscriptions}
            setActiveSubscribers={setActiveSubscribers}
            onAddRow={(section) => handleAddRow(section)}
            onDeleteSubscription={(index) => handleDeleteRow('subscriptions', index)}
            onDeleteActiveSubscriber={(index) => handleDeleteRow('activeSubscribers', index)}
            icon={<Users className="w-6 h-6 text-purple-600" />}
          />
          
          <RevenueSection
            subscriptions={subscriptions}
            setSubscriptions={setSubscriptions}
            cogs={cogs}
            setCogs={setCogs}
            onAddRow={() => handleAddRow('cogs')}
            onDeleteCogs={(index) => handleDeleteRow('cogs', index)}
            icon={<CreditCard className="w-6 h-6 text-indigo-600" />}
          />
          
          <ExpensesSection
            departments={departments}
            setDepartments={setDepartments}
            operatingExpenses={operatingExpenses}
            setOperatingExpenses={setOperatingExpenses}
            onAddRow={(section) => handleAddRow(section)}
            onDeleteDepartment={(index) => handleDeleteRow('departments', index)}
            onDeleteOperatingExpense={(index) => handleDeleteRow('opex', index)}
            icon={<Building2 className="w-6 h-6 text-red-600" />}
          />
          
          <FinancingSection
            fundingRounds={fundingRounds}
            setFundingRounds={setFundingRounds}
            onAddRow={() => handleAddRow('funding')}
            onDelete={(index) => handleDeleteRow('funding', index)}
            icon={<Briefcase className="w-6 h-6 text-yellow-600" />}
          />
        </div>
      </div>
    </div>
  );
}

export default App;