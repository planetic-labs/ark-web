'use client';

import React from 'react';
import { useSession } from '@/hooks/useSession';
import Avatar from '@/components/ui/Avatar';
import { WarriorBadge } from '@/components/ui/WarriorBadge';
import { User, Mail, Shield, Calendar, Award, CheckCircle2 } from 'lucide-react';

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

  // Mock statistics for a high-quality preview
  const mockStats = [
    { title: 'Практика Гудения', value: '240 мин / неделя', icon: CheckCircle2, desc: 'Выполнено на 100%' },
    { title: 'Посещено Сатсангов', value: '12 встреч', icon: Award, desc: 'Активное присутствие' },
    { title: 'Летописи и отчеты', value: '8 отправлено', icon: Shield, desc: 'Корректировки получены' },
  ];

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

      {/* Grid statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-bg border border-line rounded-2xl p-4 shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] text-ink-faint uppercase font-semibold">
                  {stat.title}
                </span>
                <Icon className="w-4 h-4 text-amber" />
              </div>
              <div>
                <span className="font-display font-bold text-lg text-ink">
                  {stat.value}
                </span>
                <p className="text-[10px] text-ink-soft mt-0.5">
                  {stat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bio / Placeholder fields block */}
      <div className="bg-bg border border-line rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <h3 className="font-display font-semibold text-sm text-ink border-b border-line pb-2.5">
          Детали профиля
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-ink-faint uppercase font-semibold font-mono">
              Дата вступления в Ковчег
            </span>
            <span className="text-xs text-ink flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-ink-soft" />
              <span>12 февраля 2026</span>
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-ink-faint uppercase font-semibold font-mono">
              Текущий статус
            </span>
            <span className="text-xs text-ink flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="font-semibold text-green-600">В процессе практики</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
