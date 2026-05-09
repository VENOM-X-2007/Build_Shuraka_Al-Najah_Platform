import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from '../components/Router';
import { supabase, type Project, type JoinRequest } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Globe, Users, Eye, Calendar, CheckCircle, XCircle, Loader2, Send, CreditCard as Edit, Trash2, ExternalLink } from 'lucide-react';
import TalentCard from '../components/TalentCard';

const stageLabels: Record<string, string> = {
  idea: 'فكرة',
  mvp: 'نموذج أولي',
  launched: 'مُطلق',
  scaling: 'في النمو',
};

const coverImages = [
  'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?w=1200&h=400&fit=crop',
  'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?w=1200&h=400&fit=crop',
  'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?w=1200&h=400&fit=crop',
  'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?w=1200&h=400&fit=crop',
];

function getDefaultCover(id: string) {
  return coverImages[id.charCodeAt(0) % coverImages.length];
}

export default function ProjectDetail() {
  const params = useParams('/projects/:id');
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [myRequest, setMyRequest] = useState<JoinRequest | null>(null);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinRole, setJoinRole] = useState('');
  const [joinMessage, setJoinMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const projectId = params.id;
  const isOwner = user?.id === project?.owner_id;
  const isMember = project?.members?.some(m => m.user_id === user?.id);

  useEffect(() => {
    if (!projectId) return;
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('projects')
        .select(`
          *,
          profiles!projects_owner_id_fkey(id, full_name, role, avatar_url, bio, location),
          project_needed_roles(*),
          project_members(id, user_id, role, joined_at, profiles(id, full_name, role, avatar_url, bio, location, is_available))
        `)
        .eq('id', projectId)
        .maybeSingle();

      if (data) {
        setProject({
          ...data,
          owner: data.profiles,
          needed_roles: data.project_needed_roles,
          members: data.project_members.map((m: { profiles: unknown } & Record<string, unknown>) => ({
            ...m,
            profile: m.profiles,
          })),
        });
      }

      if (user) {
        const { data: req } = await supabase
          .from('join_requests')
          .select('*')
          .eq('project_id', projectId)
          .eq('requester_id', user.id)
          .maybeSingle();
        setMyRequest(req);
      }

      await supabase.from('projects').update({ views_count: (data?.views_count ?? 0) + 1 }).eq('id', projectId);
      setLoading(false);
    }
    load();
  }, [projectId, user]);

  useEffect(() => {
    if (!isOwner || !projectId) return;
    async function loadRequests() {
      const { data } = await supabase
        .from('join_requests')
        .select('*, profiles!join_requests_requester_id_fkey(id, full_name, role, avatar_url, bio)')
        .eq('project_id', projectId)
        .eq('status', 'pending');
      setPendingRequests((data ?? []).map(r => ({ ...r, requester: r.profiles })));
    }
    loadRequests();
  }, [isOwner, projectId]);

  async function handleJoinRequest() {
    if (!user || !projectId) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from('join_requests')
      .insert({ project_id: projectId, requester_id: user.id, role: joinRole, message: joinMessage })
      .select()
      .single();
    if (!error && data) setMyRequest(data);
    setShowJoinModal(false);
    setSubmitting(false);
  }

  async function handleRequestAction(requestId: string, status: 'accepted' | 'rejected', request: JoinRequest) {
    await supabase.from('join_requests').update({ status }).eq('id', requestId);
    if (status === 'accepted') {
      await supabase.from('project_members').insert({
        project_id: request.project_id,
        user_id: request.requester_id,
        role: request.role,
      });
    }
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
  }

  async function handleDeleteProject() {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) return;
    await supabase.from('projects').delete().eq('id', projectId);
    navigate('/projects');
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 size={36} className="animate-spin text-teal-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500">المشروع غير موجود</p>
        <Link href="/projects" className="text-teal-600 hover:underline mt-2 block">العودة للمشاريع</Link>
      </div>
    );
  }

  const openRoles = project.needed_roles?.filter(r => !r.is_filled) ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover */}
      <div className="relative h-56 md:h-72 overflow-hidden">
        <img
          src={project.cover_image || getDefaultCover(project.id)}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 p-6 text-white">
          <div className="max-w-5xl mx-auto">
            <button onClick={() => navigate('/projects')} className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-3 transition-colors">
              <ArrowRight size={14} /> المشاريع
            </button>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{project.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    {stageLabels[project.stage]}
                  </span>
                  {project.is_open ? (
                    <span className="text-xs bg-green-500/80 px-2 py-0.5 rounded-full">يقبل أعضاء</span>
                  ) : (
                    <span className="text-xs bg-gray-500/80 px-2 py-0.5 rounded-full">مكتمل</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {isOwner && (
                  <>
                    <button
                      onClick={() => navigate(`/projects/${project.id}/edit`)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={handleDeleteProject}
                      className="p-2 bg-red-500/60 hover:bg-red-500/80 rounded-lg backdrop-blur-sm transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">عن المشروع</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{project.description}</p>
            </div>

            {/* Team members */}
            {project.members && project.members.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">الفريق الحالي ({project.members.length})</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {project.members.map(member => (
                    member.profile && (
                      <TalentCard key={member.id} profile={member.profile} />
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Pending requests (owner only) */}
            {isOwner && pendingRequests.length > 0 && (
              <div className="bg-white rounded-2xl border border-amber-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  طلبات الانضمام
                  <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    {pendingRequests.length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {pendingRequests.map(req => (
                    <div key={req.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm flex-shrink-0">
                        {req.requester?.full_name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{req.requester?.full_name}</p>
                        <p className="text-xs text-gray-500">{req.role}</p>
                        {req.message && <p className="text-xs text-gray-600 mt-1">{req.message}</p>}
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleRequestAction(req.id, 'accepted', req)}
                          className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleRequestAction(req.id, 'rejected', req)}
                          className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Stats */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
                    <Users size={12} /> الأعضاء
                  </div>
                  <div className="text-xl font-bold text-gray-900">{project.members?.length ?? 0}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
                    <Eye size={12} /> المشاهدات
                  </div>
                  <div className="text-xl font-bold text-gray-900">{project.views_count}</div>
                </div>
              </div>

              {project.website_url && (
                <a
                  href={project.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 mt-4 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-600 transition-colors"
                >
                  <Globe size={14} />
                  <span className="truncate">{project.website_url}</span>
                  <ExternalLink size={12} className="mr-auto flex-shrink-0" />
                </a>
              )}

              <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                <Calendar size={12} />
                {new Date(project.created_at).toLocaleDateString('ar-DZ')}
              </div>
            </div>

            {/* Open roles */}
            {openRoles.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-3">الأدوار المطلوبة</h3>
                <div className="space-y-2">
                  {openRoles.map(role => (
                    <div key={role.id} className="p-3 bg-teal-50 rounded-xl">
                      <p className="text-sm font-medium text-teal-800">{role.role}</p>
                      {role.description && (
                        <p className="text-xs text-teal-600 mt-0.5">{role.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Join button */}
            {!isOwner && !isMember && project.is_open && user && (
              <div>
                {myRequest ? (
                  <div className={`p-4 rounded-xl text-center text-sm font-medium ${
                    myRequest.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                    myRequest.status === 'accepted' ? 'bg-green-50 text-green-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {myRequest.status === 'pending' && 'طلبك قيد المراجعة'}
                    {myRequest.status === 'accepted' && 'تم قبول طلبك'}
                    {myRequest.status === 'rejected' && 'تم رفض طلبك'}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Send size={16} />
                    طلب الانضمام
                  </button>
                )}
              </div>
            )}

            {!user && project.is_open && (
              <Link href="/signup" className="block w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-medium transition-colors text-center">
                سجّل للانضمام
              </Link>
            )}

            {/* Owner */}
            {project.owner && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-3">صاحب المشروع</h3>
                <Link href={`/profile/${project.owner.id}`} className="flex items-center gap-3 hover:bg-gray-50 rounded-xl p-2 -m-2 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold overflow-hidden">
                    {project.owner.avatar_url ? (
                      <img src={project.owner.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      project.owner.full_name?.charAt(0)
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{project.owner.full_name}</p>
                    <p className="text-xs text-gray-500">{project.owner.location || 'الجزائر'}</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6" dir="rtl">
            <h2 className="font-bold text-gray-900 text-lg mb-4">طلب الانضمام</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">دورك في المشروع</label>
                <input
                  type="text"
                  value={joinRole}
                  onChange={e => setJoinRole(e.target.value)}
                  placeholder="مثال: مطور واجهة أمامية"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">رسالتك</label>
                <textarea
                  value={joinMessage}
                  onChange={e => setJoinMessage(e.target.value)}
                  rows={3}
                  placeholder="اشرح لماذا تريد الانضمام وما الذي يمكنك تقديمه..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none text-sm resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleJoinRequest}
                  disabled={!joinRole || submitting}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  إرسال الطلب
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
