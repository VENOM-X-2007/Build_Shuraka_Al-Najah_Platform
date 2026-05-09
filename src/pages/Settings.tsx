import { useState, useEffect } from 'react';
import { useNavigate } from '../components/Router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2, Save, X } from 'lucide-react';
import type { Role, Skill } from '../lib/supabase';

const roleOptions: { value: Role; label: string }[] = [
  { value: 'developer', label: 'مبرمج' },
  { value: 'designer', label: 'مصمم' },
  { value: 'entrepreneur', label: 'رائد أعمال' },
];

export default function Settings() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [form, setForm] = useState({
    full_name: '',
    bio: '',
    role: 'developer' as Role,
    location: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    is_available: true,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    supabase.from('skills').select('*').order('category').then(({ data }) => {
      setAllSkills(data ?? []);
    });
  }, [user, navigate]);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        role: profile.role || 'developer',
        location: profile.location || '',
        linkedin_url: profile.linkedin_url || '',
        github_url: profile.github_url || '',
        portfolio_url: profile.portfolio_url || '',
        is_available: profile.is_available ?? true,
      });
      setSelectedSkillIds(profile.skills?.map(s => s.id) ?? []);
    }
  }, [profile]);

  function toggleSkill(skillId: string) {
    setSelectedSkillIds(prev =>
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    await supabase.from('profiles').update({ ...form, updated_at: new Date().toISOString() }).eq('id', user.id);
    await supabase.from('profile_skills').delete().eq('profile_id', user.id);
    if (selectedSkillIds.length > 0) {
      await supabase.from('profile_skills').insert(
        selectedSkillIds.map(skill_id => ({ profile_id: user.id, skill_id }))
      );
    }

    await refreshProfile();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setLoading(false);
  }

  const skillsByCategory = allSkills.reduce<Record<string, Skill[]>>((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    frontend: 'الواجهة الأمامية',
    backend: 'الخادم',
    mobile: 'تطبيقات موبايل',
    design: 'التصميم',
    business: 'الأعمال',
    ai: 'الذكاء الاصطناعي',
    infrastructure: 'البنية التحتية',
    database: 'قواعد البيانات',
    general: 'عام',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">إعدادات الملف الشخصي</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">المعلومات الأساسية</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم الكامل *</label>
              <input
                type="text"
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">نبذة عنك</label>
              <textarea
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none text-sm resize-none"
                placeholder="اكتب نبذة قصيرة عن نفسك وخبراتك..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">الدور</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none text-sm bg-white"
                >
                  {roleOptions.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">الموقع</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none text-sm"
                  placeholder="الجزائر، قسنطينة..."
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_available}
                onChange={e => setForm(f => ({ ...f, is_available: e.target.checked }))}
                className="rounded accent-teal-600"
              />
              <span className="text-sm text-gray-700">متاح للانضمام لمشاريع جديدة</span>
            </label>
          </div>

          {/* Links */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">روابط التواصل</h2>
            {[
              { key: 'github_url', label: 'GitHub', placeholder: 'https://github.com/username' },
              { key: 'linkedin_url', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
              { key: 'portfolio_url', label: 'المحفظة / الموقع', placeholder: 'https://yoursite.com' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                <input
                  type="url"
                  value={form[field.key as keyof typeof form] as string}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none text-sm"
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">المهارات</h2>
            <div className="space-y-4">
              {Object.entries(skillsByCategory).map(([category, skills]) => (
                <div key={category}>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    {categoryLabels[category] || category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => toggleSkill(skill.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          selectedSkillIds.includes(skill.id)
                            ? 'bg-teal-100 text-teal-700 border border-teal-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        {selectedSkillIds.includes(skill.id) && <X size={10} />}
                        {skill.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pb-8">
            <button
              type="button"
              onClick={() => navigate(`/profile/${user?.id}`)}
              className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-60'
              }`}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {loading ? 'جارٍ الحفظ...' : saved ? 'تم الحفظ!' : 'حفظ التغييرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
