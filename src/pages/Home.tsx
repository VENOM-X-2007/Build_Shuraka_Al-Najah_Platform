import { useEffect, useState } from 'react';
import { Link, useNavigate } from '../components/Router';
import { supabase, type Project, type Profile } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Code2, Palette, TrendingUp, ArrowLeft, Search, Zap, Shield, Globe } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import TalentCard from '../components/TalentCard';

export default function Home() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [featuredTalent, setFeaturedTalent] = useState<Profile[]>([]);
  const [stats, setStats] = useState({ projects: 0, members: 0, teams: 0 });

  useEffect(() => {
    async function load() {
      const [{ data: projects }, { data: profiles }, { count: projectCount }, { count: profileCount }] = await Promise.all([
        supabase
          .from('projects')
          .select('*, profiles!projects_owner_id_fkey(id, full_name, role, avatar_url), project_needed_roles(*)')
          .eq('is_open', true)
          .order('created_at', { ascending: false })
          .limit(6),
        supabase
          .from('profiles')
          .select('*, profile_skills(skill_id, skills(id, name, category))')
          .eq('is_available', true)
          .order('created_at', { ascending: false })
          .limit(6),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ]);

      if (projects) {
        setFeaturedProjects(projects.map(p => ({
          ...p,
          owner: p.profiles,
          needed_roles: p.project_needed_roles,
        })));
      }

      if (profiles) {
        setFeaturedTalent(profiles.map(p => ({
          ...p,
          skills: p.profile_skills?.map((ps: { skills: unknown }) => ps.skills).filter(Boolean) ?? [],
        })));
      }

      setStats({
        projects: projectCount ?? 0,
        members: profileCount ?? 0,
        teams: Math.floor((projectCount ?? 0) * 1.3),
      });
    }
    load();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-teal-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-teal-600 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/30 px-3 py-1.5 rounded-full text-teal-300 text-sm font-medium mb-6">
              <Zap size={14} />
              المنصة الجزائرية الأولى لفرق العمل التقنية
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              ابنِ فريقك،
              <br />
              <span className="text-teal-400">أطلق مشروعك</span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-2xl">
              شركاء النجاح تجمع المبرمجين، المصممين، ورواد الأعمال الجزائريين في منصة واحدة لبناء مشاريع تقنية ناجحة معاً.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {profile ? (
                <button
                  onClick={() => navigate('/projects/new')}
                  className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-6 py-3 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-teal-500/25"
                >
                  أضف مشروعك
                  <ArrowLeft size={18} />
                </button>
              ) : (
                <button
                  onClick={() => navigate('/signup')}
                  className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-6 py-3 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-teal-500/25"
                >
                  انضم مجاناً
                  <ArrowLeft size={18} />
                </button>
              )}
              <button
                onClick={() => navigate('/projects')}
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all"
              >
                <Search size={18} />
                استكشف المشاريع
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg">
            {[
              { value: stats.members || '...', label: 'عضو مسجّل' },
              { value: stats.projects || '...', label: 'مشروع نشط' },
              { value: stats.teams || '...', label: 'فريق مشكّل' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-teal-400">{stat.value}</div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Role cards floating */}
        <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 space-y-3">
          {[
            { icon: <Code2 size={20} />, label: 'مبرمج', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-300' },
            { icon: <Palette size={20} />, label: 'مصمم', color: 'from-rose-500/20 to-rose-600/20 border-rose-500/30 text-rose-300' },
            { icon: <TrendingUp size={20} />, label: 'رائد أعمال', color: 'from-amber-500/20 to-amber-600/20 border-amber-500/30 text-amber-300' },
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-2 bg-gradient-to-r ${item.color} border rounded-xl px-4 py-3 backdrop-blur-sm`}>
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">لماذا شركاء النجاح؟</h2>
            <p className="text-gray-500">كل ما تحتاجه لبناء فريق عمل ناجح</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe size={24} className="text-teal-600" />,
                title: 'مجتمع جزائري',
                desc: 'تواصل مع الكفاءات الجزائرية المحلية التي تفهم السوق وتشاركك الطموح.'
              },
              {
                icon: <Shield size={24} className="text-teal-600" />,
                title: 'فرق متكاملة',
                desc: 'أنشئ فريقاً متوازناً يضم المهارات التقنية والإبداعية وخبرات الأعمال.'
              },
              {
                icon: <Zap size={24} className="text-teal-600" />,
                title: 'إطلاق سريع',
                desc: 'من الفكرة إلى المنتج بسرعة أكبر بفضل الفريق المناسب والأدوات الصحيحة.'
              },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-sm transition-all">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">مشاريع تبحث عن شركاء</h2>
                <p className="text-gray-500 text-sm mt-1">انضم لفريق يعمل على مشروع مثير</p>
              </div>
              <Link href="/projects" className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center gap-1 transition-colors">
                عرض الكل <ArrowLeft size={15} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Talent */}
      {featuredTalent.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">كفاءات متاحة للانضمام</h2>
                <p className="text-gray-500 text-sm mt-1">اعثر على الشريك المثالي لمشروعك</p>
              </div>
              <Link href="/talent" className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center gap-1 transition-colors">
                عرض الكل <ArrowLeft size={15} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredTalent.map(person => (
                <TalentCard key={person.id} profile={person} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-teal-800">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">جاهز لإطلاق مشروعك؟</h2>
          <p className="text-teal-100 text-lg mb-8">انضم لآلاف الكفاءات الجزائرية وابدأ رحلتك اليوم</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(profile ? '/projects/new' : '/signup')}
              className="bg-white text-teal-700 hover:bg-teal-50 px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              {profile ? 'أنشئ مشروعاً' : 'سجل الآن مجاناً'}
            </button>
            <button
              onClick={() => navigate('/talent')}
              className="border border-white/40 text-white hover:bg-white/10 px-8 py-3 rounded-xl font-medium transition-colors"
            >
              استعرض الكفاءات
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
