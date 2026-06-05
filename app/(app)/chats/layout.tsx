'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatsApi } from '@/services/api/chats';
import { useAuthStore } from '@/stores/useAuthStore';
import Avatar from '@/components/ui/Avatar';
import { WarriorBadge } from '@/components/ui/WarriorBadge';
import { useRouter, usePathname } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { Search, Volume2, Compass, Film, MessageSquare, Bell, Star, FileText, BellOff, Inbox } from 'lucide-react';

interface ChatLayoutProps {
  children: React.ReactNode;
}

const mockFavorites = [
  { name: 'Мария Л.', isWarrior: false },
  { name: 'Галя Мурзина', isWarrior: true },
  { name: 'Сергей Д.', isWarrior: false },
  { name: 'Алексей П.', isWarrior: true },
];

export default function ChatsLayout({ children }: ChatLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'main' | 'all'>('main');

  // Fetch chats
  const { data: chats = [], isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: chatsApi.list,
  });

  // Init default chats if empty mutation
  const initChatsMutation = useMutation({
    mutationFn: async () => {
      const defaults = [
        { name: 'Инкубатор', is_group: true, member_ids: [] },
        { name: 'Реанимация.Интенсив', is_group: true, member_ids: [] },
        { name: 'Текущие материалы Работы+', is_group: true, member_ids: [] },
        { name: 'Технический', is_group: true, member_ids: [] },
        { name: 'Общение внутриКовчега', is_group: true, member_ids: [] },
      ];
      for (const chat of defaults) {
        await chatsApi.create(chat);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  // Flag to prevent infinite initialization calls
  const initTriggered = React.useRef(false);

  // Auto trigger init if loaded and empty
  React.useEffect(() => {
    if (
      !isLoading &&
      chats.length === 0 &&
      !initTriggered.current &&
      !initChatsMutation.isPending &&
      !initChatsMutation.isSuccess
    ) {
      initTriggered.current = true;
      initChatsMutation.mutate();
    }
  }, [chats, isLoading, initChatsMutation]);

  const handleChatClick = (chatId: string) => {
    router.push(ROUTES.chat(chatId));
  };

  // Mock static preview content corresponding to the design mockup for better wow-effect
  const getChatMockData = (name: string) => {
    const defaultMocks: Record<string, { preview: string; time: string; count?: number; isAmber?: boolean; hasPractice?: boolean; practiceText?: string; author?: string; isWarriorAuthor?: boolean }> = {
      'Инкубатор': {
        author: 'Мария Л.:',
        preview: 'Отчёт — 4 пункта, прошу корректировку',
        time: '11:20',
        count: 2,
        isAmber: false,
      },
      'Реанимация.Интенсив': {
        author: '◈ Галя Мурзина:',
        isWarriorAuthor: true,
        preview: 'Корректировка по пункту 2 отчёта…',
        time: '10:48',
        count: 5,
        isAmber: true,
      },
      'Текущие материалы Работы+': {
        preview: 'Новая нарезка · «Внимание как опора»',
        time: '09:30',
        count: 1,
        isAmber: false,
      },
      'Технический': {
        preview: 'Расписание практик · ссылки Zoom — в закрепе',
        time: '08:15',
        hasPractice: true,
        practiceText: 'идёт Гудение до 15:40',
      },
      'Общение внутриКовчега': {
        preview: 'Сергей Д.: Благодарю за сегодняшний Сатсанг 🙏',
        time: 'вчера',
      },
    };
    return defaultMocks[name] || { preview: 'Нет сообщений', time: '12:00' };
  };

  const isChatSelected = pathname !== ROUTES.chats;

  return (
    <div className="flex h-full overflow-hidden gap-4 items-stretch justify-start">
      {/* Left Column (w-[530px]): Either Chats list (if not selected) OR Active chat (if selected) */}
      <div className="flex-shrink-0 h-full" style={{ width: '530px' }}>
        {isChatSelected ? (
          children
        ) : (
          /* Chats list block */
          <div className="border border-line bg-bg rounded-xl shadow-sm flex flex-col select-none overflow-hidden h-full">
            {/* Search */}
            <div className="p-4 border-b border-line">
              <div className="relative">
                <Search className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Поиск..."
                  className="w-full bg-bg-warm border border-line rounded-xl pl-9 pr-4 py-2 text-xs text-ink outline-none transition-all placeholder:text-ink-faint focus:border-amber"
                />
              </div>
            </div>

            {/* Tabs for Основные vs Все */}
            <div className="px-4 py-3 flex gap-2 border-b border-line">
              <button
                onClick={() => setActiveTab('main')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-body transition-all cursor-pointer ${
                  activeTab === 'main'
                    ? 'bg-ink text-white'
                    : 'text-ink-soft hover:bg-line-soft'
                }`}
              >
                Основные
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-body transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-ink text-white'
                    : 'text-ink-soft hover:bg-line-soft'
                }`}
              >
                Все
              </button>
            </div>

            {/* Chats list stream */}
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-6 h-6 border-2 border-amber border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                chats.map((chat) => {
                  const mock = getChatMockData(chat.name || '');
                  const active = pathname === ROUTES.chat(chat.id);
                  const isWarrior = chat.name === 'Инкубатор' || chat.name === 'Реанимация.Интенсив';

                  return (
                    <div
                      key={chat.id}
                      onClick={() => handleChatClick(chat.id)}
                      className={`flex gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-150 ${
                        active ? 'bg-line-soft' : 'hover:bg-line-soft/40'
                      }`}
                    >
                      <Avatar
                        name={chat.name || 'Чат'}
                        isWarrior={isWarrior}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className={`font-display font-semibold text-xs leading-tight truncate ${chat.name === 'Технический' || chat.name === 'Общение внутриКовчега' ? 'text-ink-soft' : 'text-ink'}`}>
                            {chat.name}
                          </span>
                          <span className="font-mono text-[9px] text-ink-faint flex-shrink-0">{mock.time}</span>
                        </div>

                        <p className={`text-[11px] leading-normal truncate mt-1 ${mock.count ? 'text-ink font-medium' : 'text-ink-soft'}`}>
                          {mock.author && (
                            <span className={mock.isWarriorAuthor ? 'text-amber font-semibold' : 'text-ink font-semibold'}>
                              {mock.author}{' '}
                            </span>
                          )}
                          {mock.preview}
                        </p>

                        {mock.hasPractice && (
                          <div className="flex items-center gap-1.5 mt-2 bg-amber-wash/65 rounded-lg px-2 py-1 select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-bright animate-pulse"></span>
                            <span className="font-mono text-[9px] text-amber font-semibold">{mock.practiceText}</span>
                          </div>
                        )}

                        {mock.count && (
                          <div className="flex justify-end mt-1">
                            <span className={`min-w-[18px] h-[18px] px-1 rounded-full font-mono text-[10px] text-white flex items-center justify-center ${mock.isAmber ? 'bg-amber' : 'bg-ink'}`}>
                              {mock.count}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Column (w-[246px]): Filters & Favorites (Always visible) */}
      <div className="flex-shrink-0 h-fit bg-bg border border-line rounded-xl shadow-sm p-4 flex flex-col gap-5" style={{ width: '246px' }}>
        {/* Section 1: Filters list */}
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[9px] text-ink-faint uppercase tracking-wider px-2 mb-1.5 block font-semibold">
            Фильтры
          </span>
          <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-line-soft text-ink font-semibold text-xs text-left cursor-pointer">
            <span className="flex items-center gap-2">
              <Inbox className="w-3.5 h-3.5 text-amber" />
              <span>Все сообщения</span>
            </span>
            <span className="font-mono text-[9px] bg-amber text-white px-1.5 py-0.5 rounded-full">8</span>
          </button>
          <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-ink-soft hover:bg-line-soft/60 hover:text-ink text-xs text-left cursor-pointer">
            <span className="flex items-center gap-2">
              <BellOff className="w-3.5 h-3.5 text-ink-faint" />
              <span>Непрочитанные</span>
            </span>
          </button>
          <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-ink-soft hover:bg-line-soft/60 hover:text-ink text-xs text-left cursor-pointer">
            <span className="flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-ink-faint" />
              <span>Важные</span>
            </span>
          </button>
          <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-ink-soft hover:bg-line-soft/60 hover:text-ink text-xs text-left cursor-pointer">
            <span className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-ink-faint" />
              <span>Летописи (отчёты)</span>
            </span>
          </button>
        </div>

        <hr className="border-line-soft" />

        {/* Section 2: Favorites */}
        <div className="flex flex-col gap-2.5">
          <span className="font-mono text-[9px] text-ink-faint uppercase tracking-wider px-2 block font-semibold">
            Избранные
          </span>
          <div className="grid grid-cols-2 gap-2">
            {mockFavorites.map((fav) => (
              <div
                key={fav.name}
                className="flex flex-col items-center text-center p-2 rounded-xl hover:bg-line-soft/40 cursor-pointer transition-all border border-transparent hover:border-line-soft"
              >
                <Avatar name={fav.name} isWarrior={fav.isWarrior} size="sm" />
                <span className="font-display font-medium text-[10px] text-ink mt-1.5 truncate w-full px-1">
                  {fav.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
