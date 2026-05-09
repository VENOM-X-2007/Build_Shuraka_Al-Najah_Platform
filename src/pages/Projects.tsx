import { useEffect, useState } from 'react';
import { supabase, type Project } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from '../components/Router';
import ProjectCard from '../components/ProjectCard';
import { Search, Filter, Plus, Loader2 } from 'lucide-react';

const categories = ['الكل', 'تقنية', 'تعليم', 'صحة', 'تجارة', 'ترفيه', 'أخرى'];
const stages = ['الكل', 'idea', 'mvp', 'launched', 'scaling'];
const stageLabels: Record<string, string> = {
  'الكل': 'الكل',
  idea: 'فكرة',
  mvp: 'نموذج أولي',
  launched: 'مُطلق',
  scaling: 'في النمو',
};

export default function ProjectsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('الكل');
  const [stage, setStage] = useState('الكل');
  const [openOnly, setOpenOnly] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let query = supabase
        .from('projects')
        .select('*, profiles!projects_owner_id_fkey(id, full_name, role, avatar_url), project_needed_roles(*), project_members(id)')
        .order('created_at', { ascending: false });

      if (openOnly) query = query.eq('is_open', true);
      if (stage !== 'الكل') query = query.eq('stage', stage);

      const { data } = await query;

      let filtered = (data ?? []).map(p => ({
        ...p,
        owner: p.profiles,
        needed_roles: p.project_needed_roles,
        members: p.project_members,
      }));

      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(p =>
          p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
        );
      }

      setProjects(filtered);
      setLoading(false);
    }
    load();
  }, [search, stage, openOnly, category]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">المشاريع</h1>
            <p className="text-gray-500 text-sm mt-1">{projects.length} مشروع متاح</p>
          </div>
          {profile && (
            <button
              onClick={() => navigate('/projects/new')}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              أضف مشروعاً
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث عن مشروع..."
              className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none text-sm transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Filter size={14} className="text-gray-400" />
            {stages.map(s => (
              <button
                key={s}
                onClick={() => setStage(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  stage === s
                    ? 'bg-teal-100 text-teal-700'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {stageLabels[s]}
              </button>
            ))}
            <label className="flex items-center gap-1.5 mr-auto cursor-pointer">
              <input
                type="checkbox"
                checked={openOnly}
                onChange={e => setOpenOnly(e.target.checked)}
                className="rounded accent-teal-600"
              />
              <span className="text-xs text-gray-600">فقط المفتوحة</span>
            </label>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-teal-500" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search size={28} className="text-gray-400" />
            </div>
            <h3 className="text-gray-700 font-medium mb-1">لا توجد مشاريع</h3>
            <p className="text-gray-400 text-sm">جرّب تغيير معايير البحث</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
