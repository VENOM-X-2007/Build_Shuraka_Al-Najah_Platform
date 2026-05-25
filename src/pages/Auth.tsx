import { useState } from 'react';
import { useNavigate } from '../components/Router';
import { useAuth } from '../context/AuthContext';
import { Users, Code2, Palette, TrendingUp, Eye, EyeOff, Loader2 } from 'lucide-react';
import type { Role } from '../lib/supabase';

const roles: { value: Role; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  {
    value: 'developer',
    label: 'مبرمج',
    desc: 'تطوير تطبيقات الويب والموبايل',
    icon: <Code2 size={24} />,
    color: 'border-blue-200 bg-blue-50 text-blue-700',
  },
  {
    value: 'designer',
    label: 'مصمم',
    desc: 'تصميم UI/UX والهوية البصرية',
    icon: <Palette size={24} />,
    color: 'border-rose-200 bg-rose-50 text-rose-700',
  },
  {
    value: 'entrepreneur',
    label: 'رائد أعمال',
    desc: 'إدارة المشاريع وتطوير الأعمال',
    icon: <TrendingUp size={24} />,
    color: 'border-amber-200 bg-amber-50 text-amber-700',
  },
];

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await signIn(email, password);
    if (error) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } else {
      navigate('/');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-stretch">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] p-10 border-l border-white/5 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'linear-gradient(#14b8a6 1px, transparent 1px), linear-gradient(90deg, #14b8a6 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center">
              <Users size={17} className="text-white" />
            </div>
            <span className="text-white font-bold text-[15px]">شركاء النجاح</span>
          </div>
        </div>
        <div className="relative space-y-4">
          {[
            { role: 'مبرمج', name: 'أمين بلحاج', city: 'الجزائر العاصمة', color: 'bg-blue-500/20 border-blue-500/30 text-blue-300' },
            { role: 'مصممة', name: 'سارة مزهود', city: 'وهران', color: 'bg-rose-500/20 border-rose-500/30 text-rose-300' },
            { role: 'رائد أعمال', name: 'يوسف قرمة', city: 'عنابة', color: 'bg-amber-500/20 border-amber-500/30 text-amber-300' },
          ].map((u, i) => (
            <div key={i} className={`flex items-center gap-3 border rounded-xl px-4 py-3 ${u.color}`}>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {u.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-semibold">{u.name}</p>
                <p className="text-[10px] opacity-60">{u.role} · {u.city}</p>
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-600 text-center pt-2">+ مئات آخرون ينتظرون شريكهم</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">مرحباً بعودتك</h1>
            <p className="text-gray-500 text-sm">سجّل دخولك للمتابعة</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all text-sm pl-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 text-red-400 text-sm px-4 py-2.5 rounded-xl border border-red-500/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-400 text-white py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-teal-500/25 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'جارٍ الدخول...' : 'دخول'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            ليس لديك حساب؟{' '}
            <button onClick={() => navigate('/signup')} className="text-teal-400 hover:text-teal-300 font-semibold transition-colors">
              سجّل الآن
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('developer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await signUp(email, password, { full_name: fullName, role: selectedRole });
    if (error) {
      setError(error.message === 'User already registered' ? 'البريد الإلكتروني مسجّل مسبقاً' : 'حدث خطأ، حاول مجدداً');
    } else {
      navigate('/');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'linear-gradient(#14b8a6 1px, transparent 1px), linear-gradient(90deg, #14b8a6 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-teal-600/10 blur-[100px] pointer-events-none" />
      <div className="relative w-full max-w-md">
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center">
              <Users size={17} className="text-white" />
            </div>
            <span className="text-white font-bold text-[15px]">شركاء النجاح</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">انضم لمجتمعنا</h1>
          <p className="text-gray-500 text-sm">أنشئ حسابك وابدأ رحلتك</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map(s => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-teal-500' : 'bg-white/10'}`} />
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">الاسم الكامل</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all text-sm"
                    placeholder="أحمد محمد"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all text-sm"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">كلمة المرور</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all text-sm pl-10"
                      placeholder="6 أحرف على الأقل"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-teal-500 hover:bg-teal-400 text-white py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-teal-500/25 mt-2"
                >
                  التالي
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">ما هو دورك؟</label>
                  <div className="space-y-2.5">
                    {roles.map(role => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setSelectedRole(role.value)}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                          selectedRole === role.value
                            ? `${role.color} border-current`
                            : 'border-white/10 hover:border-white/20 text-gray-400 hover:text-gray-300'
                        }`}
                      >
                        <div className={`${selectedRole === role.value ? '' : 'text-gray-600'}`}>
                          {role.icon}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-sm">{role.label}</div>
                          <div className="text-xs opacity-60">{role.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 text-red-400 text-sm px-4 py-2.5 rounded-xl border border-red-500/20">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 border border-white/10 text-gray-400 py-3 rounded-xl font-medium hover:bg-white/5 transition-colors"
                  >
                    رجوع
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-teal-500 hover:bg-teal-400 text-white py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-teal-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                    {loading ? 'جارٍ التسجيل...' : 'إنشاء الحساب'}
                  </button>
                </div>
              </>
            )}
          </form>

          {step === 1 && (
            <p className="text-center text-sm text-gray-600 mt-6">
              لديك حساب بالفعل؟{' '}
              <button onClick={() => navigate('/login')} className="text-teal-400 hover:text-teal-300 font-semibold transition-colors">
                سجّل دخولك
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
