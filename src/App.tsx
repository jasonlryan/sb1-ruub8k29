import { useState, useMemo, useCallback, useEffect } from "react";
import { MarketingSection } from "./components/MarketingSection";
import { FunnelSection } from "./components/FunnelSection";
import { SubscriptionSection } from "./components/SubscriptionSection";
import { RevenueSection } from "./components/RevenueSection";
import { ExpensesSection } from "./components/ExpensesSection";
import { FinancingSection } from "./components/FinancingSection";
import {
  Calculator,
  TrendingUp,
  Users,
  CreditCard,
  Building2,
  Briefcase,
  LogOut,
  Save,
  Database,
} from "lucide-react";
import { AuthForm } from "./components/AuthForm";
import { useSupabase } from "./contexts/SupabaseContext";
import { supabase } from "./lib/supabase";
import {
  MarketingChannel,
  Employee,
  FunnelConversion,
  Subscription,
  OperatingExpense,
  FundingRound,
  ActiveSubscribers,
  COGS,
  Department,
} from "./types/model";
import { testConnection } from "./test-connection";
import { FinancialSummary } from "./components/FinancialSummary";
import { DEFAULT_MARKETING_CHANNELS } from "./constants/marketing";

function App() {
  const { user, signOut } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Initialize state variables
  const [marketingChannels, setMarketingChannels] = useState<
    MarketingChannel[]
  >([]);
  const [marketingTeam, setMarketingTeam] = useState<Employee[]>([]);
  const [funnelConversions, setFunnelConversions] = useState<
    FunnelConversion[]
  >([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activeSubscribers, setActiveSubscribers] = useState<
    ActiveSubscribers[]
  >([]);
  const [cogs, setCogs] = useState<COGS[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [operatingExpenses, setOperatingExpenses] = useState<
    OperatingExpense[]
  >([]);
  const [fundingRounds, setFundingRounds] = useState<FundingRound[]>([]);

  // Load data from Supabase
  useEffect(() => {
    async function loadData() {
      if (!user) return;

      setLoading(true);
      try {
        // Load marketing channels
        const { data: channelsData, error: channelsError } = await supabase
          .from("marketing_channels")
          .select("*")
          .eq("user_id", user.id);

        console.log("DEBUG: Marketing Channels Data from Supabase:", {
          data: channelsData,
          error: channelsError,
          userId: user.id,
        });

        if (channelsError) throw channelsError;

        if (!channelsData || channelsData.length === 0) {
          // No channels found - create default ones
          const defaultChannelsWithUserId = DEFAULT_MARKETING_CHANNELS.map(
            (channel) => ({
              ...channel,
              user_id: user.id,
            })
          );

          const { error: insertError } = await supabase
            .from("marketing_channels")
            .insert(defaultChannelsWithUserId);

          if (insertError) throw insertError;

          setMarketingChannels(defaultChannelsWithUserId);
        } else {
          const transformedChannels = channelsData.map((channel) => ({
            name: channel.name,
            monthlyBudget: channel.monthly_budget,
            costPerLead: channel.cost_per_lead,
            leadsGenerated: channel.leads_generated,
            notes: channel.notes,
            user_id: channel.user_id,
          }));
          setMarketingChannels(transformedChannels);
        }

        // Add this right after we get the data
        console.log("Raw channel data:", channelsData?.[0]); // Let's see the actual structure

        // Load funnel conversions
        const { data: funnelData, error: funnelError } = await supabase
          .from("funnel_conversions")
          .select("*")
          .eq("user_id", user.id);

        if (funnelError) throw funnelError;

        if (!funnelData || funnelData.length === 0) {
          // Create default funnel data for each marketing channel
          const defaultFunnelData = marketingChannels.map((channel) => ({
            channel: channel.name,
            mql: channel.leadsGenerated,
            mqlToSqlRate: 30, // 30% conversion from MQL to SQL
            sql: Math.floor(channel.leadsGenerated * 0.3),
            sqlToDealRate: 20, // 20% conversion from SQL to Deal
            deals: Math.floor(channel.leadsGenerated * 0.3 * 0.2),
            user_id: user.id,
          }));

          const { error: insertError } = await supabase
            .from("funnel_conversions")
            .insert(defaultFunnelData);

          if (insertError) throw insertError;

          setFunnelConversions(defaultFunnelData);
        } else {
          // Transform from snake_case to camelCase
          const transformedFunnelData = funnelData.map((funnel) => ({
            channel: funnel.channel,
            mql: funnel.mql,
            mqlToSqlRate: funnel.mql_to_sql_rate,
            sql: funnel.sql,
            sqlToDealRate: funnel.sql_to_deal_rate,
            deals: funnel.deals,
            user_id: funnel.user_id,
          }));
          setFunnelConversions(transformedFunnelData);
        }

        // Load marketing team
        const { data: teamData, error: teamError } = await supabase
          .from("marketing_team")
          .select("*")
          .eq("user_id", user.id);

        if (teamError) throw teamError;
        if (teamData) setMarketingTeam(teamData);

        // Load subscriptions
        const { data: subscriptionData, error: subscriptionError } =
          await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", user.id);

        if (subscriptionError) throw subscriptionError;

        if (!subscriptionData || subscriptionData.length === 0) {
          // Default subscription tiers
          const defaultSubscriptions = [
            {
              tier: "Basic",
              monthlyPrice: 10,
              subscriberCount: 0,
              mrr: 0,
              user_id: user.id,
            },
            {
              tier: "Pro",
              monthlyPrice: 25,
              subscriberCount: 0,
              mrr: 0,
              user_id: user.id,
            },
            {
              tier: "Enterprise",
              monthlyPrice: 100,
              subscriberCount: 0,
              mrr: 0,
              user_id: user.id,
            },
          ];

          const { error: insertError } = await supabase
            .from("subscriptions")
            .insert(defaultSubscriptions);

          if (insertError) throw insertError;
          setSubscriptions(defaultSubscriptions);
        } else {
          // Transform from snake_case to camelCase
          const transformedSubscriptions = subscriptionData.map((sub) => ({
            tier: sub.tier,
            monthlyPrice: sub.monthly_price,
            subscriberCount: sub.subscriber_count,
            mrr: sub.mrr,
            user_id: sub.user_id,
          }));
          setSubscriptions(transformedSubscriptions);
        }

        // Load active subscribers
        const { data: activeSubscribersData, error: activeSubscribersError } =
          await supabase
            .from("active_subscribers")
            .select("*")
            .eq("user_id", user.id);

        if (activeSubscribersError) throw activeSubscribersError;

        if (!activeSubscribersData || activeSubscribersData.length === 0) {
          // Create default active subscribers data with last 3 months
          const months = ["January", "February", "March"];
          const defaultActiveSubscribers = months.map((month, index) => ({
            month,
            existingSubs: index === 0 ? 0 : 0, // First month starts with 0
            newDeals: 0,
            churnedSubs: 0,
            endingSubs: 0,
            user_id: user.id,
          }));

          const { error: insertError } = await supabase
            .from("active_subscribers")
            .insert(defaultActiveSubscribers);

          if (insertError) throw insertError;
          setActiveSubscribers(defaultActiveSubscribers);
        } else {
          // Transform from snake_case to camelCase
          const transformedActiveSubscribers = activeSubscribersData.map(
            (sub) => ({
              month: sub.month,
              existingSubs: sub.existing_subs,
              newDeals: sub.new_deals,
              churnedSubs: sub.churned_subs,
              endingSubs: sub.ending_subs,
              user_id: sub.user_id,
            })
          );
          setActiveSubscribers(transformedActiveSubscribers);
        }

        // Load cogs
        const { data: cogsData, error: cogsError } = await supabase
          .from("cogs")
          .select("*")
          .eq("user_id", user.id);

        if (cogsError) throw cogsError;

        if (!cogsData || cogsData.length === 0) {
          const defaultCogs = [
            {
              category: "Server Costs",
              monthlyCost: 0,
              notes: "AWS/Infrastructure",
              user_id: user.id,
            },
            {
              category: "Support",
              monthlyCost: 0,
              notes: "Customer Service",
              user_id: user.id,
            },
          ];

          const { error: insertError } = await supabase
            .from("cogs")
            .insert(defaultCogs);

          if (insertError) throw insertError;
          setCogs(defaultCogs);
        } else {
          const transformedCogs = cogsData.map((cost) => ({
            category: cost.category,
            monthlyCost: cost.monthly_cost,
            notes: cost.notes,
            user_id: cost.user_id,
          }));
          setCogs(transformedCogs);
        }

        // Load departments
        const { data: departmentsData, error: departmentsError } =
          await supabase.from("departments").select("*").eq("user_id", user.id);

        if (departmentsError) throw departmentsError;

        if (!departmentsData || departmentsData.length === 0) {
          const defaultDepartments = [
            {
              name: "Founders/Exec",
              fte: 2,
              salary: 50000,
              additionalCosts: 0,
              monthlyTotal: Math.floor((50000 / 12) * 2 * (1 + 0 / 100)),
              user_id: user.id,
            },
            {
              name: "Marketing (Setters)",
              fte: 2,
              salary: 35000,
              additionalCosts: 0,
              monthlyTotal: Math.floor((35000 / 12) * 2 * (1 + 0 / 100)),
              user_id: user.id,
            },
            {
              name: "Sales/Closer",
              fte: 1,
              salary: 35000,
              additionalCosts: 0,
              monthlyTotal: Math.floor((35000 / 12) * 1 * (1 + 0 / 100)),
              user_id: user.id,
            },
          ];

          const { error: insertError } = await supabase
            .from("departments")
            .insert(defaultDepartments);

          if (insertError) throw insertError;
          setDepartments(defaultDepartments);
        } else {
          const transformedDepartments = departmentsData.map((dept) => ({
            name: dept.name,
            fte: dept.fte,
            salary: dept.salary,
            additionalCosts: dept.additional_costs,
            monthlyTotal: Math.floor(
              (dept.salary / 12) * dept.fte * (1 + dept.additional_costs / 100)
            ),
            user_id: dept.user_id,
          }));
          setDepartments(transformedDepartments);
        }

        // Load operating expenses
        const { data: opexData, error: opexError } = await supabase
          .from("operating_expenses")
          .select("*")
          .eq("user_id", user.id);

        if (opexError) throw opexError;

        if (!opexData || opexData.length === 0) {
          const defaultOpex = [
            {
              category: "Office Space",
              monthlyCost: 0,
              notes: "Rent & Utilities",
              user_id: user.id,
            },
            {
              category: "Software",
              monthlyCost: 0,
              notes: "Tools & Licenses",
              user_id: user.id,
            },
          ];

          const { error: insertError } = await supabase
            .from("operating_expenses")
            .insert(defaultOpex);

          if (insertError) throw insertError;
          setOperatingExpenses(defaultOpex);
        } else {
          const transformedOpex = opexData.map((expense) => ({
            category: expense.category,
            monthlyCost: expense.monthly_cost,
            notes: expense.notes,
            user_id: expense.user_id,
          }));
          setOperatingExpenses(transformedOpex);
        }

        // Load funding rounds
        const { data: fundingData, error: fundingError } = await supabase
          .from("funding_rounds")
          .select("*")
          .eq("user_id", user.id);

        if (fundingError) throw fundingError;

        if (!fundingData || fundingData.length === 0) {
          const defaultFunding = [
            {
              round: "Seed",
              amountRaised: 0,
              valuationPre: 0,
              equitySold: 0,
              closeDate: new Date().toISOString().split("T")[0],
              user_id: user.id,
            },
          ];

          const { error: insertError } = await supabase
            .from("funding_rounds")
            .insert(defaultFunding);

          if (insertError) throw insertError;
          setFundingRounds(defaultFunding);
        } else {
          const transformedFunding = fundingData.map((round) => ({
            round: round.round,
            amountRaised: round.amount_raised,
            valuationPre: round.valuation_pre,
            equitySold: round.equity_sold,
            closeDate: round.close_date,
            user_id: round.user_id,
          }));
          setFundingRounds(transformedFunding);
        }

        // After loading data
        console.log("Loaded data:", {
          subscriptions,
          activeSubscribers,
          operatingExpenses,
          cogs,
        });
      } catch (err) {
        console.error("Load error:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  // Calculate financial totals
  const financialTotals = useMemo(() => {
    const marketingCosts = marketingChannels.reduce(
      (sum, channel) => sum + channel.monthlyBudget,
      0
    );
    const payrollCosts = departments.reduce(
      (sum, dept) => sum + dept.monthlyTotal,
      0
    );
    const cogsCosts = cogs.reduce((sum, cost) => sum + cost.monthlyCost, 0);
    const opexCosts = operatingExpenses.reduce(
      (sum, expense) => sum + expense.monthlyCost,
      0
    );

    const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.mrr, 0);
    const totalCosts = marketingCosts + payrollCosts + cogsCosts + opexCosts;

    return {
      totalRevenue,
      totalCosts,
      sectionTotals: {
        marketing: marketingCosts,
        payroll: payrollCosts,
        cogs: cogsCosts,
        opex: opexCosts,
      },
      annual: {
        revenue: totalRevenue * 12,
        costs: totalCosts * 12,
      },
    };
  }, [marketingChannels, departments, cogs, operatingExpenses, subscriptions]);

  // Handle row updates
  const handleMarketingChannelUpdate = useCallback(
    async (index: number, field: keyof MarketingChannel, value: string) => {
      if (!user) return;

      try {
        console.log("Updating channel:", { index, field, value });
        const channel = marketingChannels[index];
        console.log("Current channel data:", channel);

        const updatedChannel = { ...channel } as MarketingChannel;

        if (field === "monthlyBudget" || field === "costPerLead") {
          const numericValue = parseFloat(value) || 0;
          updatedChannel[field] = numericValue;

          updatedChannel.leadsGenerated = updatedChannel.costPerLead
            ? Math.floor(
                updatedChannel.monthlyBudget / updatedChannel.costPerLead
              )
            : 0;
        } else if (field === "notes" || field === "name") {
          updatedChannel[field] = value;
        }

        // Update in Supabase
        const { error } = await supabase
          .from("marketing_channels")
          .update({
            monthly_budget: updatedChannel.monthlyBudget,
            cost_per_lead: updatedChannel.costPerLead,
            leads_generated: updatedChannel.leadsGenerated,
            notes: updatedChannel.notes,
          })
          .eq("name", channel.name)
          .eq("user_id", user.id);

        if (error) throw error;

        // Update local state
        setMarketingChannels((prev) =>
          prev.map((ch, i) => (i === index ? updatedChannel : ch))
        );

        // Update funnel conversions
        setFunnelConversions((prev) =>
          prev.map((conv) =>
            conv.channel === channel.name
              ? {
                  ...conv,
                  mql: updatedChannel.leadsGenerated,
                  sql: Math.floor(
                    updatedChannel.leadsGenerated * (conv.mqlToSqlRate / 100)
                  ),
                  deals: Math.floor(
                    Math.floor(
                      updatedChannel.leadsGenerated * (conv.mqlToSqlRate / 100)
                    ) *
                      (conv.sqlToDealRate / 100)
                  ),
                }
              : conv
          )
        );

        console.log("Update successful, new channel data:", updatedChannel);
      } catch (err) {
        console.error("Update error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update channel"
        );
      }
    },
    [marketingChannels, user]
  );

  const handleMarketingTeamUpdate = useCallback(
    async (index: number, field: keyof Employee, value: string) => {
      if (!user) return;

      try {
        const newTeam = [...marketingTeam];
        const employee = { ...newTeam[index] };

        // Type-safe field updates
        if (field === "fte" || field === "salaryPerFte") {
          (employee[field] as number) = parseFloat(value) || 0;
        } else if (field === "role") {
          employee.role = value;
        }

        employee.monthlyTotal = (employee.salaryPerFte / 12) * employee.fte;

        const { error } = await supabase.from("marketing_team").upsert({
          role: employee.role,
          fte: employee.fte,
          salary_per_fte: employee.salaryPerFte,
          monthly_total: employee.monthlyTotal,
          user_id: user.id,
        });

        if (error) throw error;

        newTeam[index] = employee;
        setMarketingTeam(newTeam);
      } catch (err) {
        console.error("Error updating team member:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update team member"
        );
      }
    },
    [marketingTeam, user]
  );

  const handleAddRow = useCallback(
    async (section: string) => {
      if (!user) return;

      try {
        switch (section) {
          case "marketing": {
            // Don't allow adding new channels - we want to keep only the default ones
            console.log("Marketing channels are fixed - cannot add new ones");
            break;
          }
          case "team": {
            const newMember = {
              role: "New Role",
              fte: 0,
              salaryPerFte: 0,
              monthlyTotal: 0,
            };

            const { error } = await supabase.from("marketing_team").insert({
              ...newMember,
              user_id: user.id,
            });

            if (error) throw error;
            setMarketingTeam((prev) => [...prev, newMember]);
            break;
          }
          // Add other cases as needed
        }
      } catch (err) {
        console.error("Error adding row:", err);
        setError(err instanceof Error ? err.message : "Failed to add row");
      }
    },
    [user]
  );

  const handleDeleteRow = useCallback(
    async (section: string, index: number) => {
      if (!user) return;

      try {
        switch (section) {
          case "marketing": {
            const channel = marketingChannels[index];
            const { error } = await supabase
              .from("marketing_channels")
              .delete()
              .eq("name", channel.name)
              .eq("user_id", user.id);

            if (error) throw error;

            setMarketingChannels((prev) => prev.filter((_, i) => i !== index));
            break;
          }
          case "team": {
            const member = marketingTeam[index];
            const { error } = await supabase
              .from("marketing_team")
              .delete()
              .eq("role", member.role)
              .eq("user_id", user.id);

            if (error) throw error;

            setMarketingTeam((prev) => prev.filter((_, i) => i !== index));
            break;
          }
          // Add other cases for different sections
        }
      } catch (err) {
        console.error("Error deleting row:", err);
        setError(err instanceof Error ? err.message : "Failed to delete row");
      }
    },
    [marketingChannels, marketingTeam, user]
  );

  const handleSync = async () => {
    if (!user || syncing) return;

    setSyncing(true);
    try {
      console.log("🔄 Starting data sync with Supabase...");

      // Test connection first
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error("Failed to connect to Supabase");
      }

      // Sync marketing channels
      console.log("📤 Syncing marketing channels...");
      for (const channel of marketingChannels) {
        const { error } = await supabase.from("marketing_channels").upsert({
          name: channel.name,
          monthly_budget: channel.monthlyBudget,
          cost_per_lead: channel.costPerLead,
          leads_generated: channel.leadsGenerated,
          notes: channel.notes,
          user_id: user.id,
        });
        if (error) throw error;
      }

      // Sync marketing team
      console.log("📤 Syncing marketing team...");
      for (const member of marketingTeam) {
        const { error } = await supabase.from("marketing_team").upsert({
          role: member.role,
          fte: member.fte,
          salary_per_fte: member.salaryPerFte,
          monthly_total: member.monthlyTotal,
          user_id: user.id,
        });
        if (error) throw error;
      }

      // Sync funnel conversions
      console.log("📤 Syncing funnel conversions...");
      for (const conv of funnelConversions) {
        const { error } = await supabase.from("funnel_conversions").upsert({
          channel: conv.channel,
          mql: conv.mql,
          mql_to_sql_rate: conv.mqlToSqlRate,
          sql: conv.sql,
          sql_to_deal_rate: conv.sqlToDealRate,
          deals: conv.deals,
          user_id: user.id,
        });
        if (error) throw error;
      }

      // Sync subscriptions
      console.log("📤 Syncing subscriptions...");
      for (const sub of subscriptions) {
        const { error } = await supabase.from("subscriptions").upsert({
          tier: sub.tier,
          monthly_price: sub.monthlyPrice,
          subscriber_count: sub.subscriberCount,
          mrr: sub.mrr,
          user_id: user.id,
        });
        if (error) throw error;
      }

      // Sync active subscribers
      console.log("📤 Syncing active subscribers...");
      for (const sub of activeSubscribers) {
        const { error } = await supabase.from("active_subscribers").upsert({
          month: sub.month,
          existing_subs: sub.existingSubs,
          new_deals: sub.newDeals,
          churned_subs: sub.churnedSubs,
          ending_subs: sub.endingSubs,
          user_id: user.id,
        });
        if (error) throw error;
      }

      // Sync COGS
      console.log("📤 Syncing COGS...");
      for (const cost of cogs) {
        const { error } = await supabase.from("cogs").upsert({
          category: cost.category,
          monthly_cost: cost.monthlyCost,
          notes: cost.notes,
          user_id: user.id,
        });
        if (error) throw error;
      }

      // Sync departments
      console.log("📤 Syncing departments...");
      for (const dept of departments) {
        const { error } = await supabase.from("departments").upsert({
          name: dept.name,
          fte: dept.fte,
          salary: dept.salary,
          additional_costs: dept.additionalCosts,
          monthly_total: dept.monthlyTotal,
          user_id: user.id,
        });
        if (error) throw error;
      }

      // Sync operating expenses
      console.log("📤 Syncing operating expenses...");
      for (const expense of operatingExpenses) {
        const { error } = await supabase.from("operating_expenses").upsert({
          category: expense.category,
          monthly_cost: expense.monthlyCost,
          notes: expense.notes,
          user_id: user.id,
        });
        if (error) throw error;
      }

      // Sync funding rounds
      console.log("📤 Syncing funding rounds...");
      for (const round of fundingRounds) {
        const { error } = await supabase.from("funding_rounds").upsert({
          round: round.round,
          amount_raised: round.amountRaised,
          valuation_pre: round.valuationPre,
          equity_sold: round.equitySold,
          close_date: round.closeDate,
          user_id: user.id,
        });
        if (error) throw error;
      }

      console.log("✅ Data sync completed successfully");
      alert("Data synchronized successfully!");
    } catch (error) {
      console.error("❌ Sync error:", error);
      alert("Error synchronizing data. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  // Test connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await testConnection();
      if (!isConnected) {
        setError("Failed to connect to Supabase");
      }
    };
    checkConnection();
  }, []);

  // Add a useEffect to monitor state changes
  useEffect(() => {
    console.log("Marketing Channels updated:", marketingChannels);
  }, [marketingChannels]);

  useEffect(() => {
    console.log("Funnel Conversions updated:", funnelConversions);
  }, [funnelConversions]);

  useEffect(() => {
    console.log("Marketing Team updated:", marketingTeam);
  }, [marketingTeam]);

  // Let's verify the auth state first
  useEffect(() => {
    console.log("Current auth state:", {
      userExists: !!user,
      userId: user?.id,
    });
  }, [user]);

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
              onClick={() =>
                window.open(
                  "https://supabase.com/dashboard/project/edhirbnotodmuirfegqi",
                  "_blank"
                )
              }
              className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:text-green-800"
              title="Open Supabase Dashboard"
            >
              <Database className="w-4 h-4" />
              Connect
            </button>
            <button
              onClick={handleSync}
              disabled={syncing}
              className={`flex items-center gap-2 px-4 py-2 text-sm ${
                syncing
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:text-blue-800"
              }`}
            >
              <Save className="w-4 h-4" />
              {syncing ? "Syncing..." : "Sync"}
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
            onDeleteChannel={(index) => handleDeleteRow("marketing", index)}
            onDeleteTeam={(index) => handleDeleteRow("team", index)}
            icon={<Calculator className="w-6 h-6 text-blue-600" />}
          />

          <FunnelSection
            conversions={funnelConversions}
            setConversions={setFunnelConversions}
            onAddRow={() => handleAddRow("funnel")}
            onDelete={(index) => handleDeleteRow("funnel", index)}
            icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          />

          <SubscriptionSection
            subscriptions={subscriptions}
            activeSubscribers={activeSubscribers}
            setSubscriptions={setSubscriptions}
            setActiveSubscribers={setActiveSubscribers}
            onAddRow={(section) => handleAddRow(section)}
            onDeleteSubscription={(index) =>
              handleDeleteRow("subscriptions", index)
            }
            onDeleteActiveSubscriber={(index) =>
              handleDeleteRow("activeSubscribers", index)
            }
            icon={<Users className="w-6 h-6 text-purple-600" />}
          />

          <RevenueSection
            subscriptions={subscriptions}
            setSubscriptions={setSubscriptions}
            cogs={cogs}
            setCogs={setCogs}
            onAddRow={() => handleAddRow("cogs")}
            onDeleteCogs={(index) => handleDeleteRow("cogs", index)}
            icon={<CreditCard className="w-6 h-6 text-indigo-600" />}
          />

          <ExpensesSection
            departments={departments}
            setDepartments={setDepartments}
            operatingExpenses={operatingExpenses}
            setOperatingExpenses={setOperatingExpenses}
            onAddRow={(section) => handleAddRow(section)}
            onDeleteDepartment={(index) =>
              handleDeleteRow("departments", index)
            }
            onDeleteOperatingExpense={(index) => handleDeleteRow("opex", index)}
            icon={<Building2 className="w-6 h-6 text-red-600" />}
          />

          <FinancingSection
            fundingRounds={fundingRounds}
            setFundingRounds={setFundingRounds}
            onAddRow={() => handleAddRow("funding")}
            onDelete={(index) => handleDeleteRow("funding", index)}
            icon={<Briefcase className="w-6 h-6 text-yellow-600" />}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
