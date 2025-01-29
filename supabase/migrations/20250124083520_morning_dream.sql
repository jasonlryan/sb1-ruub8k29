/*
  # Initial Schema Setup

  1. New Tables
    - `marketing_channels`
      - `id` (uuid, primary key)
      - `name` (text)
      - `monthly_budget` (numeric)
      - `cost_per_lead` (numeric)
      - `leads_generated` (integer)
      - `notes` (text)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `marketing_team`
      - `id` (uuid, primary key)
      - `role` (text)
      - `fte` (numeric)
      - `salary_per_fte` (numeric)
      - `monthly_total` (numeric)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `funnel_conversions`
      - `id` (uuid, primary key)
      - `channel` (text)
      - `mql` (integer)
      - `mql_to_sql_rate` (numeric)
      - `sql` (integer)
      - `sql_to_deal_rate` (numeric)
      - `deals` (integer)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `subscriptions`
      - `id` (uuid, primary key)
      - `tier` (text)
      - `monthly_price` (numeric)
      - `subscriber_count` (integer)
      - `mrr` (numeric)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

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

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
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