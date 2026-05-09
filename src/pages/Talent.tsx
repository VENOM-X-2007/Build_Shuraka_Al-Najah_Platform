import { useEffect, useState } from 'react';
import { supabase, type Profile } from '../lib/supabase';
import TalentCard from '../components/TalentCard';
import { Search, Loader2 } from 'lucide-react';
import type { Role } from '../lib/supabase';

const roleFilters: { value: Role | 'all'; label: string }[] = [
  { value: 'all', label: 'الكل' },
  { value: 'developer', label: 'مبرمجون' },
  { value: 'designer', label: 'مصممون' },
  { value: 'entrepreneur', label: 'رواد أعمال' },
];

export default function TalentPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<Role | 'all'>('all');
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let query = supabase
        .from('profiles')
        .select('*, profile_skills(skill_id, skills(id, name, category))')
        .order('created_at', { ascending: false });

      if (role !== 'all') query = query.eq('role', role);
      if (availableOnly) query = query.eq('is_available', true);

      const { data } = await query;

      let filtered = (data ?? []).map(p => ({
        ...p,
        skills: p.profile_skills?.map((ps: { skills: unknown }) => ps.skills).filter(Boolean) ?? [],
      }));

      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(p =>
          p.full_name?.toLowerCase().includes(q) ||
          p.bio?.toLowerCase().includes(q) ||
          p.skills?.some((s: { name: string }) => s.name.toLowerCase().includes(q))
        );
      }

      setProfiles(filtered);
      setLoading(false);
    }
    load();
  }, [role, availableOnly, search]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">الكفاءات</h1>
          <p className="text-gray-500 text-sm mt-1">{profiles.length} شخص</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث بالاسم، المهارة..."
              className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {roleFilters.map(r => (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  role === r.value
                    ? 'bg-teal-100 text-teal-700'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {r.label}
              </button>
            ))}
            <label className="flex items-center gap-1.5 mr-auto cursor-pointer">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={e => setAvailableOnly(e.target.checked)}
                className="rounded accent-teal-600"
              />
              <span className="text-xs text-gray-600">متاحون فقط</span>
            </label>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-teal-500" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search size={28} className="text-gray-400" />
            </div>
            <h3 className="text-gray-700 font-medium mb-1">لا توجد نتائج</h3>
            <p className="text-gray-400 text-sm">جرّب تغيير معايير البحث</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {profiles.map(person => (
              <TalentCard key={person.id} profile={person} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
