/*
  # Complete Database Schema for Business Model Application

  1. Tables Created
    - marketing_channels: Store marketing channel data
    - marketing_team: Store marketing team members
    - funnel_conversions: Track conversion metrics
    - subscriptions: Manage subscription tiers
    - active_subscribers: Track subscriber growth
    - cogs: Track cost of goods sold
    - departments: Manage department data
    - operating_expenses: Track operating costs
    - funding_rounds: Track funding history

  2. Security
    - RLS enabled on all tables
    - Policies for authenticated users to manage their own data
    - Cascade deletion when user is deleted

  3. Features
    - UUID primary keys
    - Created/updated timestamps
    - Automatic updated_at triggers
    - Default values for numeric fields
    - Foreign key constraints to auth.users
*/

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Marketing Channels
CREATE TABLE IF NOT EXISTS marketing_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  monthly_budget numeric NOT NULL DEFAULT 0,
  cost_per_lead numeric NOT NULL DEFAULT 0,
  leads_generated integer NOT NULL DEFAULT 0,
  notes text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketing_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own marketing channels"
  ON marketing_channels
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Marketing Team
CREATE TABLE IF NOT EXISTS marketing_team (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  fte numeric NOT NULL DEFAULT 0,
  salary_per_fte numeric NOT NULL DEFAULT 0,
  monthly_total numeric NOT NULL DEFAULT 0,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketing_team ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own marketing team"
  ON marketing_team
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Funnel Conversions
CREATE TABLE IF NOT EXISTS funnel_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL,
  mql integer NOT NULL DEFAULT 0,
  mql_to_sql_rate numeric NOT NULL DEFAULT 0,
  sql integer NOT NULL DEFAULT 0,
  sql_to_deal_rate numeric NOT NULL DEFAULT 0,
  deals integer NOT NULL DEFAULT 0,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE funnel_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own funnel conversions"
  ON funnel_conversions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier text NOT NULL,
  monthly_price numeric NOT NULL DEFAULT 0,
  subscriber_count integer NOT NULL DEFAULT 0,
  mrr numeric NOT NULL DEFAULT 0,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own subscriptions"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Active Subscribers
CREATE TABLE IF NOT EXISTS active_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month text NOT NULL,
  existing_subs integer NOT NULL DEFAULT 0,
  new_deals integer NOT NULL DEFAULT 0,
  churned_subs integer NOT NULL DEFAULT 0,
  ending_subs integer NOT NULL DEFAULT 0,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE active_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own active subscribers data"
  ON active_subscribers
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- COGS
CREATE TABLE IF NOT EXISTS cogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  monthly_cost numeric NOT NULL DEFAULT 0,
  notes text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own COGS data"
  ON cogs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  fte numeric NOT NULL DEFAULT 0,
  salary numeric NOT NULL DEFAULT 0,
  additional_costs numeric NOT NULL DEFAULT 0,
  monthly_total numeric NOT NULL DEFAULT 0,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own departments data"
  ON departments
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Operating Expenses
CREATE TABLE IF NOT EXISTS operating_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  monthly_cost numeric NOT NULL DEFAULT 0,
  notes text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE operating_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own operating expenses data"
  ON operating_expenses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Funding Rounds
CREATE TABLE IF NOT EXISTS funding_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round text NOT NULL,
  amount_raised numeric NOT NULL DEFAULT 0,
  valuation_pre numeric NOT NULL DEFAULT 0,
  equity_sold numeric NOT NULL DEFAULT 0,
  close_date text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE funding_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own funding rounds data"
  ON funding_rounds
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_marketing_channels_updated_at
  BEFORE UPDATE ON marketing_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_marketing_team_updated_at
  BEFORE UPDATE ON marketing_team
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_funnel_conversions_updated_at
  BEFORE UPDATE ON funnel_conversions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_active_subscribers_updated_at
  BEFORE UPDATE ON active_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cogs_updated_at
  BEFORE UPDATE ON cogs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_operating_expenses_updated_at
  BEFORE UPDATE ON operating_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_funding_rounds_updated_at
  BEFORE UPDATE ON funding_rounds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();