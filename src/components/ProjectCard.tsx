import { Link } from './Router';
import { type Project } from '../lib/supabase';
import { MapPin, Users, Eye, Code2, Palette, TrendingUp } from 'lucide-react';

const stageLabels: Record<string, string> = {
  idea: 'فكرة',
  mvp: 'نموذج أولي',
  launched: 'مُطلق',
  scaling: 'في النمو',
};

const stageColors: Record<string, string> = {
  idea: 'bg-gray-100 text-gray-600',
  mvp: 'bg-blue-100 text-blue-700',
  launched: 'bg-green-100 text-green-700',
  scaling: 'bg-amber-100 text-amber-700',
};

const roleIcons: Record<string, React.ReactNode> = {
  developer: <Code2 size={12} />,
  designer: <Palette size={12} />,
  entrepreneur: <TrendingUp size={12} />,
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
  const index = id.charCodeAt(0) % coverImages.length;
  return coverImages[index];
}

export default function ProjectCard({ project }: { project: Project }) {
  const openRoles = project.needed_roles?.filter(r => !r.is_filled) ?? [];

  return (
    <Link href={`/projects/${project.id}`} className="group block bg-white rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all overflow-hidden">
      <div className="relative h-40 overflow-hidden">
        <img
          src={project.cover_image || getDefaultCover(project.id)}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-medium ${stageColors[project.stage]}`}>
          {stageLabels[project.stage]}
        </span>
        {!project.is_open && (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            مكتمل
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors mb-1 line-clamp-1">
          {project.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-3 leading-relaxed">
          {project.description}
        </p>

        {/* Owner */}
        {project.owner && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold overflow-hidden">
              {project.owner.avatar_url ? (
                <img src={project.owner.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                project.owner.full_name?.charAt(0)
              )}
            </div>
            <span className="text-xs text-gray-500">{project.owner.full_name}</span>
            <span className="mr-auto">
              {roleIcons[project.owner.role]}
            </span>
          </div>
        )}

        {/* Open roles */}
        {openRoles.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {openRoles.slice(0, 3).map(role => (
              <span key={role.id} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">
                {role.role}
              </span>
            ))}
            {openRoles.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full text-xs">
                +{openRoles.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-400 pt-2 border-t border-gray-50">
          <span className="flex items-center gap-1"><Users size={12} /> {project.members?.length ?? 0} عضو</span>
          <span className="flex items-center gap-1"><Eye size={12} /> {project.views_count}</span>
          <span className="flex items-center gap-1 mr-auto"><MapPin size={12} /> الجزائر</span>
        </div>
      </div>
    </Link>
  );
}
