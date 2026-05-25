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
      setError('بريد إلكتروني أو كلمة مرور غير صحيحة');
    } else {
      navigate('/');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-600 rounded-2xl mb-4 shadow-lg">
            <Users size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">مرحباً بعودتك</h1>
          <p className="text-gray-500 mt-1">سجّل دخولك للمتابعة</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm pl-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'جارٍ الدخول...' : 'دخول'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ليس لديك حساب؟{' '}
            <button onClick={() => navigate('/signup')} className="text-teal-600 hover:text-teal-700 font-medium">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-600 rounded-2xl mb-4 shadow-lg">
            <Users size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">انضم لمجتمعنا</h1>
          <p className="text-gray-500 mt-1">أنشئ حسابك وابدأ رحلتك</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-teal-500' : 'bg-gray-200'}`} />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم الكامل</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                    placeholder="أحمد محمد"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">كلمة المرور</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm pl-10"
                      placeholder="6 أحرف على الأقل"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-medium transition-colors"
                >
                  التالي
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">ما هو دورك؟</label>
                  <div className="space-y-2.5">
                    {roles.map(role => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setSelectedRole(role.value)}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                          selectedRole === role.value
                            ? `${role.color} border-current`
                            : 'border-gray-100 hover:border-gray-200 text-gray-700'
                        }`}
                      >
                        <div className={`${selectedRole === role.value ? '' : 'text-gray-400'}`}>
                          {role.icon}
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-sm">{role.label}</div>
                          <div className="text-xs opacity-70">{role.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl border border-red-100">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    رجوع
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                    {loading ? 'جارٍ التسجيل...' : 'إنشاء الحساب'}
                  </button>
                </div>
              </>
            )}
          </form>

          {step === 1 && (
            <p className="text-center text-sm text-gray-500 mt-6">
              لديك حساب بالفعل؟{' '}
              <button onClick={() => navigate('/login')} className="text-teal-600 hover:text-teal-700 font-medium">
                سجّل دخولك
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
