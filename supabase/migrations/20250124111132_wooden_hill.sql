/*
  # Create Active Subscribers Table

  1. New Table
    - active_subscribers
      - id (uuid, primary key)
      - month (text)
      - existing_subs (integer)
      - new_deals (integer)
      - churned_subs (integer)
      - ending_subs (integer)
      - user_id (uuid, foreign key)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for authenticated users to manage their own data
*/

-- Active Subscribers Table
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

-- Enable Row Level Security
ALTER TABLE active_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Users can manage their own active subscribers data"
  ON active_subscribers
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
DO $$ 
BEGIN
  CREATE OR REPLACE FUNCTION update_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
EXCEPTION
  WHEN duplicate_function THEN NULL;
END $$;

-- Create trigger for updated_at
DO $$
BEGIN
  CREATE TRIGGER update_active_subscribers_updated_at
    BEFORE UPDATE ON active_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;