import { Link } from './Router';
import { type Profile } from '../lib/supabase';
import { MapPin, CheckCircle, Code2, Palette, TrendingUp } from 'lucide-react';

const roleConfig: Record<string, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
  developer: {
    label: 'مبرمج',
    color: 'text-blue-700',
    icon: <Code2 size={14} />,
    bg: 'bg-blue-50 border-blue-100',
  },
  designer: {
    label: 'مصمم',
    color: 'text-rose-700',
    icon: <Palette size={14} />,
    bg: 'bg-rose-50 border-rose-100',
  },
  entrepreneur: {
    label: 'رائد أعمال',
    color: 'text-amber-700',
    icon: <TrendingUp size={14} />,
    bg: 'bg-amber-50 border-amber-100',
  },
};

const avatarColors = [
  'from-teal-400 to-teal-600',
  'from-blue-400 to-blue-600',
  'from-rose-400 to-rose-600',
  'from-amber-400 to-amber-600',
  'from-green-400 to-green-600',
];

function getAvatarColor(id: string) {
  return avatarColors[id.charCodeAt(0) % avatarColors.length];
}

export default function TalentCard({ profile }: { profile: Profile }) {
  const role = roleConfig[profile.role] ?? roleConfig.developer;

  return (
    <Link
      href={`/profile/${profile.id}`}
      className="group block bg-white rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all p-5"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getAvatarColor(profile.id)} flex items-center justify-center text-white text-lg font-bold flex-shrink-0 overflow-hidden`}>
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            profile.full_name?.charAt(0) || 'U'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors truncate">
              {profile.full_name}
            </h3>
            {profile.is_available && (
              <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
            )}
          </div>
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${role.bg} ${role.color}`}>
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
          {profile.skills.slice(0, 4).map(skill => (
            <span key={skill.id} className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full text-xs">
              {skill.name}
            </span>
          ))}
          {profile.skills.length > 4 && (
            <span className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded-full text-xs">
              +{profile.skills.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t border-gray-50">
        <MapPin size={12} />
        <span>{profile.location || 'الجزائر'}</span>
        <span className={`mr-auto font-medium ${profile.is_available ? 'text-green-600' : 'text-gray-400'}`}>
          {profile.is_available ? 'متاح للانضمام' : 'غير متاح حالياً'}
        </span>
      </div>
    </Link>
  );
}
