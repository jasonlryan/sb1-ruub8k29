/*
  # Drop all existing tables

  This migration removes all existing tables to start fresh.
  
  IMPORTANT: This is a destructive operation that will remove all data!
*/

-- Drop tables if they exist
DROP TABLE IF EXISTS funding_rounds CASCADE;
DROP TABLE IF EXISTS operating_expenses CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS cogs CASCADE;
DROP TABLE IF EXISTS active_subscribers CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS funnel_conversions CASCADE;
DROP TABLE IF EXISTS marketing_team CASCADE;
DROP TABLE IF EXISTS marketing_channels CASCADE;

-- Drop the trigger function if it exists
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;