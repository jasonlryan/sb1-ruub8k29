/*
  # Add stored procedure for initial data migration

  1. New Stored Procedure
    - `migrate_initial_data`: Handles initial data migration for new users
    - Takes JSON parameters for all data tables
    - Uses a transaction to ensure data consistency
    - Checks for existing data before inserting

  2. Changes
    - Adds a stored procedure to handle data migration in a transaction
    - Ensures atomic operations for data consistency
    - Prevents duplicate data insertion
*/

CREATE OR REPLACE FUNCTION migrate_initial_data(
  p_user_id uuid,
  p_marketing_channels jsonb,
  p_marketing_team jsonb,
  p_funnel_conversions jsonb,
  p_subscriptions jsonb,
  p_active_subscribers jsonb,
  p_cogs jsonb,
  p_departments jsonb,
  p_operating_expenses jsonb,
  p_funding_rounds jsonb
) RETURNS void AS $$
BEGIN
  -- Start transaction
  BEGIN
    -- Insert marketing channels
    INSERT INTO marketing_channels (
      name, monthly_budget, cost_per_lead, leads_generated, notes, user_id
    )
    SELECT 
      x.name,
      (x.monthly_budget)::numeric,
      (x.cost_per_lead)::numeric,
      (x.leads_generated)::integer,
      x.notes,
      p_user_id
    FROM jsonb_to_recordset(p_marketing_channels) AS x(
      name text,
      monthly_budget numeric,
      cost_per_lead numeric,
      leads_generated integer,
      notes text
    )
    ON CONFLICT DO NOTHING;

    -- Insert marketing team
    INSERT INTO marketing_team (
      role, fte, salary_per_fte, monthly_total, user_id
    )
    SELECT 
      x.role,
      (x.fte)::numeric,
      (x.salary_per_fte)::numeric,
      (x.monthly_total)::numeric,
      p_user_id
    FROM jsonb_to_recordset(p_marketing_team) AS x(
      role text,
      fte numeric,
      salary_per_fte numeric,
      monthly_total numeric
    )
    ON CONFLICT DO NOTHING;

    -- Insert funnel conversions
    INSERT INTO funnel_conversions (
      channel, mql, mql_to_sql_rate, sql, sql_to_deal_rate, deals, user_id
    )
    SELECT 
      x.channel,
      (x.mql)::integer,
      (x.mql_to_sql_rate)::numeric,
      (x.sql)::integer,
      (x.sql_to_deal_rate)::numeric,
      (x.deals)::integer,
      p_user_id
    FROM jsonb_to_recordset(p_funnel_conversions) AS x(
      channel text,
      mql integer,
      mql_to_sql_rate numeric,
      sql integer,
      sql_to_deal_rate numeric,
      deals integer
    )
    ON CONFLICT DO NOTHING;

    -- Insert subscriptions
    INSERT INTO subscriptions (
      tier, monthly_price, subscriber_count, mrr, user_id
    )
    SELECT 
      x.tier,
      (x.monthly_price)::numeric,
      (x.subscriber_count)::integer,
      (x.mrr)::numeric,
      p_user_id
    FROM jsonb_to_recordset(p_subscriptions) AS x(
      tier text,
      monthly_price numeric,
      subscriber_count integer,
      mrr numeric
    )
    ON CONFLICT DO NOTHING;

    -- Insert active subscribers
    INSERT INTO active_subscribers (
      month, existing_subs, new_deals, churned_subs, ending_subs, user_id
    )
    SELECT 
      x.month,
      (x.existing_subs)::integer,
      (x.new_deals)::integer,
      (x.churned_subs)::integer,
      (x.ending_subs)::integer,
      p_user_id
    FROM jsonb_to_recordset(p_active_subscribers) AS x(
      month text,
      existing_subs integer,
      new_deals integer,
      churned_subs integer,
      ending_subs integer
    )
    ON CONFLICT DO NOTHING;

    -- Insert COGS
    INSERT INTO cogs (
      category, monthly_cost, notes, user_id
    )
    SELECT 
      x.category,
      (x.monthly_cost)::numeric,
      x.notes,
      p_user_id
    FROM jsonb_to_recordset(p_cogs) AS x(
      category text,
      monthly_cost numeric,
      notes text
    )
    ON CONFLICT DO NOTHING;

    -- Insert departments
    INSERT INTO departments (
      name, fte, salary, additional_costs, monthly_total, user_id
    )
    SELECT 
      x.name,
      (x.fte)::numeric,
      (x.salary)::numeric,
      (x.additional_costs)::numeric,
      (x.monthly_total)::numeric,
      p_user_id
    FROM jsonb_to_recordset(p_departments) AS x(
      name text,
      fte numeric,
      salary numeric,
      additional_costs numeric,
      monthly_total numeric
    )
    ON CONFLICT DO NOTHING;

    -- Insert operating expenses
    INSERT INTO operating_expenses (
      category, monthly_cost, notes, user_id
    )
    SELECT 
      x.category,
      (x.monthly_cost)::numeric,
      x.notes,
      p_user_id
    FROM jsonb_to_recordset(p_operating_expenses) AS x(
      category text,
      monthly_cost numeric,
      notes text
    )
    ON CONFLICT DO NOTHING;

    -- Insert funding rounds
    INSERT INTO funding_rounds (
      round, amount_raised, valuation_pre, equity_sold, close_date, user_id
    )
    SELECT 
      x.round,
      (x.amount_raised)::numeric,
      (x.valuation_pre)::numeric,
      (x.equity_sold)::numeric,
      x.close_date,
      p_user_id
    FROM jsonb_to_recordset(p_funding_rounds) AS x(
      round text,
      amount_raised numeric,
      valuation_pre numeric,
      equity_sold numeric,
      close_date text
    )
    ON CONFLICT DO NOTHING;

    -- Commit transaction
    COMMIT;
  EXCEPTION WHEN OTHERS THEN
    -- Rollback on error
    ROLLBACK;
    RAISE;
  END;
END;
$$ LANGUAGE plpgsql;