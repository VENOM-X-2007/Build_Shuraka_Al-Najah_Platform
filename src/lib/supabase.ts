import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Role = 'developer' | 'designer' | 'entrepreneur';
export type ProjectStage = 'idea' | 'mvp' | 'launched' | 'scaling';

export interface Profile {
  id: string;
  full_name: string;
  username: string | null;
  bio: string;
  role: Role;
  avatar_url: string;
  location: string;
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  skills?: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface Project {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category: string;
  stage: ProjectStage;
  cover_image: string;
  website_url: string;
  is_open: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  owner?: Profile;
  needed_roles?: ProjectNeededRole[];
  members?: ProjectMember[];
}

export interface ProjectNeededRole {
  id: string;
  project_id: string;
  role: string;
  description: string;
  is_filled: boolean;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: Profile;
}

export interface JoinRequest {
  id: string;
  project_id: string;
  requester_id: string;
  role: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  project?: Project;
  requester?: Profile;
}
