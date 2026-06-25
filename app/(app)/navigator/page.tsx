'use client';

import React from 'react';
import { Compass, Clock, ShieldAlert, Sparkles } from 'lucide-react';

export default function NavigatorPage() {
  return (
    <div className="flex h-full overflow-hidden gap-4 items-stretch justify-start">
      {/* Left Column (w-[530px]) - Main Information Box */}
      <div className="flex-shrink-0 h-full" style={{ width: '530px' }}>
        <div className="border border-line bg-bg rounded-xl shadow-sm flex flex-col items-center justify-center p-8 text-center select-none h-full relative overflow-hidden">
          {/* Decorative background blur */}
          <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-amber/5 blur-3xl pointer-events-none"></div>
          <div className="absolute -left-20 -bottom-20 w-48 h-48 rounded-full bg-amber/5 blur-3xl pointer-events-none"></div>

          {/* Compass Icon Wrapper */}
          <div className="w-16 h-16 rounded-2xl bg-amber-wash/40 border border-amber/20 flex items-center justify-center mb-6 relative">
            <Compass className="w-8 h-8 text-amber animate-spin" style={{ animationDuration: '20s' }} />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber"></span>
            </span>
          </div>

          <h2 className="font-display font-bold text-lg text-ink mb-3 select-none">
            Навигатор в разработке
          </h2>
          
          <p className="text-xs text-ink-soft leading-relaxed max-w-sm font-body">
            Мы готовим интерактивную пошаговую карту прохождения практик, обучения и отчётов. Совсем скоро здесь появится наглядная траектория вашего прогресса в сообществе.
          </p>

          <div className="mt-8 flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-amber-wash/40 border border-amber/15 text-[10px] font-mono text-amber font-semibold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>Запуск в следующей очереди</span>
          </div>
        </div>
      </div>

      {/* Right Column (w-[246px]) - Context Info / Sidebar */}
      <div className="flex-shrink-0 h-fit bg-bg border border-line rounded-xl shadow-sm p-4 flex flex-col gap-5" style={{ width: '246px' }}>
        {/* Section: Status */}
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[9px] text-ink-faint uppercase tracking-wider px-1 block font-semibold">
            Статус модуля
          </span>
          <div className="p-3 bg-bg-warm border border-line rounded-lg flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-bright"></div>
              <span className="text-xs font-semibold text-ink">Проектирование</span>
            </div>
            <p className="text-[10px] text-ink-soft leading-normal">
              Разрабатываем логику переходов между этапами обучения и интеграцию с летописями.
            </p>
          </div>
        </div>

        <hr className="border-line-soft" />

        {/* Section: Key Features */}
        <div className="flex flex-col gap-3.5">
          <span className="font-mono text-[9px] text-ink-faint uppercase tracking-wider px-1 block font-semibold">
            Что появится в модуле
          </span>
          <ul className="flex flex-col gap-2.5 px-1">
            <li className="flex items-start gap-2.5 text-xs text-ink-soft">
              <Sparkles className="w-3.5 h-3.5 text-amber flex-shrink-0 mt-0.5" />
              <span>Карта шагов от Новичка до Мастера</span>
            </li>
            <li className="flex items-start gap-2.5 text-xs text-ink-soft">
              <Sparkles className="w-3.5 h-3.5 text-amber flex-shrink-0 mt-0.5" />
              <span>Привязка аудио и видеоматериалов к этапам</span>
            </li>
            <li className="flex items-start gap-2.5 text-xs text-ink-soft">
              <Sparkles className="w-3.5 h-3.5 text-amber flex-shrink-0 mt-0.5" />
              <span>Быстрая отправка отчетов кураторам</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
