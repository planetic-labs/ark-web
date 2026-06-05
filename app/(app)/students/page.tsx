'use client';

import React, { useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import { Search, GraduationCap, Award, FileText, CheckCircle2, ChevronRight, Filter } from 'lucide-react';

interface MockStudent {
  id: string;
  name: string;
  isWarrior: boolean;
  email: string;
  status: 'active' | 'need_review' | 'no_reports';
  lastReportDate: string;
  practiceHours: string;
  lastPracticeName: string;
}

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'need_review' | 'active'>('all');

  const mockStudents: MockStudent[] = [
    {
      id: '1',
      name: 'Елена Сорокина',
      isWarrior: false,
      email: 'sorokina.elena@mail.ru',
      status: 'need_review',
      lastReportDate: 'Сегодня в 09:12',
      practiceHours: '12 часов',
      lastPracticeName: 'Гудение (20м)',
    },
    {
      id: '2',
      name: 'Сергей Дьяконов',
      isWarrior: false,
      email: 'sergey.diakonov@gmail.com',
      status: 'active',
      lastReportDate: 'Вчера в 18:45',
      practiceHours: '28 часов',
      lastPracticeName: 'Присутствие в теле',
    },
    {
      id: '3',
      name: 'Мария Ланская',
      isWarrior: false,
      email: 'maria.lanskaya@yandex.ru',
      status: 'active',
      lastReportDate: '14 мая, 11:20',
      practiceHours: '42 часа',
      lastPracticeName: 'Тишина ума',
    },
    {
      id: '4',
      name: 'Галя Мурзина',
      isWarrior: true,
      email: 'galya.murz@gmail.com',
      status: 'active',
      lastReportDate: '14 мая, 10:48',
      practiceHours: '84 часа',
      lastPracticeName: 'Гудение Интенсив',
    },
    {
      id: '5',
      name: 'Алексей Прусиков',
      isWarrior: true,
      email: 'alexey.prusikov@outlook.com',
      status: 'need_review',
      lastReportDate: '13 мая, 15:30',
      practiceHours: '96 часов',
      lastPracticeName: 'Внимание как опора',
    },
  ];

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    return matchesSearch && student.status === selectedFilter;
  });

  return (
    <div className="flex flex-col gap-5 max-w-[900px] select-none p-1">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg border border-line rounded-2xl p-4 shadow-sm">
        <div>
          <h1 className="font-display font-bold text-lg text-ink flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber" />
            <span>Ученики закрытого сообщества</span>
          </h1>
          <p className="text-[11px] text-ink-soft mt-1">
            Мониторинг отчетов, практики учеников и назначение корректировок воинами.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-ink text-white shadow-sm'
                : 'bg-line-soft text-ink-soft hover:bg-line-soft/80'
            }`}
          >
            Все ({mockStudents.length})
          </button>
          <button
            onClick={() => setSelectedFilter('need_review')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
              selectedFilter === 'need_review'
                ? 'bg-amber text-white shadow-sm'
                : 'bg-line-soft text-ink-soft hover:bg-line-soft/80'
            }`}
          >
            Нужна корректировка
          </button>
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

      {/* Students List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full py-16 text-center text-ink-soft bg-bg border border-line rounded-2xl">
            Никто не найден по вашему запросу.
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-bg border border-line hover:border-amber/30 rounded-2xl p-4 shadow-sm flex items-start gap-4 transition-all duration-200 group cursor-pointer hover:shadow-md"
            >
              <Avatar name={student.name} isWarrior={student.isWarrior} size="md" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 justify-between">
                  <h3 className="font-display font-semibold text-xs text-ink leading-tight truncate group-hover:text-amber transition-colors">
                    {student.name}
                  </h3>
                  {student.status === 'need_review' && (
                    <span className="bg-amber-wash border border-amber/15 text-amber text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 animate-pulse">
                      Требует корректировки
                    </span>
                  )}
                </div>
                
                <p className="font-mono text-[9px] text-ink-faint mt-0.5 truncate">{student.email}</p>

                {/* Report stats */}
                <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-line-soft select-none">
                  <div className="flex items-center justify-between text-[10px] text-ink-soft">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-ink-faint" />
                      <span>Последний отчет:</span>
                    </span>
                    <strong className="text-ink font-semibold">{student.lastReportDate}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-ink-soft">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-ink-faint" />
                      <span>Общее время практик:</span>
                    </span>
                    <strong className="text-ink font-semibold text-amber">{student.practiceHours}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-ink-soft">
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-ink-faint" />
                      <span>Последняя практика:</span>
                    </span>
                    <span className="text-ink truncate max-w-[120px] font-medium">{student.lastPracticeName}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
