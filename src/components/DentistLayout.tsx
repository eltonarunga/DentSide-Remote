import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Wallet,
  GraduationCap,
  ShieldCheck,
  Bell,
  LogOut,
  Stethoscope
} from 'lucide-react';

interface DentistLayoutProps {
  children: React.ReactNode;
}

export default function DentistLayout({ children }: DentistLayoutProps) {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Gigs', path: '/opportunities', icon: Briefcase },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
    { name: 'Qualifications', path: '/profile-builder', icon: GraduationCap },
    { name: 'Verify License', path: '/verification', icon: ShieldCheck },
  ];

  return (
    <div className="text-on-surface bg-background min-h-screen font-body flex flex-col">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#f7f9fb]/80 backdrop-blur-xl shadow-sm h-16 border-b border-outline-variant/10">
        <div className="max-w-[1600px] mx-auto px-6 h-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary/5 p-1.5 rounded-lg flex items-center justify-center text-primary">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-[#0077B6] tracking-tighter font-headline">DentSide</span>
          </div>

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 font-headline font-semibold text-sm px-3.5 py-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#0077B6] text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Notification & User Profile actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-surface-container transition-colors text-slate-500 hover:text-[#0077B6] relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <div className="w-9 h-9 rounded-full overflow-hidden border border-primary/20 bg-slate-100 shadow-sm shrink-0">
              <img
                alt="User avatar"
                className="w-full h-full object-cover"
                src={profile?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
              />
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-rose-50 text-error hover:text-rose-700 transition-all ml-1 hidden sm:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main workspace container using standardized shell, padding & margin gaps */}
      <main className="flex-1 pt-24 pb-32 md:pb-16 page-shell page-padding">
        {children}
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white/90 backdrop-blur-xl border-t border-slate-100 shadow-[0px_-12px_32px_rgba(25,28,30,0.08)] flex justify-around items-center px-4 h-20 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'bg-[#0077B6]/10 text-[#0077B6] scale-105 font-bold'
                  : 'text-slate-400 hover:text-[#0077B6]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-sans text-[10px] font-semibold tracking-wide uppercase mt-1">
                {item.name === 'Verify License' ? 'Verify' : item.name.split(' ')[0]}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
