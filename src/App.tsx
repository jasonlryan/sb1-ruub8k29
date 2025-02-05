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
  ActiveSubscriber,
  COGS,
  Department,
} from "./types/model";
import { testConnection } from "./test-connection";
import { FinancialSummary } from "./components/FinancialSummary";
import { DEFAULT_MARKETING_CHANNELS } from "./constants/marketing";
import { debounce } from "lodash";

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
    ActiveSubscriber[]
  >([]);
  const [cogs, setCogs] = useState<COGS[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [operatingExpenses, setOperatingExpenses] = useState<
    OperatingExpense[]
  >([]);
  const [fundingRounds, setFundingRounds] = useState<FundingRound[]>([]);

  // Early return if no user
  if (!user) {
    return <AuthForm />;
  }

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

        let transformedChannels: MarketingChannel[] = [];

        if (!channelsData || channelsData.length === 0) {
          // No channels found - create default ones
          const defaultChannelsWithUserId = DEFAULT_MARKETING_CHANNELS.map(
            (channel) => ({
              ...channel,
              id: crypto.randomUUID(),
              user_id: user.id,
            })
          );

          const { error: insertError } = await supabase
            .from("marketing_channels")
            .insert(defaultChannelsWithUserId);

          if (insertError) throw insertError;

          setMarketingChannels(defaultChannelsWithUserId);
          transformedChannels = defaultChannelsWithUserId; // Store for funnel use
        } else {
          transformedChannels = channelsData.map((channel) => ({
            id: channel.id,
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
          // Create funnel data only for existing channels
          const defaultFunnelData = transformedChannels.map((channel) => ({
            channel: channel.name,
            mql: channel.leadsGenerated,
            mqlToSqlRate: 30,
            sql: Math.floor(channel.leadsGenerated * 0.3),
            sqlToDealRate: 20,
            deals: Math.floor(channel.leadsGenerated * 0.3 * 0.2),
            user_id: user.id,
          }));

          const { error: insertError } = await supabase
            .from("funnel_conversions")
            .insert(defaultFunnelData);

          if (insertError) throw insertError;
          setFunnelConversions(defaultFunnelData);
        } else {
          // Only keep funnel data for existing channels
          const validChannelNames = transformedChannels.map((c) => c.name);
          const filteredFunnelData = funnelData.filter((f) =>
            validChannelNames.includes(f.channel)
          );

          // Transform and set the filtered data
          const transformedFunnelData = filteredFunnelData.map((funnel) => ({
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

        if (!teamData || teamData.length === 0) {
          // Create default marketing team data
          const defaultTeam = [
            {
              role: "Marketing Manager",
              fte: 1,
              salaryPerFte: 45000,
              monthlyTotal: Math.floor(45000 / 12),
              user_id: user.id,
            },
            {
              role: "Marketing Executive",
              fte: 2,
              salaryPerFte: 35000,
              monthlyTotal: Math.floor((35000 / 12) * 2),
              user_id: user.id,
            },
            {
              role: "Content Writer",
              fte: 1,
              salaryPerFte: 30000,
              monthlyTotal: Math.floor(30000 / 12),
              user_id: user.id,
            },
          ];

          const { error: insertError } = await supabase
            .from("marketing_team")
            .insert(defaultTeam);

          if (insertError) throw insertError;
          setMarketingTeam(defaultTeam);
        } else {
          // Transform from snake_case to camelCase
          const transformedTeam = teamData.map((member) => ({
            role: member.role,
            fte: member.fte,
            salaryPerFte: member.salary_per_fte,
            monthlyTotal: Math.floor((member.salary_per_fte / 12) * member.fte),
            user_id: member.user_id,
          }));
          setMarketingTeam(transformedTeam);
        }

        // Load subscriptions
        const { data: subscriptionData, error: subscriptionError } =
          await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", user.id)
            .order("tier", { ascending: true });

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
        const { data: subsData, error: subsError } = await supabase
          .from("active_subscribers")
          .select("*")
          .eq("user_id", user.id);

        if (subsError) throw subsError;

        if (!subsData || subsData.length === 0) {
          const defaultSubs = [
            {
              month: "March",
              existingSubs: 0,
              newDeals: 114,
              churnedSubs: 0,
              endingSubs: 114,
              user_id: user.id,
            },
            {
              month: "April",
              existingSubs: 114,
              newDeals: 114,
              churnedSubs: 10,
              endingSubs: 218,
              user_id: user.id,
            },
            {
              month: "May",
              existingSubs: 218,
              newDeals: 114,
              churnedSubs: 15,
              endingSubs: 317,
              user_id: user.id,
            },
          ];

          const { error: insertError } = await supabase
            .from("active_subscribers")
            .insert(defaultSubs);

          if (insertError) throw insertError;
          setActiveSubscribers(defaultSubs);
        } else {
          setActiveSubscribers(subsData);
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

        if (departmentsData && departmentsData.length > 0) {
          const transformedDepartments = departmentsData.map((dept) => ({
            name: dept.name,
            fte: dept.fte,
            salary: dept.salary,
            additionalCosts: dept.additional_costs,
            monthlyTotal: Math.round(
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
        console.error("Error loading data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  // Calculate financial totals
  const financialTotals = useMemo(() => {
    const marketingCosts = Math.round(
      marketingChannels.reduce((sum, channel) => sum + channel.monthlyBudget, 0)
    );
    const payrollCosts = Math.round(
      departments.reduce((sum, dept) => sum + dept.monthlyTotal, 0)
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

  // Inside App component, before the handlers
  const debouncedUpdate = useMemo(
    () =>
      debounce(async (channel: MarketingChannel) => {
        if (!user) return;

        try {
          const { error } = await supabase
            .from("marketing_channels")
            .update({
              monthly_budget: channel.monthlyBudget,
              cost_per_lead: channel.costPerLead,
              leads_generated: channel.leadsGenerated,
              notes: channel.notes,
            })
            .eq("id", channel.id)
            .eq("user_id", user.id);

          if (error) throw error;
        } catch (err) {
          console.error("Debounced update error:", err);
          setError(
            err instanceof Error ? err.message : "Failed to update channel"
          );
        }
      }, 1000), // Wait 1 second after last keystroke
    [user]
  );

  // Modify handleMarketingChannelUpdate
  const handleMarketingChannelUpdate = useCallback(
    async (index: number, field: keyof MarketingChannel, value: string) => {
      if (!user) return;

      try {
        const channel = marketingChannels[index];
        const updatedChannel = { ...channel };

        // Handle numeric fields explicitly
        if (
          field === "monthlyBudget" ||
          field === "costPerLead" ||
          field === "leadsGenerated"
        ) {
          const numValue = parseFloat(value.replace(/[£,]/g, ""));
          updatedChannel[field] = numValue;

          // Update leads if cost per lead changes
          if (field === "costPerLead" && numValue > 0) {
            updatedChannel.leadsGenerated = Math.floor(
              updatedChannel.monthlyBudget / numValue
            );
          }
        } else if (
          field === "name" ||
          field === "notes" ||
          field === "id" ||
          field === "user_id"
        ) {
          // Handle string fields
          updatedChannel[field] = value;
        }

        // Update local state immediately
        setMarketingChannels((prev) =>
          prev.map((ch, i) => (i === index ? updatedChannel : ch))
        );

        // Debounce the database update
        debouncedUpdate(updatedChannel);
      } catch (err) {
        console.error("Update error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update channel"
        );
      }
    },
    [marketingChannels, user, debouncedUpdate]
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

        // Fix: Calculate monthly total correctly
        employee.monthlyTotal = Math.floor(
          (employee.salaryPerFte / 12) * employee.fte
        );

        // Update in Supabase with snake_case
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
    async (section: string, data?: any) => {
      if (!user) return;

      try {
        switch (section) {
          case "marketing": {
            // Don't allow adding new channels - we want to keep only the default ones
            console.log("Marketing channels are fixed - cannot add new ones");
            break;
          }
          case "team": {
            // Create the new team member with proper snake_case for database
            const newMember = {
              role: data?.role || "New Role",
              fte: data?.fte || 0,
              salary_per_fte: data?.salary_per_fte || 0,
              monthly_total: Math.floor(
                ((data?.salary_per_fte || 0) / 12) * (data?.fte || 0)
              ), // Calculate monthly total
              user_id: user.id,
            };

            // Insert into database
            const { data: insertedData, error } = await supabase
              .from("marketing_team")
              .insert(newMember)
              .select()
              .single();

            if (error) throw error;

            // Transform the inserted data back to camelCase for state
            const transformedMember = {
              role: insertedData.role,
              fte: insertedData.fte,
              salaryPerFte: insertedData.salary_per_fte,
              monthlyTotal: insertedData.monthly_total,
              user_id: insertedData.user_id,
            };

            // Update local state
            setMarketingTeam((prev) => [...prev, transformedMember]);
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
      // Test connection first
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error("Failed to connect to Supabase");
      }

      // Marketing Channels
      const { error: marketingError } = await supabase
        .from("marketing_channels")
        .delete()
        .eq("user_id", user.id);
      if (marketingError) throw marketingError;

      if (marketingChannels.length > 0) {
        const { error } = await supabase.from("marketing_channels").insert(
          marketingChannels.map((channel) => ({
            name: channel.name,
            monthly_budget: channel.monthlyBudget,
            cost_per_lead: channel.costPerLead,
            leads_generated: channel.leadsGenerated,
            notes: channel.notes,
            user_id: user.id,
          }))
        );
        if (error) throw error;
      }

      // Funnel Conversions
      const { error: funnelError } = await supabase
        .from("funnel_conversions")
        .delete()
        .eq("user_id", user.id);
      if (funnelError) throw funnelError;

      if (funnelConversions.length > 0) {
        const { error } = await supabase.from("funnel_conversions").insert(
          funnelConversions.map((conv) => ({
            channel: conv.channel,
            mql: conv.mql,
            mql_to_sql_rate: conv.mqlToSqlRate,
            sql: conv.sql,
            sql_to_deal_rate: conv.sqlToDealRate,
            deals: conv.deals,
            user_id: user.id,
          }))
        );
        if (error) throw error;
      }

      // Active Subscribers
      const { error: subsError } = await supabase
        .from("active_subscribers")
        .delete()
        .eq("user_id", user.id);
      if (subsError) throw subsError;

      if (activeSubscribers.length > 0) {
        const { error } = await supabase.from("active_subscribers").insert(
          activeSubscribers.map((sub) => ({
            month: sub.month,
            existing_subs: sub.existingSubs,
            new_deals: sub.newDeals,
            churned_subs: sub.churnedSubs,
            ending_subs: sub.endingSubs,
            user_id: user.id,
          }))
        );
        if (error) throw error;
      }

      // Departments
      const { error: deptError } = await supabase
        .from("departments")
        .delete()
        .eq("user_id", user.id);
      if (deptError) throw deptError;

      if (departments.length > 0) {
        const { error } = await supabase.from("departments").insert(
          departments.map((dept) => ({
            name: dept.name,
            fte: dept.fte,
            salary: dept.salary,
            additional_costs: dept.additionalCosts,
            monthly_total: dept.monthlyTotal,
            user_id: user.id,
          }))
        );
        if (error) throw error;
      }

      // Operating Expenses
      const { error: opexError } = await supabase
        .from("operating_expenses")
        .delete()
        .eq("user_id", user.id);
      if (opexError) throw opexError;

      if (operatingExpenses.length > 0) {
        const { error } = await supabase.from("operating_expenses").insert(
          operatingExpenses.map((expense) => ({
            category: expense.category,
            monthly_cost: expense.monthlyCost,
            notes: expense.notes,
            user_id: user.id,
          }))
        );
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

  // Add this function to calculate monthly totals from funnel
  const calculateMonthlyDeals = useMemo(() => {
    return funnelConversions.reduce((sum, conv) => sum + conv.deals, 0);
  }, [funnelConversions]);

  // Add this effect to update active subscribers whenever funnel deals change
  useEffect(() => {
    if (activeSubscribers.length > 0) {
      const totalDeals = calculateMonthlyDeals; // This should be 30 based on your funnel
      setActiveSubscribers((prev) =>
        prev.map((sub, index) => {
          // Start fresh calculation for this month
          const updatedSub = {
            ...sub,
            newDeals: totalDeals, // Set new deals to match funnel total (30)
          };

          // Recalculate ending subs
          updatedSub.endingSubs =
            updatedSub.existingSubs + totalDeals - updatedSub.churnedSubs;

          return updatedSub;
        })
      );
    }
  }, [funnelConversions, calculateMonthlyDeals]);

  // Modify handleActiveSubscriberUpdate to only allow editing existingSubs and churnedSubs
  const handleActiveSubscriberUpdate = useCallback(
    async (index: number, field: keyof ActiveSubscriber, value: string) => {
      if (!user) return;

      try {
        const subscribers = [...activeSubscribers];
        const current = { ...subscribers[index] };
        const numericValue = parseInt(value.replace(/,/g, "")) || 0;

        switch (field) {
          case "existingSubs":
            current.existingSubs = numericValue;
            break;
          case "churnedSubs":
            current.churnedSubs = numericValue;
            break;
          default:
            return; // Don't allow editing other fields
        }

        // Calculate ending subs using funnel deals
        current.endingSubs =
          current.existingSubs + calculateMonthlyDeals - current.churnedSubs;

        // Update the current month
        subscribers[index] = current;

        // Recalculate all subsequent months
        for (let i = index + 1; i < subscribers.length; i++) {
          subscribers[i].existingSubs = subscribers[i - 1].endingSubs;
          subscribers[i].endingSubs =
            subscribers[i].existingSubs +
            calculateMonthlyDeals -
            subscribers[i].churnedSubs;
        }

        setActiveSubscribers(subscribers);
      } catch (err) {
        console.error("Error updating active subscribers:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update subscribers"
        );
      }
    },
    [activeSubscribers, calculateMonthlyDeals, user]
  );

  // Add handler for adding new months
  const handleAddSubscriberMonth = async () => {
    if (!user) return;

    const lastMonth = activeSubscribers[activeSubscribers.length - 1];
    const newMonth: ActiveSubscriber = {
      month: "New Month",
      existingSubs: lastMonth?.endingSubs || 0,
      newDeals: calculateMonthlyDeals,
      churnedSubs: 0,
      endingSubs: (lastMonth?.endingSubs || 0) + calculateMonthlyDeals,
      user_id: user.id,
    };

    try {
      const { error } = await supabase
        .from("active_subscribers")
        .insert(newMonth);

      if (error) throw error;
      setActiveSubscribers([...activeSubscribers, newMonth]);
    } catch (err) {
      console.error("Error adding month:", err);
    }
  };

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
            icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          />

          <SubscriptionSection
            subscriptions={subscriptions}
            activeSubscribers={activeSubscribers}
            setSubscriptions={setSubscriptions}
            setActiveSubscribers={setActiveSubscribers}
            onAddRow={handleAddSubscriberMonth}
            onDeleteSubscription={(index) =>
              handleDeleteRow("subscriptions", index)
            }
            onDeleteActiveSubscriber={(index) =>
              handleDeleteRow("activeSubscribers", index)
            }
            icon={<Users className="w-8 h-8 text-purple-600" />}
            funnelConversions={funnelConversions}
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
