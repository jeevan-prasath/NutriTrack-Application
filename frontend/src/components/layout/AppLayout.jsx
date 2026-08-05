import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Search, Scale, BarChart3, Sun, Moon, User } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home', end: true },
  { to: '/diary', icon: BookOpen, label: 'Diary' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/weight', icon: Scale, label: 'Weight' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

export default function AppLayout() {
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('nt-theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') document.documentElement.classList.add('light');
    else document.documentElement.classList.remove('light');
    localStorage.setItem('nt-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--color-surface)' }}>
      {/* Top header */}
      <header
        className="sticky top-0 z-40 w-full safe-top"
        style={{ 
          background: theme === 'light' ? 'rgba(243,246,244,0.9)' : 'rgba(13,20,16,0.9)', 
          backdropFilter: 'blur(20px)', 
          borderBottom: '1px solid var(--white-06)' 
        }}
      >
        <div style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'var(--gradient-brand)' }}>
              <span className="text-white text-sm font-bold">N</span>
            </div>
            <span className="font-bold text-lg tracking-tight gradient-text">NutriTrack</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button onClick={toggleTheme}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                background: 'var(--color-surface-3)', border: '1px solid var(--white-08)',
                color: 'var(--color-text-muted)'
              }}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            
            <NavLink to="/profile">
              {({ isActive }) => (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md"
                  style={{
                    background: isActive ? 'var(--gradient-brand)' : 'var(--color-surface-3)',
                    border: isActive ? 'none' : '1px solid var(--white-08)',
                  }}
                >
                  <User size={16} color={isActive ? '#fff' : 'var(--color-text-muted)'} />
                </div>
              )}
            </NavLink>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-28">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 px-3 safe-bottom"
        style={{ 
          background: theme === 'light' ? 'rgba(243,246,244,0.95)' : 'rgba(13,20,16,0.95)', 
          backdropFilter: 'blur(24px)', 
          borderTop: '1px solid var(--white-06)' 
        }}
      >
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}>
              {({ isActive }) => (
                <motion.div
                  className="nav-item"
                  style={{ color: isActive ? 'var(--color-brand-light)' : 'var(--color-text-muted)', background: isActive ? 'rgba(22,163,74,0.12)' : 'transparent' }}
                  whileTap={{ scale: 0.92 }}
                >
                  <Icon size={20} />
                  <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 400 }}>{label}</span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
