import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
};

export type Migration = {
  id: string;
  user_id: string;
  name: string;
  source_platform: 'zapier' | 'n8n' | 'make';
  target_platforms: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  source_json: any;
  converted_workflows: Record<string, any>;
  validation_report: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type Agent = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: 'active' | 'paused' | 'archived';
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type HelpArticle = {
  id: string;
  category: 'getting-started' | 'migration' | 'agents' | 'troubleshooting';
  title: string;
  content: string;
  order: number;
  created_at: string;
  updated_at: string;
};
