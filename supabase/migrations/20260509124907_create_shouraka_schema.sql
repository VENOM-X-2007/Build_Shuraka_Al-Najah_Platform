/*
  # شركاء النجاح - Initial Schema

  1. New Tables
    - `profiles` - User profiles with skills and roles
    - `projects` - Project listings seeking team members
    - `project_members` - Team membership for projects
    - `join_requests` - Requests to join projects
    - `skills` - Predefined skills list
    - `profile_skills` - Many-to-many between profiles and skills

  2. Security
    - RLS enabled on all tables
    - Authenticated users can read public profiles and projects
    - Users can only modify their own data
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  username text UNIQUE,
  bio text DEFAULT '',
  role text NOT NULL DEFAULT 'developer' CHECK (role IN ('developer', 'designer', 'entrepreneur')),
  avatar_url text DEFAULT '',
  location text DEFAULT '',
  linkedin_url text DEFAULT '',
  github_url text DEFAULT '',
  portfolio_url text DEFAULT '',
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text NOT NULL DEFAULT 'general'
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Skills are viewable by everyone"
  ON skills FOR SELECT
  TO authenticated
  USING (true);

-- Profile skills junction
CREATE TABLE IF NOT EXISTS profile_skills (
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (profile_id, skill_id)
);

ALTER TABLE profile_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profile skills are viewable by everyone"
  ON profile_skills FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile skills"
  ON profile_skills FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete own profile skills"
  ON profile_skills FOR DELETE
  TO authenticated
  USING (auth.uid() = profile_id);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'tech',
  stage text NOT NULL DEFAULT 'idea' CHECK (stage IN ('idea', 'mvp', 'launched', 'scaling')),
  cover_image text DEFAULT '',
  website_url text DEFAULT '',
  is_open boolean DEFAULT true,
  views_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Projects are viewable by everyone"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Project needed roles
CREATE TABLE IF NOT EXISTS project_needed_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  role text NOT NULL,
  description text DEFAULT '',
  is_filled boolean DEFAULT false
);

ALTER TABLE project_needed_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project needed roles viewable by everyone"
  ON project_needed_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Project owners can manage needed roles"
  ON project_needed_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid())
  );

CREATE POLICY "Project owners can update needed roles"
  ON project_needed_roles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid())
  );

CREATE POLICY "Project owners can delete needed roles"
  ON project_needed_roles FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid())
  );

-- Project members
CREATE TABLE IF NOT EXISTS project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project members viewable by everyone"
  ON project_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Project owners can insert members"
  ON project_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid())
  );

CREATE POLICY "Project owners can delete members"
  ON project_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid())
    OR user_id = auth.uid()
  );

-- Join requests
CREATE TABLE IF NOT EXISTS join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  requester_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL,
  message text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, requester_id)
);

ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project owners can view requests"
  ON join_requests FOR SELECT
  TO authenticated
  USING (
    requester_id = auth.uid()
    OR EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid())
  );

CREATE POLICY "Authenticated users can send join requests"
  ON join_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Project owners can update request status"
  ON join_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid())
  );

CREATE POLICY "Requesters can delete own requests"
  ON join_requests FOR DELETE
  TO authenticated
  USING (requester_id = auth.uid());

-- Seed skills
INSERT INTO skills (name, category) VALUES
  ('React', 'frontend'), ('Vue.js', 'frontend'), ('Angular', 'frontend'), ('Next.js', 'frontend'),
  ('Node.js', 'backend'), ('Python', 'backend'), ('Django', 'backend'), ('Laravel', 'backend'),
  ('Flutter', 'mobile'), ('React Native', 'mobile'), ('iOS', 'mobile'), ('Android', 'mobile'),
  ('UI/UX Design', 'design'), ('Figma', 'design'), ('Adobe XD', 'design'), ('Branding', 'design'),
  ('Graphic Design', 'design'), ('Motion Design', 'design'),
  ('Business Development', 'business'), ('Marketing', 'business'), ('Sales', 'business'),
  ('Project Management', 'business'), ('Financial Planning', 'business'),
  ('Machine Learning', 'ai'), ('Data Science', 'ai'), ('NLP', 'ai'),
  ('DevOps', 'infrastructure'), ('Docker', 'infrastructure'), ('AWS', 'infrastructure'),
  ('PostgreSQL', 'database'), ('MongoDB', 'database'), ('Redis', 'database')
ON CONFLICT (name) DO NOTHING;
