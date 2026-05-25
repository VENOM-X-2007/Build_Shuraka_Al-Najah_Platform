import { useState } from 'react';
import { Link, useLocation } from './Router';
import { useAuth } from '../context/AuthContext';
import { Code2, Palette, TrendingUp, Menu, X, Bell, LogOut, User, Plus, Users } from 'lucide-react';

const roleColors: Record<string, string> = {
  developer: 'bg-blue-100 text-blue-700',
  designer: 'bg-rose-100 text-rose-700',
  entrepreneur: 'bg-amber-100 text-amber-700',
};

const roleIcons: Record<string, React.ReactNode> = {
  developer: <Code2 size={14} />,
  designer: <Palette size={14} />,
  entrepreneur: <TrendingUp size={14} />,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/projects', label: 'المشاريع' },
    { href: '/talent', label: 'الكفاءات' },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Users size={18} className="text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-900 text-base leading-tight block">شركاء النجاح</span>
                <span className="text-[10px] text-gray-400 leading-tight block">منصة فرق العمل</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
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
                    className="hidden sm:flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus size={15} />
                    مشروع جديد
                  </Link>
                  <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <Bell size={18} />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          profile.full_name?.charAt(0) || 'U'
                        )}
                      </div>
                    </button>
                    {profileMenuOpen && (
                      <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                        <div className="px-3 py-2 border-b border-gray-50">
                          <p className="font-medium text-gray-900 text-sm">{profile.full_name}</p>
                          <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[profile.role]}`}>
                            {roleIcons[profile.role]}
                            {profile.role === 'developer' ? 'مبرمج' : profile.role === 'designer' ? 'مصمم' : 'رائد أعمال'}
                          </span>
                        </div>
                        <Link href={`/profile/${profile.id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setProfileMenuOpen(false)}>
                          <User size={15} /> ملفي الشخصي
                        </Link>
                        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setProfileMenuOpen(false)}>
                          <TrendingUp size={15} /> لوحة التحكم
                        </Link>
                        <button
                          onClick={() => { signOut(); setProfileMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={15} /> تسجيل الخروج
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:text-teal-700 transition-colors">
                    دخول
                  </Link>
                  <Link href="/signup" className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors">
                    انضم الآن
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
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
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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
                className="block px-4 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
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
      <footer className="bg-gray-900 text-gray-400 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                  <Users size={16} className="text-white" />
                </div>
                <span className="text-white font-bold">شركاء النجاح</span>
              </div>
              <p className="text-sm leading-relaxed">منصة جزائرية تجمع المبرمجين، المصممين، ورواد الأعمال لبناء مشاريع ناجحة معاً.</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/projects" className="hover:text-teal-400 transition-colors">المشاريع</Link></li>
                <li><Link href="/talent" className="hover:text-teal-400 transition-colors">الكفاءات</Link></li>
                <li><Link href="/signup" className="hover:text-teal-400 transition-colors">انضم إلينا</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">من نحن</h4>
              <p className="text-sm leading-relaxed">نؤمن بأن الفرق المتكاملة هي سر النجاح. نساعدك على إيجاد شركائك المثاليين.</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-xs">
            <p>© 2026 شركاء النجاح - جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>

      {/* Backdrop for profile menu */}
      {profileMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
      )}
    </div>
  );
}
