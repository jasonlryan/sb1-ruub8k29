import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  role: 'admin' | 'user';
  company_name: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
}

export interface Organization {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
}

export interface TeamMember {
  user_id: string;
  org_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
} 