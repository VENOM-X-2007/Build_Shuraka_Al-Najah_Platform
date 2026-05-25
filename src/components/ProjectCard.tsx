import { Link } from './Router';
import { type Project } from '../lib/supabase';
import { MapPin, Users, Eye, Code2, Palette, TrendingUp } from 'lucide-react';

const stageConfig: Record<string, { label: string; color: string }> = {
  idea: { label: 'فكرة', color: 'bg-gray-100 text-gray-600' },
  mvp: { label: 'MVP', color: 'bg-blue-100 text-blue-700' },
  launched: { label: 'مُطلق', color: 'bg-emerald-100 text-emerald-700' },
  scaling: { label: 'في النمو', color: 'bg-amber-100 text-amber-700' },
};

const roleIcons: Record<string, React.ReactNode> = {
  developer: <Code2 size={11} />,
  designer: <Palette size={11} />,
  entrepreneur: <TrendingUp size={11} />,
};

const coverImages = [
  'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?w=400&h=200&fit=crop',
  'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?w=400&h=200&fit=crop',
  'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?w=400&h=200&fit=crop',
  'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?w=400&h=200&fit=crop',
  'https://images.pexels.com/photos/574077/pexels-photo-574077.jpeg?w=400&h=200&fit=crop',
  'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?w=400&h=200&fit=crop',
];

function getDefaultCover(id: string) {
  return coverImages[id.charCodeAt(0) % coverImages.length];
}

export default function ProjectCard({ project }: { project: Project }) {
  const openRoles = project.needed_roles?.filter(r => !r.is_filled) ?? [];
  const stage = stageConfig[project.stage] ?? stageConfig.idea;

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block bg-white rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-50 transition-all duration-300 overflow-hidden"
    >
      <div className="relative h-44 overflow-hidden bg-gray-100">
        <img
          src={project.cover_image || getDefaultCover(project.id)}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <div className="absolute top-3 right-3 flex gap-1.5">
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${stage.color}`}>
            {stage.label}
          </span>
          {!project.is_open && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-600">
              مكتمل
            </span>
          )}
        </div>
        {project.is_open && openRoles.length > 0 && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-1 bg-teal-500 text-white text-[10px] font-semibold rounded-lg">
              {openRoles.length} {openRoles.length === 1 ? 'دور شاغر' : 'أدوار شاغرة'}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors mb-1.5 line-clamp-1 text-[15px]">
          {project.title}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">
          {project.description}
        </p>

        {openRoles.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {openRoles.slice(0, 3).map(role => (
              <span key={role.id} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-md text-[11px] font-medium border border-teal-100">
                {role.role}
              </span>
            ))}
            {openRoles.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded-md text-[11px]">
                +{openRoles.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-3 border-t border-gray-50">
          {project.owner && (
            <>
              <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-[10px] overflow-hidden flex-shrink-0">
                {project.owner.avatar_url ? (
                  <img src={project.owner.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  project.owner.full_name?.charAt(0)
                )}
              </div>
              <span className="text-gray-500 truncate max-w-[100px]">{project.owner.full_name}</span>
              <span className="text-gray-300">{roleIcons[project.owner.role]}</span>
            </>
          )}
          <div className="flex items-center gap-2.5 mr-auto">
            <span className="flex items-center gap-1"><Users size={11} /> {project.members?.length ?? 0}</span>
            <span className="flex items-center gap-1"><Eye size={11} /> {project.views_count}</span>
            <span className="flex items-center gap-1"><MapPin size={11} /> الجزائر</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
