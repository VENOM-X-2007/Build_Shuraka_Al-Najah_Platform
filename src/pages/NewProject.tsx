import { useState } from 'react';
import { useNavigate } from '../components/Router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, X, Loader2 } from 'lucide-react';
import type { ProjectStage } from '../lib/supabase';

const stages: { value: ProjectStage; label: string; desc: string }[] = [
  { value: 'idea', label: 'فكرة', desc: 'لا يزال في مرحلة التخطيط' },
  { value: 'mvp', label: 'نموذج أولي', desc: 'يوجد نموذج أولي' },
  { value: 'launched', label: 'مُطلق', desc: 'تم الإطلاق للجمهور' },
  { value: 'scaling', label: 'في النمو', desc: 'يتوسع ويكبر' },
];

interface NeededRole {
  role: string;
  description: string;
}

export default function NewProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState<ProjectStage>('idea');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [neededRoles, setNeededRoles] = useState<NeededRole[]>([{ role: '', description: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    navigate('/login');
    return null;
  }

  function addRole() {
    setNeededRoles(prev => [...prev, { role: '', description: '' }]);
  }

  function removeRole(index: number) {
    setNeededRoles(prev => prev.filter((_, i) => i !== index));
  }

  function updateRole(index: number, field: keyof NeededRole, value: string) {
    setNeededRoles(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: project, error: err } = await supabase
      .from('projects')
      .insert({
        owner_id: user.id,
        title,
        description,
        stage,
        website_url: websiteUrl,
        is_open: true,
      })
      .select()
      .single();

    if (err || !project) {
      setError('حدث خطأ، حاول مجدداً');
      setLoading(false);
      return;
    }

    const validRoles = neededRoles.filter(r => r.role.trim());
    if (validRoles.length > 0) {
      await supabase.from('project_needed_roles').insert(
        validRoles.map(r => ({ project_id: project.id, role: r.role, description: r.description }))
      );
    }

    navigate(`/projects/${project.id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">مشروع جديد</h1>
          <p className="text-gray-500 text-sm mt-1">شارك فكرتك وابحث عن شركائك</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">اسم المشروع *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none text-sm"
                placeholder="اسم مشروعك..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">وصف المشروع *</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                rows={5}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none text-sm resize-none"
                placeholder="اشرح فكرة مشروعك، أهدافه، والمشكلة التي يحلها..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">رابط الموقع (اختياري)</label>
              <input
                type="url"
                value={websiteUrl}
                onChange={e => setWebsiteUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none text-sm"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Stage */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">مرحلة المشروع</label>
            <div className="grid grid-cols-2 gap-3">
              {stages.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStage(s.value)}
                  className={`p-3 rounded-xl border-2 text-right transition-all ${
                    stage === s.value
                      ? 'border-teal-400 bg-teal-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <p className="font-medium text-sm text-gray-900">{s.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Needed roles */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">الأدوار المطلوبة</label>
              <button
                type="button"
                onClick={addRole}
                className="flex items-center gap-1 text-teal-600 hover:text-teal-700 text-xs font-medium"
              >
                <Plus size={14} /> أضف دوراً
              </button>
            </div>
            <div className="space-y-3">
              {neededRoles.map((role, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={role.role}
                      onChange={e => updateRole(index, 'role', e.target.value)}
                      placeholder="عنوان الدور (مثال: مطور Flutter)"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none text-sm"
                    />
                    <input
                      type="text"
                      value={role.description}
                      onChange={e => updateRole(index, 'description', e.target.value)}
                      placeholder="وصف مختصر للمهام..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none text-sm"
                    />
                  </div>
                  {neededRoles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRole(index)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors mt-0.5"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div className="flex gap-3 pb-8">
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'جارٍ الحفظ...' : 'نشر المشروع'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
