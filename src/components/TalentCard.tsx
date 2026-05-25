import { Link } from './Router';
import { type Profile } from '../lib/supabase';
import { MapPin, Code2, Palette, TrendingUp } from 'lucide-react';

const roleConfig: Record<string, { label: string; textColor: string; badgeBg: string; icon: React.ReactNode }> = {
  developer: {
    label: 'مبرمج',
    textColor: 'text-blue-700',
    badgeBg: 'bg-blue-50 border-blue-100',
    icon: <Code2 size={12} />,
  },
  designer: {
    label: 'مصمم',
    textColor: 'text-rose-700',
    badgeBg: 'bg-rose-50 border-rose-100',
    icon: <Palette size={12} />,
  },
  entrepreneur: {
    label: 'رائد أعمال',
    textColor: 'text-amber-700',
    badgeBg: 'bg-amber-50 border-amber-100',
    icon: <TrendingUp size={12} />,
  },
};

const avatarGradients = [
  'from-teal-400 to-teal-600',
  'from-blue-400 to-blue-600',
  'from-rose-400 to-rose-600',
  'from-amber-400 to-amber-600',
  'from-green-400 to-green-600',
];

function getAvatarGradient(id: string) {
  return avatarGradients[id.charCodeAt(0) % avatarGradients.length];
}

export default function TalentCard({ profile }: { profile: Profile }) {
  const role = roleConfig[profile.role] ?? roleConfig.developer;

  return (
    <Link
      href={`/profile/${profile.id}`}
      className="group block bg-white rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-50 transition-all duration-300 p-5"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarGradient(profile.id)} flex items-center justify-center text-white text-base font-bold flex-shrink-0 overflow-hidden`}>
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            profile.full_name?.charAt(0) || 'U'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1 mb-1.5">
            <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors truncate text-[15px] leading-tight">
              {profile.full_name}
            </h3>
            {profile.is_available && (
              <span className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-1.5" title="متاح للانضمام" />
            )}
          </div>
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${role.badgeBg} ${role.textColor}`}>
            {role.icon} {role.label}
          </span>
        </div>
      </div>

      {profile.bio && (
        <p className="text-gray-500 text-sm line-clamp-2 mb-3 leading-relaxed">
          {profile.bio}
        </p>
      )}

      {profile.skills && profile.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {profile.skills.slice(0, 5).map(skill => (
            <span key={skill.id} className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded-md text-[11px] border border-gray-100">
              {skill.name}
            </span>
          ))}
          {profile.skills.length > 5 && (
            <span className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded-md text-[11px]">
              +{profile.skills.length - 5}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-3 border-t border-gray-50">
        <span className="flex items-center gap-1">
          <MapPin size={11} />
          {profile.location || 'الجزائر'}
        </span>
        <span className={`font-medium ${profile.is_available ? 'text-green-600' : 'text-gray-400'}`}>
          {profile.is_available ? 'متاح للانضمام' : 'غير متاح'}
        </span>
      </div>
    </Link>
  );
}
