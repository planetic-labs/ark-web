'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/services/api/users';
import { chatsApi } from '@/services/api/chats';
import { useSession } from '@/hooks/useSession';
import Avatar from '@/components/ui/Avatar';
import { WarriorBadge } from '@/components/ui/WarriorBadge';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { Search, MessageSquare, GraduationCap, Users } from 'lucide-react';

export default function StudentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentUser } = useSession();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  });

  // Start chat mutation
  const startChatMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      return chatsApi.create({
        is_group: false,
        member_ids: [targetUserId],
      });
    },
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      router.push(ROUTES.chat(newChat.id));
    },
  });

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: 'Администратор',
      MASTER: 'Мастер',
      WARRIOR: 'Воин',
      STUDENT: 'Ученик',
    };
    return labels[role] || role;
  };

  const filteredUsers = users.filter((u) => {
    const nameMatch = (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch;
  });

  return (
    <div className="flex flex-col gap-5 max-w-[800px] select-none p-1 mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg border border-line rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="font-display font-bold text-xl text-ink flex items-center gap-2">
            <GraduationCap className="w-5.5 h-5.5 text-amber" />
            <span>Ученики</span>
          </h1>
          <p className="text-[11px] text-ink-soft mt-1">
            Список участников закрытого сообщества. Вы можете начать личное общение с любым из них.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск по имени или почте..."
          className="w-full bg-bg border border-line rounded-2xl pl-10 pr-4 py-2.5 text-xs text-ink outline-none transition-all placeholder:text-ink-faint focus:border-amber focus:shadow-sm"
        />
      </div>

      {/* Users list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-bg border border-line rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 text-ink-faint mx-auto mb-3" />
          <h3 className="font-display font-semibold text-base text-ink">Ученики не найдены</h3>
          <p className="font-body text-xs text-ink-soft mt-1">Попробуйте изменить поисковый запрос</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredUsers.map((u) => {
            const isWarrior = u.role === 'WARRIOR' || u.role === 'MASTER' || u.role === 'ADMIN';
            const isSelf = currentUser?.id === u.id;
            const isPending = startChatMutation.isPending && startChatMutation.variables === u.id;

            return (
              <div
                key={u.id}
                className="bg-bg border border-line hover:border-amber/30 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 transition-all duration-200"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Avatar
                    name={u.full_name || u.email}
                    avatarUrl={u.avatar_url}
                    isWarrior={isWarrior}
                    size="md"
                  />
                  <div className="leading-tight min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-ink font-display text-sm truncate">
                        {u.full_name || 'Без имени'}
                      </span>
                      {isWarrior && <WarriorBadge />}
                      {isSelf && (
                        <span className="bg-line-soft text-ink-soft text-[9px] font-semibold px-1.5 py-0.5 rounded-md">
                          Вы
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[9px] text-ink-faint block mt-0.5 truncate">
                      {u.email}
                    </span>
                    <span className="text-[10px] text-amber font-semibold mt-1 block">
                      {getRoleLabel(u.role)}
                    </span>
                  </div>
                </div>

                {/* Start Conversation Button */}
                {!isSelf && (
                  <button
                    disabled={startChatMutation.isPending}
                    onClick={() => startChatMutation.mutate(u.id)}
                    title="Начать персональное общение"
                    className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all cursor-pointer ${
                      isPending
                        ? 'bg-amber-wash border-amber/20 text-amber'
                        : 'bg-bg hover:bg-amber-wash hover:border-amber/40 border-line text-ink-soft hover:text-amber hover:shadow-sm active:scale-95'
                    }`}
                  >
                    {isPending ? (
                      <div className="w-3.5 h-3.5 border-2 border-amber border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <MessageSquare className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
