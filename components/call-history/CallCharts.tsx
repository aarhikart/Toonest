'use client';

import React, { useMemo } from 'react';
import { BarChart3, PieChart, Clock, Calendar } from 'lucide-react';
import { CallRecord } from '@/lib/call-history/types';
import { groupCallsByDate, groupCallsByHour } from '@/lib/call-history/statistics';

interface CallChartsProps {
  records: CallRecord[];
}

export function CallCharts({ records }: CallChartsProps) {
  // 1. Daily Call Volume
  const dailyData = useMemo(() => {
    return groupCallsByDate(records);
  }, [records]);

  // 2. Incoming vs Outgoing vs Missed
  const typeData = useMemo(() => {
    let incoming = 0;
    let outgoing = 0;
    let missed = 0;
    let other = 0;

    for (const r of records) {
      if (r.type === 'Incoming') incoming++;
      else if (r.type === 'Outgoing') outgoing++;
      else if (r.type === 'Missed') missed++;
      else other++;
    }

    const total = records.length || 1;
    return {
      incoming,
      outgoing,
      missed,
      other,
      total: records.length,
      incomingPct: Math.round((incoming / total) * 100),
      outgoingPct: Math.round((outgoing / total) * 100),
      missedPct: Math.round((missed / total) * 100),
    };
  }, [records]);

  // 3. Hourly Distribution (0 to 23)
  const hourlyData = useMemo(() => {
    return groupCallsByHour(records);
  }, [records]);

  const maxDailyCalls = Math.max(1, ...dailyData.map((d) => d.total));
  const maxHourlyCalls = Math.max(1, ...hourlyData.map((h) => h.total));

  // Compute SVG Donut Chart strokeDasharrays
  const circumference = 2 * Math.PI * 40; // r = 40 => ~251.3
  const incomingDash = (typeData.incoming / (typeData.total || 1)) * circumference;
  const outgoingDash = (typeData.outgoing / (typeData.total || 1)) * circumference;
  const missedDash = (typeData.missed / (typeData.total || 1)) * circumference;

  const incomingOffset = 0;
  const outgoingOffset = -incomingDash;
  const missedOffset = -(incomingDash + outgoingDash);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 1. Daily Calls Bar Chart */}
      <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#5722AF] dark:text-[#B68BFF] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                Call Volume by Day
              </h3>
              <p className="text-[11px] text-zinc-500">
                Daily frequency across the selected period
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#5722AF] dark:text-[#B68BFF]">
            {dailyData.length} Days Recorded
          </span>
        </div>

        {dailyData.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 text-xs">
            No daily data available
          </div>
        ) : (
          <div className="pt-4">
            <div className="h-44 sm:h-52 flex items-end gap-1.5 sm:gap-2 overflow-x-auto pb-6 px-1">
              {dailyData.map((day, idx) => {
                const heightPct = Math.round((day.total / maxDailyCalls) * 100);
                return (
                  <div
                    key={idx}
                    className="flex-1 min-w-[28px] max-w-[42px] h-full flex flex-col items-center justify-end group relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center pointer-events-none whitespace-nowrap bg-zinc-900 text-white text-[10px] px-2 py-1 rounded-lg shadow-lg">
                      <span className="font-bold">{day.label}</span>
                      <span>{day.total} calls ({day.incoming} In, {day.outgoing} Out)</span>
                    </div>

                    {/* Bar */}
                    <div className="w-full rounded-t-lg bg-zinc-100 dark:bg-zinc-800/80 overflow-hidden flex flex-col justify-end transition-all group-hover:brightness-110">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full bg-gradient-to-t from-[#5722AF] to-[#9B6BE8] rounded-t-lg transition-all duration-300"
                      />
                    </div>

                    {/* X-axis Label */}
                    <span className="absolute -bottom-5 text-[9px] font-mono text-zinc-400 truncate max-w-full">
                      {day.date.slice(8)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Donut Chart: Incoming vs Outgoing vs Missed */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#5722AF] dark:text-[#B68BFF] flex items-center justify-center">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
              Incoming vs Outgoing
            </h3>
            <p className="text-[11px] text-zinc-500">Distribution by call direction</p>
          </div>
        </div>

        {/* SVG Donut */}
        <div className="flex items-center justify-center py-2 relative">
          <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#e4e4e7"
              strokeWidth="12"
              className="dark:stroke-zinc-800"
            />
            {/* Incoming (Emerald) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#10b981"
              strokeWidth="12"
              strokeDasharray={`${incomingDash} ${circumference}`}
              strokeDashoffset={incomingOffset}
              className="transition-all duration-500"
            />
            {/* Outgoing (Blue) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#3b82f6"
              strokeWidth="12"
              strokeDasharray={`${outgoingDash} ${circumference}`}
              strokeDashoffset={outgoingOffset}
              className="transition-all duration-500"
            />
            {/* Missed (Rose) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#f43f5e"
              strokeWidth="12"
              strokeDasharray={`${missedDash} ${circumference}`}
              strokeDashoffset={missedOffset}
              className="transition-all duration-500"
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl font-black text-zinc-900 dark:text-zinc-100">
              {typeData.total}
            </span>
            <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
              Calls
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <div className="p-1.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mb-1" />
            <div className="text-[10px] text-zinc-500">Incoming</div>
            <div className="font-bold text-xs text-emerald-700 dark:text-emerald-300">
              {typeData.incomingPct}%
            </div>
          </div>

          <div className="p-1.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mb-1" />
            <div className="text-[10px] text-zinc-500">Outgoing</div>
            <div className="font-bold text-xs text-blue-700 dark:text-blue-300">
              {typeData.outgoingPct}%
            </div>
          </div>

          <div className="p-1.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20">
            <span className="inline-block w-2 h-2 rounded-full bg-rose-500 mb-1" />
            <div className="text-[10px] text-zinc-500">Missed</div>
            <div className="font-bold text-xs text-rose-700 dark:text-rose-300">
              {typeData.missedPct}%
            </div>
          </div>
        </div>
      </div>

      {/* 3. Hourly Activity Bar Chart (0-23h) */}
      <div className="lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#5722AF] dark:text-[#B68BFF] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                Peak Calling Hours (00:00 – 23:00)
              </h3>
              <p className="text-[11px] text-zinc-500">
                Identify what time of day most calls occur
              </p>
            </div>
          </div>
        </div>

        <div className="h-32 sm:h-36 flex items-end gap-1 overflow-x-auto pb-6 px-1 pt-4">
          {hourlyData.map((h, i) => {
            const heightPct = Math.round((h.total / maxHourlyCalls) * 100);
            return (
              <div
                key={i}
                className="flex-1 min-w-[14px] sm:min-w-[18px] h-full flex flex-col items-center justify-end group relative"
              >
                {/* Tooltip */}
                <div className="absolute -top-10 z-20 hidden group-hover:flex flex-col items-center pointer-events-none whitespace-nowrap bg-zinc-900 text-white text-[10px] px-2 py-0.5 rounded-lg shadow-lg">
                  <span className="font-bold">{h.label}</span>
                  <span>{h.total} calls</span>
                </div>

                {/* Bar */}
                <div className="w-full rounded-t-sm bg-zinc-100 dark:bg-zinc-800/80 overflow-hidden flex flex-col justify-end group-hover:brightness-110">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-sm transition-all duration-300 ${
                      h.total > 0
                        ? 'bg-[#5722AF] dark:bg-[#9B6BE8]'
                        : 'bg-transparent'
                    }`}
                  />
                </div>

                {/* X-axis Label (Show every 3 hours for neatness) */}
                {i % 3 === 0 && (
                  <span className="absolute -bottom-5 text-[9px] font-mono text-zinc-400">
                    {h.label.replace(' ', '')}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
