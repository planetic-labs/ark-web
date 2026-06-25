'use client';

import React from 'react';
import { useSession } from '@/hooks/useSession';
import Avatar from '@/components/ui/Avatar';
import { WarriorBadge } from '@/components/ui/WarriorBadge';
import { Mail, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useSession();

  if (!user) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isWarrior = user.role === 'WARRIOR' || user.role === 'MASTER' || user.role === 'ADMIN';

  return (
    <div className="flex flex-col gap-6 p-1 max-w-[800px] select-none">
      {/* Header Info Banner */}
      <div className="bg-bg border border-line rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <Avatar name={user.full_name || user.email} avatarUrl={user.avatar_url} isWarrior={isWarrior} size="lg" />
          {isWarrior && (
            <div className="absolute -bottom-1 -right-1">
              <WarriorBadge />
            </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left min-w-0">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h1 className="font-display font-bold text-xl text-ink leading-tight truncate">
              {user.full_name || 'Имя не указано'}
            </h1>
            {isWarrior && (
              <span className="bg-amber-wash border border-amber/20 text-amber text-[10px] font-bold px-2 py-0.5 rounded-full inline-block w-fit self-center">
                Ковчег Воин
              </span>
            )}
          </div>
          
          <p className="font-mono text-xs text-ink-soft mt-1.5 flex items-center justify-center md:justify-start gap-1.5">
            <Mail className="w-3.5 h-3.5 text-ink-faint" />
            <span>{user.email}</span>
          </p>

          <p className="font-mono text-xs text-ink-soft mt-1 flex items-center justify-center md:justify-start gap-1.5">
            <Shield className="w-3.5 h-3.5 text-ink-faint" />
            <span>Роль: <strong className="text-ink font-semibold">{user.role}</strong></span>
          </p>
        </div>
      </div>
    </div>
  );
}
