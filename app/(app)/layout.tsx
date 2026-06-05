'use client';

import React from 'react';
import { useSession } from '@/hooks/useSession';
import { useRouter, usePathname } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import Avatar from '@/components/ui/Avatar';
import { WarriorBadge } from '@/components/ui/WarriorBadge';
import {
  MessageSquare,
  Compass,
  Play,
  FileText,
  History,
  Users,
  Shield,
  Bot,
  Key,
  LogOut,
  Search,
  User,
  GraduationCap,
} from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useSession();
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // If loading session, show premium spinner page
  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-display text-ink-soft text-sm italic select-none">
          Подключение к Ковчегу...
        </p>
      </div>
    );
  }

  // If not authenticated, let middleware redirect
  if (!isAuthenticated || !user) {
    return null;
  }

  const isAdmin = user.role === 'ADMIN';
  const isWarrior = user.role === 'WARRIOR' || user.role === 'MASTER' || user.role === 'ADMIN';

  // Navigation Items
  const navItems = [
    { label: 'Профиль', href: ROUTES.profile, icon: User },
    { label: 'Мессенджер', href: ROUTES.chats, icon: MessageSquare },
    { label: 'Навигатор', href: ROUTES.navigator, icon: Compass },
    { label: 'Видео', href: ROUTES.video, icon: Play },
    { label: 'Материалы', href: ROUTES.materials, icon: FileText },
    { label: 'Летописи', href: ROUTES.chronicles, icon: History },
    { label: 'Ученики', href: ROUTES.students, icon: GraduationCap },
  ];

  // Admin Items
  const adminItems = [
    { label: 'Участники', href: ROUTES.admin.users, icon: Users },
    { label: 'Роли и Права', href: ROUTES.admin.roles, icon: Shield },
    { label: 'Боты', href: ROUTES.admin.bots, icon: Bot },
    { label: 'Сервисы', href: ROUTES.admin.services, icon: Key },
  ];

  const handleNavClick = (href: string) => {
    router.push(href);
  };

  const isActive = (href: string) => {
    if (href === ROUTES.chats) {
      return pathname.startsWith('/chats');
    }
    if (href === ROUTES.admin.users) {
      return pathname.startsWith('/admin/users');
    }
    return pathname === href;
  };

  return (
    <div className="flex flex-col h-screen bg-canvas overflow-hidden font-body text-ink">
      {/* Top Header (VK style, in Ark branding) */}
      <header className="h-12 w-full bg-bg border-b border-line flex items-center select-none flex-shrink-0 z-40">
        <div className="max-w-5xl w-full mx-auto px-4 flex items-center justify-between">
          {/* Logo and Search bar */}
          <div className="flex items-center gap-6 flex-1 max-w-[500px]">
            {/* Logo */}
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => router.push(ROUTES.chats)}
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D0C6B0] to-[#AFA690] text-[#5F5848] font-display font-bold flex items-center justify-center text-sm shadow-sm select-none">
                К
              </div>
              <h2 className="font-display font-bold text-sm text-ink tracking-tight select-none">
                Ковчег
              </h2>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-[240px] hidden md:block">
              <Search className="w-3.5 h-3.5 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск"
                className="w-full bg-line-soft border border-line rounded-lg pl-8.5 pr-3 py-1 text-[11px] text-ink outline-none transition-all placeholder:text-ink-faint focus:border-amber focus:bg-bg"
              />
            </div>
          </div>

          {/* User Profile Info and Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <span className="font-display font-bold text-xs text-ink truncate max-w-[120px] hidden sm:inline-block">
                {user.full_name || 'Пользователь'}
              </span>
              {isWarrior && <WarriorBadge />}
              <Avatar
                name={user.full_name || user.email}
                avatarUrl={user.avatar_url}
                isWarrior={isWarrior}
                isMe={true}
                size="sm"
              />
            </div>
            <div className="w-px h-5 bg-line hidden sm:block"></div>
            <button
              onClick={() => logout()}
              title="Выйти из системы"
              className="p-1.5 rounded-lg hover:bg-line-soft text-ink-soft hover:text-amber transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-5xl w-full mx-auto px-4 py-4 flex gap-5 flex-1 overflow-hidden items-stretch">
        {/* Left Sidebar Menu */}
        <aside className="w-[180px] flex-shrink-0 hidden md:flex flex-col gap-0.5 select-none overflow-y-auto pr-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg font-body text-xs font-medium text-left transition-all duration-150 cursor-pointer ${
                  active
                    ? 'bg-line-soft text-ink font-semibold'
                    : 'text-ink-soft hover:bg-line-soft/60 hover:text-ink'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-amber' : 'text-ink-faint'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Admin Section */}
          {isAdmin && (
            <div className="mt-4 flex flex-col gap-0.5 border-t border-line-soft pt-3">
              <span className="font-mono text-[9px] text-amber tracking-wider uppercase px-2.5 mb-1.5 block font-semibold">
                Админ
              </span>
              {adminItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg font-body text-xs font-medium text-left transition-all duration-150 cursor-pointer ${
                      active
                        ? 'bg-amber-wash/80 text-amber font-semibold'
                        : 'text-ink-soft hover:bg-line-soft/60 hover:text-ink'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? 'text-amber' : 'text-ink-faint'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Release Version Footer */}
          <div className="mt-auto pt-3 border-t border-line-soft px-2.5">
            <span className="font-mono text-[9px] text-ink-faint select-none">
              Релиз: <strong className="text-ink-soft font-semibold">{process.env.NEXT_PUBLIC_APP_VERSION || 'v0.1.0'}</strong>
            </span>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
}
