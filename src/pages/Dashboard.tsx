import { useEffect, useState } from 'react';
import { useNavigate, Link } from '../components/Router';
import { supabase, type Project, type JoinRequest } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Loader2, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

const stageLabels: Record<string, string> = {
  idea: 'فكرة',
  mvp: 'نموذج أولي',
  launched: 'مُطلق',
  scaling: 'في النمو',
};

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [myRequests, setMyRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    async function load() {
      setLoading(true);
      const [{ data: projects }, { data: requests }] = await Promise.all([
        supabase
          .from('projects')
          .select('*, project_needed_roles(*), project_members(id)')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('join_requests')
          .select('*, projects(id, title, stage)')
          .eq('requester_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      setMyProjects((projects ?? []).map(p => ({
        ...p,
        needed_roles: p.project_needed_roles,
        members: p.project_members,
      })));
      setMyRequests((requests ?? []).map(r => ({ ...r, project: r.projects })));
      setLoading(false);
    }
    load();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 size={36} className="animate-spin text-teal-500" />
      </div>
    );
  }

  const requestStatusIcon = {
    pending: <Clock size={14} className="text-amber-500" />,
    accepted: <CheckCircle size={14} className="text-green-500" />,
    rejected: <XCircle size={14} className="text-red-500" />,
  };

  const requestStatusLabel = {
    pending: 'قيد المراجعة',
    accepted: 'مقبول',
    rejected: 'مرفوض',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
            <p className="text-gray-500 text-sm mt-1">مرحباً، {profile?.full_name}</p>
          </div>
          <button
            onClick={() => navigate('/projects/new')}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus size={16} /> مشروع جديد
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'مشاريعي', value: myProjects.length },
            { label: 'طلبات مرسلة', value: myRequests.length },
            { label: 'طلبات مقبولة', value: myRequests.filter(r => r.status === 'accepted').length },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* My Projects */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-4">مشاريعي</h2>
            {myProjects.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                <p className="text-gray-400 text-sm mb-3">لا توجد مشاريع بعد</p>
                <button
                  onClick={() => navigate('/projects/new')}
                  className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                >
                  أنشئ مشروعك الأول
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myProjects.map(project => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 hover:border-teal-200 p-4 transition-all group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 group-hover:text-teal-700 transition-colors truncate">
                        {project.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>{stageLabels[project.stage]}</span>
                        <span className="flex items-center gap-1">
                          <Eye size={11} /> {project.views_count}
                        </span>
                        <span>{project.members?.length ?? 0} عضو</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${project.is_open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {project.is_open ? 'مفتوح' : 'مغلق'}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* My Requests */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-4">طلبات الانضمام</h2>
            {myRequests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                <p className="text-gray-400 text-sm mb-3">لم ترسل أي طلبات بعد</p>
                <button
                  onClick={() => navigate('/projects')}
                  className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                >
                  استكشف المشاريع
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map(request => (
                  <Link
                    key={request.id}
                    href={`/projects/${request.project_id}`}
                    className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 hover:border-teal-200 p-4 transition-all group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 group-hover:text-teal-700 transition-colors truncate">
                        {request.project?.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{request.role}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs flex-shrink-0">
                      {requestStatusIcon[request.status]}
                      <span className={`
                        ${request.status === 'pending' ? 'text-amber-600' : ''}
                        ${request.status === 'accepted' ? 'text-green-600' : ''}
                        ${request.status === 'rejected' ? 'text-red-600' : ''}
                      `}>
                        {requestStatusLabel[request.status]}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
