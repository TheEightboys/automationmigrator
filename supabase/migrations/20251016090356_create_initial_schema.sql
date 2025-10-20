/*
  # Workflow Automation SaaS Platform - Initial Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `subscription_tier` (text) - free, pro, enterprise
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `migrations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `source_platform` (text) - zapier, n8n, make
      - `target_platforms` (text array) - platforms to convert to
      - `status` (text) - pending, processing, completed, failed
      - `source_json` (jsonb) - original workflow JSON
      - `converted_workflows` (jsonb) - object with platform keys
      - `validation_report` (jsonb) - conversion accuracy report
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `agents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `description` (text)
      - `status` (text) - active, paused, archived
      - `config` (jsonb) - agent configuration
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `help_articles`
      - `id` (uuid, primary key)
      - `category` (text) - getting-started, migration, agents, troubleshooting
      - `title` (text)
      - `content` (text)
      - `order` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Public read access to help_articles
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  subscription_tier text DEFAULT 'free' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create migrations table
CREATE TABLE IF NOT EXISTS migrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  source_platform text NOT NULL,
  target_platforms text[] DEFAULT '{}' NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  source_json jsonb,
  converted_workflows jsonb DEFAULT '{}' NOT NULL,
  validation_report jsonb DEFAULT '{}' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE migrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own migrations"
  ON migrations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own migrations"
  ON migrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own migrations"
  ON migrations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own migrations"
  ON migrations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  status text DEFAULT 'active' NOT NULL,
  config jsonb DEFAULT '{}' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
-- Add subscription fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS migrations_used INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS migrations_reset_date TIMESTAMP DEFAULT NOW();

-- Create subscriptions table for detailed tracking
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  payment_provider TEXT DEFAULT 'dodo',
  payment_id TEXT,
  created_at timestamptz DEFAULT NOW() NOT NULL,
  updated_at timestamptz DEFAULT NOW() NOT NULL
);

-- Enable RLS on subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Create index for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Update existing users to have default subscription values
UPDATE profiles 
SET 
  subscription_plan = 'free',
  subscription_status = 'inactive',
  migrations_used = 0,
  migrations_reset_date = NOW()
WHERE subscription_plan IS NULL;

CREATE POLICY "Users can view own agents"
  ON agents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agents"
  ON agents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agents"
  ON agents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own agents"
  ON agents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create help_articles table
CREATE TABLE IF NOT EXISTS help_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  "order" integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE help_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view help articles"
  ON help_articles FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_migrations_user_id ON migrations(user_id);
CREATE INDEX IF NOT EXISTS idx_migrations_status ON migrations(status);
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_help_articles_category ON help_articles(category);

-- Insert sample help articles
INSERT INTO help_articles (category, title, content, "order") VALUES
('getting-started', 'Welcome to Workflow Automation Platform', 'Learn how to get started with migrating your automation workflows between Zapier, n8n, and Make.', 1),
('getting-started', 'Creating Your First Migration', 'Step-by-step guide to upload and convert your first workflow.', 2),
('migration', 'Understanding Platform Differences', 'Learn about the key differences between Zapier, n8n, and Make workflow structures.', 1),
('migration', 'Conversion Accuracy & Validation', 'How we ensure your workflows are accurately converted between platforms.', 2),
('agents', 'What are Agents?', 'Agents help automate recurring migration tasks and workflow management.', 1),
('troubleshooting', 'Common Migration Issues', 'Solutions to frequently encountered problems during workflow conversion.', 1)
ON CONFLICT DO NOTHING;