'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/services/api/users';
import { User } from '@/types/shared';
import Avatar from '@/components/ui/Avatar';
import { WarriorBadge } from '@/components/ui/WarriorBadge';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { Plus, Search, X, Users, ShieldAlert, GraduationCap, Filter } from 'lucide-react';

export default function UsersAdminPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for creating a new user
  const [newEmail, setNewEmail] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newRole, setNewRole] = useState('STUDENT');
  const [newIsApproved, setNewIsApproved] = useState(true);
  const [formError, setFormError] = useState('');

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      // Reset form
      setNewEmail('');
      setNewFirstName('');
      setNewLastName('');
      setNewRole('STUDENT');
      setNewIsApproved(true);
      setFormError('');
    },
    onError: (err: Error) => {
      setFormError(err.message || 'Ошибка создания участника');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!newEmail) {
      setFormError('Укажите email адрес');
      return;
    }
    createUserMutation.mutate({
      email: newEmail,
      first_name: newFirstName,
      last_name: newLastName,
      role: newRole,
      is_active: true,
      is_approved: newIsApproved,
    });
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const nameMatch = (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const status = u.is_active ? (u.is_approved ? 'active' : 'created') : 'disabled';
    const statusMatch = statusFilter === 'all' || status === statusFilter;
    const roleMatch = roleFilter === 'all' || u.role === roleFilter;

    return nameMatch && statusMatch && roleMatch;
  });

  const getStatusBadge = (user: User) => {
    const status = user.is_active ? (user.is_approved ? 'active' : 'created') : 'disabled';
    
    const styles = {
      active: 'bg-green-50 text-green-700 border-green-200',
      created: 'bg-blue-50 text-blue-700 border-blue-200',
      disabled: 'bg-red-50 text-red-700 border-red-200',
    };

    const label = {
      active: 'Активен',
      created: 'Создан',
      disabled: 'Отключён',
    };

    return (
      <span className={`px-2 py-0.5 text-[9px] font-mono font-medium rounded-full border ${styles[status]}`}>
        {label[status]}
      </span>
    );
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: 'Администратор',
      MASTER: 'Мастер',
      WARRIOR: 'Воин',
      STUDENT: 'Ученик',
    };
    return labels[role] || role;
  };

  // Calculations for total students and total users
  const totalStudentsCount = users.filter((u) => u.role === 'STUDENT').length;
  const totalUsersCount = users.length;

  return (
    <div className="flex h-full overflow-hidden gap-4 items-stretch justify-start">
      {/* Left Column (w-[530px]) - Users Table block */}
      <div className="flex-shrink-0 h-full" style={{ width: '530px' }}>
        <div className="border border-line bg-bg rounded-xl shadow-sm flex flex-col select-none overflow-hidden h-full">
          {/* Search bar inside left panel */}
          <div className="p-4 border-b border-line flex-shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск по участникам..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-bg-warm border border-line rounded-xl pl-9 pr-4 py-2 text-xs text-ink outline-none transition-all placeholder:text-ink-faint focus:border-amber"
              />
            </div>
          </div>

          {/* Users Table / Stream container */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-amber border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-20 text-center text-ink-soft">
                <Users className="w-10 h-10 text-ink-faint mx-auto mb-3" />
                <h3 className="font-display font-semibold text-xs text-ink">Участники не найдены</h3>
                <p className="font-body text-[10px] text-ink-soft mt-1">Попробуйте изменить поисковый запрос</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-line bg-bg-warm/50 font-mono text-[9px] text-ink-soft uppercase tracking-wider select-none sticky top-0 bg-bg z-10">
                    <th className="py-3 px-4 font-semibold">Участник</th>
                    <th className="py-3 px-2 font-semibold">Роль</th>
                    <th className="py-3 px-4 font-semibold text-right">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft font-body text-xs">
                  {filteredUsers.map((u) => {
                    const isWarrior = u.role === 'WARRIOR' || u.role === 'MASTER' || u.role === 'ADMIN';
                    return (
                      <tr
                        key={u.id}
                        onClick={() => router.push(ROUTES.admin.user(u.id))}
                        className="hover:bg-line-soft/30 cursor-pointer transition-all duration-150"
                      >
                        <td className="py-3 px-4 flex items-center gap-2.5 min-w-0">
                          <Avatar
                            name={u.full_name || u.email}
                            avatarUrl={u.avatar_url}
                            isWarrior={isWarrior}
                            size="sm"
                          />
                          <div className="leading-tight min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-ink font-display text-[12px] truncate">
                                {u.full_name || 'Без имени'}
                              </span>
                              {isWarrior && <WarriorBadge />}
                            </div>
                            <span className="font-mono text-[9px] text-ink-faint truncate block max-w-[150px]">
                              {u.email}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 font-medium text-ink-soft text-[11px]">
                          {getRoleLabel(u.role)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {getStatusBadge(u)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Right Column (w-[246px]) - Filters, counters, and create action */}
      <div className="flex-shrink-0 h-fit bg-bg border border-line rounded-xl shadow-sm p-4 flex flex-col gap-5" style={{ width: '246px' }}>
        {/* Create User Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-amber hover:bg-amber-bright text-white font-body font-semibold text-xs rounded-xl py-2.5 shadow-[0_4px_12px_rgba(185,119,12,0.15)] transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Создать участника</span>
        </button>

        <hr className="border-line-soft" />

        {/* Statistics section */}
        <div className="flex flex-col gap-2.5">
          <span className="font-mono text-[9px] text-ink-faint uppercase tracking-wider px-1 block font-semibold">
            Статистика
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-bg-warm border border-line rounded-xl p-2.5 flex flex-col">
              <span className="font-mono text-[8px] text-ink-soft uppercase leading-none mb-1">
                Ученики
              </span>
              <span className="font-display font-bold text-lg text-amber leading-none">
                {totalStudentsCount}
              </span>
            </div>
            <div className="bg-bg-warm border border-line rounded-xl p-2.5 flex flex-col">
              <span className="font-mono text-[8px] text-ink-soft uppercase leading-none mb-1">
                Всего
              </span>
              <span className="font-display font-bold text-lg text-ink leading-none">
                {totalUsersCount}
              </span>
            </div>
          </div>
        </div>

        <hr className="border-line-soft" />

        {/* Filters section */}
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[9px] text-ink-faint uppercase tracking-wider px-1 block font-semibold">
            Фильтры
          </span>
          
          {/* Status filter select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-ink-soft select-none">
              Статус участника
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-bg border border-line rounded-xl px-3 py-2 text-xs text-ink outline-none cursor-pointer focus:border-amber w-full"
            >
              <option value="all">Все статусы</option>
              <option value="active">Активен</option>
              <option value="created">Создан</option>
              <option value="disabled">Отключён</option>
            </select>
          </div>

          {/* Role filter select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-ink-soft select-none">
              Роль
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-bg border border-line rounded-xl px-3 py-2 text-xs text-ink outline-none cursor-pointer focus:border-amber w-full"
            >
              <option value="all">Все роли</option>
              <option value="ADMIN">Администратор</option>
              <option value="MASTER">Мастер</option>
              <option value="WARRIOR">Воин</option>
              <option value="STUDENT">Ученик</option>
            </select>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-[460px] bg-bg border border-line rounded-[28px] p-6 shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-ink">
                  Создать Участника
                </h3>
                <p className="font-mono text-[9px] text-ink-soft tracking-wider uppercase mt-0.5">
                  Приглашение нового пользователя в Ковчег
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-line-soft text-ink-soft hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-ink-soft select-none">
                  Email адрес (для входа по коду)
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-bg-warm border border-line rounded-xl px-3 py-2.5 text-xs text-ink outline-none focus:border-amber"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-ink-soft select-none">
                    Имя
                  </label>
                  <input
                    type="text"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="Иван"
                    className="w-full bg-bg-warm border border-line rounded-xl px-3 py-2.5 text-xs text-ink outline-none focus:border-amber"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-ink-soft select-none">
                    Фамилия
                  </label>
                  <input
                    type="text"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="Петров"
                    className="w-full bg-bg-warm border border-line rounded-xl px-3 py-2.5 text-xs text-ink outline-none focus:border-amber"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-ink-soft select-none">
                  Начальная Роль
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-bg-warm border border-line rounded-xl px-3 py-2.5 text-xs text-ink outline-none cursor-pointer focus:border-amber"
                >
                  <option value="STUDENT">Ученик (Student)</option>
                  <option value="WARRIOR">Воин (Warrior)</option>
                  <option value="MASTER">Мастер (Master)</option>
                  <option value="ADMIN">Администратор (Admin)</option>
                </select>
              </div>

              <div className="flex items-center gap-2.5 py-1">
                <input
                  id="is_approved"
                  type="checkbox"
                  checked={newIsApproved}
                  onChange={(e) => setNewIsApproved(e.target.checked)}
                  className="w-4 h-4 rounded text-amber border-line focus:ring-amber cursor-pointer"
                />
                <label htmlFor="is_approved" className="text-xs text-ink font-medium select-none cursor-pointer">
                  Автоматически подтвердить доступ (Одобрен)
                </label>
              </div>

              {formError && (
                <div className="text-[11px] text-amber font-medium bg-amber-wash rounded-xl px-3 py-2">
                  {formError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-line pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-transparent hover:bg-line-soft text-ink-soft font-body font-medium text-xs rounded-xl px-4 py-2.5 transition-all cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  className="bg-amber hover:bg-amber-bright text-white font-body font-semibold text-xs rounded-xl px-5 py-2.5 shadow-[0_4px_12px_rgba(185,119,12,0.15)] transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {createUserMutation.isPending ? 'Создание...' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
