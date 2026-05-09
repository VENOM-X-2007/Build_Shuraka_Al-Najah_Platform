import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from '../components/Router';
import { supabase, type Profile, type Project } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { MapPin, Github, Linkedin, Globe, CreditCard as Edit, CheckCircle, Code2, Palette, TrendingUp, Loader2 } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';

const roleConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  developer: { label: 'مبرمج', color: 'text-blue-700 bg-blue-50', icon: <Code2 size={16} /> },
  designer: { label: 'مصمم', color: 'text-rose-700 bg-rose-50', icon: <Palette size={16} /> },
  entrepreneur: { label: 'رائد أعمال', color: 'text-amber-700 bg-amber-50', icon: <TrendingUp size={16} /> },
};

export default function ProfilePage() {
  const params = useParams('/profile/:id');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const profileId = params.id;
  const isOwnProfile = user?.id === profileId;

  useEffect(() => {
    if (!profileId) return;
    async function load() {
      setLoading(true);
      const [{ data: profileData }, { data: projectData }] = await Promise.all([
        supabase
          .from('profiles')
          .select('*, profile_skills(skill_id, skills(id, name, category))')
          .eq('id', profileId)
          .maybeSingle(),
        supabase
          .from('projects')
          .select('*, profiles!projects_owner_id_fkey(id, full_name, role, avatar_url), project_needed_roles(*), project_members(id)')
          .eq('owner_id', profileId)
          .order('created_at', { ascending: false }),
      ]);

      if (profileData) {
        setProfile({
          ...profileData,
          skills: profileData.profile_skills?.map((ps: { skills: unknown }) => ps.skills).filter(Boolean) ?? [],
        });
      }

      if (projectData) {
        setProjects(projectData.map(p => ({
          ...p,
          owner: p.profiles,
          needed_roles: p.project_needed_roles,
          members: p.project_members,
        })));
      }

      setLoading(false);
    }
    load();
  }, [profileId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 size={36} className="animate-spin text-teal-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500">الملف الشخصي غير موجود</p>
        <Link href="/" className="text-teal-600 hover:underline mt-2 block">العودة للرئيسية</Link>
      </div>
    );
  }

  const role = roleConfig[profile.role] ?? roleConfig.developer;
  const avatarColors = ['from-teal-400 to-teal-600', 'from-blue-400 to-blue-600', 'from-rose-400 to-rose-600'];
  const avatarColor = avatarColors[profile.id.charCodeAt(0) % avatarColors.length];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              {/* Avatar */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-3xl font-bold mb-4 overflow-hidden`}>
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    profile.full_name?.charAt(0) || 'U'
                  )}
                </div>
                <h1 className="text-xl font-bold text-gray-900">{profile.full_name}</h1>
                <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-sm font-medium ${role.color}`}>
                  {role.icon} {role.label}
                </div>
                {profile.is_available && (
                  <div className="flex items-center gap-1 mt-2 text-green-600 text-xs">
                    <CheckCircle size={12} /> متاح للانضمام
                  </div>
                )}
              </div>

              {profile.bio && (
                <p className="text-gray-600 text-sm leading-relaxed mb-5 text-center">{profile.bio}</p>
              )}

              <div className="space-y-2.5 text-sm">
                {profile.location && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                    <Github size={14} className="flex-shrink-0" />
                    <span className="truncate">GitHub</span>
                  </a>
                )}
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                    <Linkedin size={14} className="flex-shrink-0" />
                    <span className="truncate">LinkedIn</span>
                  </a>
                )}
                {profile.portfolio_url && (
                  <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                    <Globe size={14} className="flex-shrink-0" />
                    <span className="truncate">المحفظة</span>
                  </a>
                )}
              </div>

              {isOwnProfile && (
                <button
                  onClick={() => navigate('/settings')}
                  className="mt-5 w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                >
                  <Edit size={14} /> تعديل الملف
                </button>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">المهارات</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map(skill => (
                    <span key={skill.id} className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-xl text-sm border border-gray-100">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-4">المشاريع ({projects.length})</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {projects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            )}

            {projects.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-gray-400 text-sm">لا توجد مشاريع حتى الآن</p>
                {isOwnProfile && (
                  <button
                    onClick={() => navigate('/projects/new')}
                    className="mt-3 text-teal-600 hover:text-teal-700 text-sm font-medium"
                  >
                    أضف مشروعك الأول
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
