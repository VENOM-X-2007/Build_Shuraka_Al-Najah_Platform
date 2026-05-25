import { useEffect, useState } from 'react';
import { Link, useNavigate } from '../components/Router';
import { supabase, type Project, type Profile } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Code2, Palette, TrendingUp, ArrowLeft, ArrowDown, CheckCircle } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import TalentCard from '../components/TalentCard';

const testimonials = [
  {
    name: 'أمين بلحاج',
    role: 'مبرمج',
    city: 'الجزائر العاصمة',
    text: 'وجدت شريكي في المشروع خلال أسبوع. الآن نعمل معاً على تطبيق للتوصيل في قسنطينة.',
    color: 'from-teal-500 to-teal-700',
  },
  {
    name: 'سارة مزهود',
    role: 'مصممة UI/UX',
    city: 'وهران',
    text: 'المنصة غيّرت طريقة تفكيري في العمل الحر. أخيراً وجدت مطورين جديين يفهمون قيمة التصميم.',
    color: 'from-rose-500 to-rose-700',
  },
  {
    name: 'يوسف قرمة',
    role: 'رائد أعمال',
    city: 'عنابة',
    text: 'فكرتي بقيت فكرة لسنتين. بعد شركاء النجاح بنيت الفريق في 3 أسابيع وأطلقنا المنتج.',
    color: 'from-amber-500 to-amber-700',
  },
];

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
      <section className="relative min-h-[92vh] flex items-center bg-[#0a0f1e] text-white overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(#14b8a6 1px, transparent 1px), linear-gradient(90deg, #14b8a6 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-teal-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[300px] rounded-full bg-teal-400/10 blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-500/15 border border-teal-500/25 px-4 py-1.5 rounded-full text-teal-400 text-xs font-medium mb-8 tracking-wide">
                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                منصة فرق العمل التقنية الجزائرية
              </div>

              <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] mb-6 tracking-tight">
                فريقك المثالي
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-teal-300 to-teal-500">
                  على بُعد طلب
                </span>
              </h1>

              <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-lg">
                مبرمجون، مصممون، ورواد أعمال من الجزائر يبنون مشاريع حقيقية معاً. انضم وابدأ مشروعك اليوم.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-14">
                <button
                  onClick={() => navigate(profile ? '/projects/new' : '/signup')}
                  className="group flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-7 py-3.5 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5"
                >
                  {profile ? 'أضف مشروعك' : 'ابدأ مجاناً'}
                  <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/projects')}
                  className="flex items-center justify-center gap-2 border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10 text-white px-7 py-3.5 rounded-xl font-medium transition-all duration-200"
                >
                  استعرض المشاريع
                </button>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-8 border-t border-white/10 pt-8">
                {[
                  { value: stats.members || '—', label: 'مطوّر ومصمم' },
                  { value: stats.projects || '—', label: 'مشروع نشط' },
                  { value: stats.teams || '—', label: 'فريق مشكّل' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="text-2xl font-bold text-white">{s.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Role cards */}
            <div className="hidden lg:flex flex-col gap-4 items-end">
              {[
                {
                  icon: <Code2 size={22} />,
                  label: 'مبرمج',
                  desc: 'React · Flutter · Node.js · Python',
                  color: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
                  dot: 'bg-blue-400',
                  count: '1.2k+',
                },
                {
                  icon: <Palette size={22} />,
                  label: 'مصمم',
                  desc: 'Figma · Branding · UI/UX · Motion',
                  color: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
                  dot: 'bg-rose-400',
                  count: '480+',
                },
                {
                  icon: <TrendingUp size={22} />,
                  label: 'رائد أعمال',
                  desc: 'Startups · Growth · Product · Sales',
                  color: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
                  dot: 'bg-amber-400',
                  count: '350+',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`w-full max-w-xs border rounded-2xl p-5 backdrop-blur-sm transition-transform hover:-translate-y-1 cursor-default ${item.color}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span className="font-semibold text-sm">{item.label}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] bg-white/10 px-2 py-0.5 rounded-full">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.dot} animate-pulse`} />
                      متاح
                    </span>
                  </div>
                  <p className="text-xs opacity-60 leading-relaxed">{item.desc}</p>
                  <p className="text-xl font-bold mt-3">{item.count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll cue */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-gray-600 text-xs animate-bounce">
            <ArrowDown size={16} />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-teal-600 text-xs font-bold tracking-widest uppercase">كيف تعمل المنصة</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">ثلاث خطوات للبدء</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-2 relative">
            <div className="hidden md:block absolute top-10 right-[16.6%] left-[16.6%] h-px bg-gradient-to-l from-gray-200 via-teal-300 to-gray-200" />
            {[
              {
                num: '01',
                title: 'أنشئ ملفك الشخصي',
                desc: 'أضف مهاراتك وخبراتك وما تبحث عنه في فريق العمل المثالي.',
              },
              {
                num: '02',
                title: 'انشر مشروعك أو تصفّح',
                desc: 'شارك فكرتك وحدد الأدوار التي تحتاجها، أو ابحث في مشاريع موجودة.',
              },
              {
                num: '03',
                title: 'ابنِ فريقك وانطلق',
                desc: 'تواصل مع الكفاءات المناسبة وابدأ العمل بفريق متكامل.',
              },
            ].map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center px-6 py-8">
                <div className="relative z-10 w-20 h-20 bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <span className="text-3xl font-black text-teal-500/30 absolute select-none">{step.num}</span>
                  <CheckCircle size={20} className="text-teal-600 relative z-10" />
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-teal-600 text-xs font-bold tracking-widest uppercase">المشاريع</span>
                <h2 className="text-2xl font-bold text-gray-900 mt-1">مشاريع تبحث عن شركاء</h2>
              </div>
              <Link href="/projects" className="text-sm font-medium text-gray-500 hover:text-teal-600 flex items-center gap-1 transition-colors">
                عرض الكل <ArrowLeft size={14} />
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

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-teal-600 text-xs font-bold tracking-widest uppercase">آراء المجتمع</span>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">من واقع تجربة أعضائنا</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="relative bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-teal-200 transition-colors">
                <div className="text-5xl text-gray-200 font-serif absolute top-3 right-5 select-none leading-none">"</div>
                <p className="text-gray-700 text-sm leading-relaxed mt-4 mb-6 relative">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role} · {t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Talent */}
      {featuredTalent.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-teal-600 text-xs font-bold tracking-widest uppercase">الكفاءات</span>
                <h2 className="text-2xl font-bold text-gray-900 mt-1">كفاءات متاحة الآن</h2>
              </div>
              <Link href="/talent" className="text-sm font-medium text-gray-500 hover:text-teal-600 flex items-center gap-1 transition-colors">
                عرض الكل <ArrowLeft size={14} />
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

      {/* CTA banner */}
      <section className="py-24 bg-[#0a0f1e] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(#14b8a6 1px, transparent 1px), linear-gradient(90deg, #14b8a6 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-[600px] h-[300px] bg-teal-500/15 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            فكرتك تستحق فريقاً يُؤمن بها
          </h2>
          <p className="text-gray-400 text-lg mb-10">انضم للمجتمع واعثر على شركائك في الجزائر</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(profile ? '/projects/new' : '/signup')}
              className="group bg-teal-500 hover:bg-teal-400 text-white px-8 py-4 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
            >
              {profile ? 'أنشئ مشروعاً' : 'سجل الآن مجاناً'}
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/talent')}
              className="border border-white/20 hover:border-white/40 text-white hover:bg-white/5 px-8 py-4 rounded-xl font-medium transition-all"
            >
              استعرض الكفاءات
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
