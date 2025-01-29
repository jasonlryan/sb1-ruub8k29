import { supabase } from './lib/supabase';

export async function migrateInitialData(userId: string) {
  try {
    // First check if data already exists for this user in any table
    const tables = [
      'marketing_channels',
      'marketing_team',
      'funnel_conversions',
      'subscriptions',
      'active_subscribers',
      'cogs',
      'departments',
      'operating_expenses',
      'funding_rounds'
    ];

    // Check all tables for existing data
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (error) {
        console.error(`Error checking ${table}:`, error);
        continue;
      }

      if (data && data.length > 0) {
        console.log(`Data already exists in ${table}, skipping migration`);
        return { success: true, skipped: true };
      }
    }

    console.log('Starting data migration for user:', userId);

    // Marketing Channels
    const marketingChannels = [
      {
        name: 'Inbound',
        monthly_budget: 5000,
        cost_per_lead: 25,
        leads_generated: 200,
        notes: 'Website traffic from SEO, PPC, social, etc.',
        user_id: userId
      },
      {
        name: 'Email',
        monthly_budget: 1000,
        cost_per_lead: 10,
        leads_generated: 100,
        notes: 'Nurture channel, tool + content creation',
        user_id: userId
      },
      {
        name: 'Partners',
        monthly_budget: 3000,
        cost_per_lead: 30,
        leads_generated: 100,
        notes: 'Influencers, affiliates, strategic alliances',
        user_id: userId
      },
      {
        name: 'Outbound Ads',
        monthly_budget: 4000,
        cost_per_lead: 20,
        leads_generated: 200,
        notes: 'Retargeting, social ads, direct cold outreach',
        user_id: userId
      }
    ];

    // Marketing Team
    const marketingTeam = [
      {
        role: 'Marketing Manager',
        fte: 1,
        salary_per_fte: 40000,
        monthly_total: 4000,
        user_id: userId
      },
      {
        role: 'Digital Marketer',
        fte: 1,
        salary_per_fte: 30000,
        monthly_total: 3000,
        user_id: userId
      },
      {
        role: 'Content/Copywriter',
        fte: 0.5,
        salary_per_fte: 25000,
        monthly_total: 1250,
        user_id: userId
      }
    ];

    // Funnel Conversions
    const funnelConversions = marketingChannels.map(channel => ({
      channel: channel.name,
      mql: channel.leads_generated,
      mql_to_sql_rate: 40,
      sql: Math.floor(channel.leads_generated * 0.4),
      sql_to_deal_rate: 35,
      deals: Math.floor(channel.leads_generated * 0.4 * 0.35),
      user_id: userId
    }));

    // Subscriptions
    const subscriptions = [
      {
        tier: 'Free',
        monthly_price: 0,
        subscriber_count: 5000,
        mrr: 0,
        user_id: userId
      },
      {
        tier: 'Basic',
        monthly_price: 8,
        subscriber_count: 3000,
        mrr: 24000,
        user_id: userId
      },
      {
        tier: 'Advanced',
        monthly_price: 20,
        subscriber_count: 2000,
        mrr: 40000,
        user_id: userId
      },
      {
        tier: 'Premium',
        monthly_price: 50,
        subscriber_count: 500,
        mrr: 25000,
        user_id: userId
      }
    ];

    // Active Subscribers
    const activeSubscribers = [
      {
        month: 'March',
        existing_subs: 0,
        new_deals: 100,
        churned_subs: 0,
        ending_subs: 100,
        user_id: userId
      },
      {
        month: 'April',
        existing_subs: 100,
        new_deals: 200,
        churned_subs: 10,
        ending_subs: 290,
        user_id: userId
      },
      {
        month: 'May',
        existing_subs: 290,
        new_deals: 300,
        churned_subs: 15,
        ending_subs: 575,
        user_id: userId
      }
    ];

    // COGS
    const cogs = [
      {
        category: 'Cloud Hosting / AI API',
        monthly_cost: 5000,
        notes: 'Cost scales with usage (e.g., OpenAI tokens)',
        user_id: userId
      },
      {
        category: 'Payment Processing Fees',
        monthly_cost: 2670,
        notes: '3% of revenue',
        user_id: userId
      },
      {
        category: 'Other Direct Costs',
        monthly_cost: 2000,
        notes: 'Customer support tools, text message alerts, etc.',
        user_id: userId
      }
    ];

    // Departments
    const departments = [
      {
        name: 'Founders/Exec',
        fte: 2,
        salary: 50000,
        additional_costs: 20,
        monthly_total: 10000,
        user_id: userId
      },
      {
        name: 'Marketing (Setters)',
        fte: 2,
        salary: 35000,
        additional_costs: 20,
        monthly_total: 7000,
        user_id: userId
      },
      {
        name: 'Sales/Closer',
        fte: 1,
        salary: 35000,
        additional_costs: 20,
        monthly_total: 3500,
        user_id: userId
      },
      {
        name: 'Dev & Product',
        fte: 4,
        salary: 45000,
        additional_costs: 20,
        monthly_total: 18000,
        user_id: userId
      },
      {
        name: 'Customer Success',
        fte: 2,
        salary: 30000,
        additional_costs: 20,
        monthly_total: 6000,
        user_id: userId
      },
      {
        name: 'Finance & Admin',
        fte: 1,
        salary: 25000,
        additional_costs: 20,
        monthly_total: 2500,
        user_id: userId
      }
    ];

    // Operating Expenses
    const operatingExpenses = [
      {
        category: 'Office Rent/Expenses',
        monthly_cost: 2000,
        notes: 'Or 0 if fully remote',
        user_id: userId
      },
      {
        category: 'Software Tools (CRM...)',
        monthly_cost: 1000,
        notes: 'Email automation, analytics, etc.',
        user_id: userId
      },
      {
        category: 'Legal & Advisory',
        monthly_cost: 500,
        notes: 'Some months might spike if fundraising or IP filings',
        user_id: userId
      },
      {
        category: 'Travel & Conferences',
        monthly_cost: 500,
        notes: 'For marketing or partner events',
        user_id: userId
      },
      {
        category: 'Misc.',
        monthly_cost: 1000,
        notes: 'Contingency',
        user_id: userId
      }
    ];

    // Funding Rounds
    const fundingRounds = [
      {
        round: 'Pre-seed',
        amount_raised: 300000,
        valuation_pre: 2500000,
        equity_sold: 12,
        close_date: 'Q1 2024',
        user_id: userId
      },
      {
        round: 'Seed',
        amount_raised: 1500000,
        valuation_pre: 6500000,
        equity_sold: 19,
        close_date: 'Q3 2025',
        user_id: userId
      },
      {
        round: 'Series A',
        amount_raised: 5000000,
        valuation_pre: 20000000,
        equity_sold: 20,
        close_date: 'Q3 2026',
        user_id: userId
      }
    ];

    // Insert data with transaction to ensure atomicity
    const { error: transactionError } = await supabase.rpc('migrate_initial_data', {
      p_user_id: userId,
      p_marketing_channels: marketingChannels,
      p_marketing_team: marketingTeam,
      p_funnel_conversions: funnelConversions,
      p_subscriptions: subscriptions,
      p_active_subscribers: activeSubscribers,
      p_cogs: cogs,
      p_departments: departments,
      p_operating_expenses: operatingExpenses,
      p_funding_rounds: fundingRounds
    });

    if (transactionError) {
      console.error('Transaction error:', transactionError);
      return { success: false, error: transactionError };
    }

    console.log('Data migration completed successfully');
    return { success: true, skipped: false };
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, error };
  }
}