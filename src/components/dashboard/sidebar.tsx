'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Plus,
  AlertTriangle,
  Settings,
  CreditCard,
  Activity,
  Server,
  Shield,
  Zap,
  Bell,
  FileText,
} from 'lucide-react';

interface SidebarLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const mainLinks: SidebarLink[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'My APIs', href: '#', icon: <Server size={18} /> },
  { label: 'Add API', href: '/dashboard/apis/new', icon: <Plus size={18} /> },
  { label: 'Alerts', href: '#', icon: <AlertTriangle size={18} /> },
  { label: 'Incidents', href: '#', icon: <Zap size={18} /> },
];

const toolLinks: SidebarLink[] = [
  { label: 'Load Testing', href: '/dashboard/load-testing', icon: <Activity size={18} /> },
  { label: 'Certify', href: '/certify', icon: <Shield size={18} /> },
];

const bottomLinks: SidebarLink[] = [
  { label: 'Settings', href: '#', icon: <Settings size={18} /> },
  { label: 'Billing', href: '/pricing', icon: <CreditCard size={18} /> },
];

/* Mobile bottom tab bar links (subset) */
const mobileTabLinks: SidebarLink[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'APIs', href: '#', icon: <Server size={20} /> },
  { label: 'Alerts', href: '#', icon: <Bell size={20} /> },
  { label: 'Reports', href: '#', icon: <FileText size={20} /> },
  { label: 'Settings', href: '#', icon: <Settings size={20} /> },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '#') return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  /* ===== DESKTOP SIDEBAR ===== */
  const DesktopSidebar = (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40 border-r"
      style={{
        width: 240,
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="dot dot-up" style={{ width: 10, height: 10 }} />
        <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          PulseAPI
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="mb-6">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-2"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Main
          </p>
          {mainLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all mb-0.5 ${
                isActive(link.href)
                  ? 'text-white'
                  : 'hover:bg-white/5'
              }`}
              style={
                isActive(link.href)
                  ? { background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }
                  : { color: 'var(--text-secondary)' }
              }
            >
              <span className={isActive(link.href) ? 'text-[#3B82F6]' : ''}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mb-6">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-2"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Tools
          </p>
          {toolLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all mb-0.5 ${
                isActive(link.href)
                  ? 'text-white'
                  : 'hover:bg-white/5'
              }`}
              style={
                isActive(link.href)
                  ? { background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }
                  : { color: 'var(--text-secondary)' }
              }
            >
              <span className={isActive(link.href) ? 'text-[#3B82F6]' : ''}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom links */}
      <div className="border-t px-3 py-3 space-y-0.5" style={{ borderColor: 'var(--border)' }}>
        {bottomLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive(link.href) ? 'text-white' : 'hover:bg-white/5'
            }`}
            style={
              isActive(link.href)
                ? { background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }
                : { color: 'var(--text-secondary)' }
            }
          >
            <span className={isActive(link.href) ? 'text-[#3B82F6]' : ''}>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </div>
    </aside>
  );

  /* ===== MOBILE BOTTOM TAB BAR ===== */
  const MobileTabBar = (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t flex items-center justify-around"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {mobileTabLinks.map((link) => {
        const active = isActive(link.href) && link.href !== '#';
        return (
          <Link
            key={link.label}
            href={link.href}
            className={`flex flex-col items-center gap-1 py-2.5 px-3 min-w-[56px] transition-colors ${
              active ? 'text-[#3B82F6]' : ''
            }`}
            style={{ color: active ? '#3B82F6' : 'var(--text-tertiary)' }}
          >
            {link.icon}
            <span className="text-[10px] font-medium">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {DesktopSidebar}
      {MobileTabBar}
    </>
  );
}
