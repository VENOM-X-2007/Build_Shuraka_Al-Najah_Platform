import { useState, useEffect } from 'react';
import { Link, useLocation } from './Router';
import { useAuth } from '../context/AuthContext';
import { Code2, Palette, TrendingUp, Menu, X, Bell, LogOut, User, Plus, Users } from 'lucide-react';

const roleColors: Record<string, string> = {
  developer: 'bg-blue-100 text-blue-700',
  designer: 'bg-rose-100 text-rose-700',
  entrepreneur: 'bg-amber-100 text-amber-700',
};

const roleIcons: Record<string, React.ReactNode> = {
  developer: <Code2 size={13} />,
  designer: <Palette size={13} />,
  entrepreneur: <TrendingUp size={13} />,
};

const roleLabels: Record<string, string> = {
  developer: 'مبرمج',
  designer: 'مصمم',
  entrepreneur: 'رائد أعمال',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHomePage = pathname === '/';

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/projects', label: 'المشاريع' },
    { href: '/talent', label: 'الكفاءات' },
  ];

  const navBg = isHomePage
    ? scrolled
      ? 'bg-white/95 backdrop-blur-md border-gray-100 shadow-sm'
      : 'bg-transparent border-transparent'
    : 'bg-white border-gray-100 shadow-sm';

  const logoTextColor = isHomePage && !scrolled ? 'text-white' : 'text-gray-900';
  const logoSubColor = isHomePage && !scrolled ? 'text-white/50' : 'text-gray-400';
  const linkColor = (href: string) => {
    const active = pathname === href;
    if (isHomePage && !scrolled) {
      return active ? 'text-teal-300 bg-white/10' : 'text-white/80 hover:text-white hover:bg-white/10';
    }
    return active ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50';
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Navbar */}
      <nav className={`fixed top-0 inset-x-0 z-50 border-b transition-all duration-300 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-teal-400 transition-colors">
                <Users size={17} className="text-white" />
              </div>
              <div>
                <span className={`font-bold text-[15px] leading-tight block transition-colors ${logoTextColor}`}>
                  شركاء النجاح
                </span>
                <span className={`text-[10px] leading-tight block transition-colors ${logoSubColor}`}>
                  منصة فرق العمل
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${linkColor(link.href)}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {profile ? (
                <>
                  <Link
                    href="/projects/new"
                    className="hidden sm:flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 text-white px-3.5 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-md hover:shadow-teal-500/20"
                  >
                    <Plus size={14} />
                    مشروع جديد
                  </Link>
                  <button className={`relative p-2 rounded-lg transition-colors ${isHomePage && !scrolled ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
                    <Bell size={17} />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden ring-2 ring-teal-200">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          profile.full_name?.charAt(0) || 'U'
                        )}
                      </div>
                    </button>
                    {profileMenuOpen && (
                      <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-3.5 py-2.5 border-b border-gray-50 mb-1">
                          <p className="font-semibold text-gray-900 text-sm">{profile.full_name}</p>
                          <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${roleColors[profile.role]}`}>
                            {roleIcons[profile.role]}
                            {roleLabels[profile.role]}
                          </span>
                        </div>
                        <Link href={`/profile/${profile.id}`} className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setProfileMenuOpen(false)}>
                          <User size={14} className="text-gray-400" /> ملفي الشخصي
                        </Link>
                        <Link href="/dashboard" className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setProfileMenuOpen(false)}>
                          <TrendingUp size={14} className="text-gray-400" /> لوحة التحكم
                        </Link>
                        <div className="border-t border-gray-50 mt-1 pt-1">
                          <button
                            onClick={() => { signOut(); setProfileMenuOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={14} /> تسجيل الخروج
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    href="/login"
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isHomePage && !scrolled ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                  >
                    دخول
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium rounded-lg transition-all hover:shadow-md hover:shadow-teal-500/20"
                  >
                    انضم الآن
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                className={`md:hidden p-2 rounded-lg transition-colors ${isHomePage && !scrolled ? 'text-white/70 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'}`}
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {profile && (
              <Link
                href="/projects/new"
                className="block px-4 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-50 rounded-xl transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                + أضف مشروعاً
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#0a0f1e] text-gray-500 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center">
                  <Users size={17} className="text-white" />
                </div>
                <span className="text-white font-bold text-[15px]">شركاء النجاح</span>
              </div>
              <p className="text-sm leading-relaxed mb-6 max-w-sm">
                منصة جزائرية تجمع المبرمجين، المصممين، ورواد الأعمال لبناء مشاريع تقنية ناجحة معاً. من الفكرة إلى المنتج بفريق متكامل.
              </p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-gray-400">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  الخدمة تعمل
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-white text-sm font-semibold mb-4">المنصة</h4>
              <ul className="space-y-2.5">
                {[
                  { href: '/projects', label: 'المشاريع' },
                  { href: '/talent', label: 'الكفاءات' },
                  { href: '/signup', label: 'انضم إلينا' },
                ].map(item => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm hover:text-teal-400 transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white text-sm font-semibold mb-4">من نحن</h4>
              <p className="text-sm leading-relaxed">
                نؤمن بأن الفرق المتكاملة هي سر النجاح. نساعدك على إيجاد شركائك المثاليين في الجزائر.
              </p>
            </div>
          </div>

          <div className="border-t border-white/5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">© 2026 شركاء النجاح — جميع الحقوق محفوظة</p>
            <div className="flex items-center gap-2 text-[11px] text-gray-700">
              <span>صُنع في</span>
              <span className="text-white font-medium">الجزائر</span>
              <span className="text-gray-600">·</span>
              <span>للجزائريين</span>
            </div>
          </div>
        </div>
      </footer>

      {profileMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
      )}
    </div>
  );
}
