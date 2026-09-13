'use client';

import React from 'react';
import { WordCounterStatistics } from '@/lib/text/types';
import { StatisticCard } from './StatisticCard';
import {
  FileText,
  Type,
  Space,
  AlignLeft,
  Pilcrow,
  Clock,
  Mic,
  BarChart2,
  Hash,
} from 'lucide-react';

interface StatisticsGridProps {
  stats: WordCounterStatistics;
}

export function StatisticsGrid({ stats }: StatisticsGridProps) {
  const formatTime = (minutes: number, label: string) => {
    if (minutes === 0) return '0 min';
    if (minutes === 1) return `~1 min ${label}`;
    return `~${minutes} min ${label}`;
  };

  return (
    <div className="space-y-4">
      {/* Primary Row: Words, Characters, Chars w/o spaces, Sentences */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatisticCard
          label="Words"
          value={stats.words}
          icon={<FileText className="w-4 h-4" />}
          sublabel="Meaningful tokens"
          highlight={true}
        />
        <StatisticCard
          label="Characters"
          value={stats.characters}
          icon={<Type className="w-4 h-4" />}
          sublabel="Including spaces & emoji"
          highlight={true}
        />
        <StatisticCard
          label="Without Spaces"
          value={stats.charactersWithoutSpaces}
          icon={<Space className="w-4 h-4" />}
          sublabel="Letters & symbols only"
        />
        <StatisticCard
          label="Sentences"
          value={stats.sentences}
          icon={<AlignLeft className="w-4 h-4" />}
          sublabel="Clean boundaries"
        />
      </div>

      {/* Secondary Row: Paragraphs, Lines, Reading Time, Speaking Time */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatisticCard
          label="Paragraphs"
          value={stats.paragraphs}
          icon={<Pilcrow className="w-4 h-4" />}
          sublabel="Separated by blank lines"
        />
        <StatisticCard
          label="Lines"
          value={stats.lines}
          icon={<Hash className="w-4 h-4" />}
          sublabel="Text line breaks"
        />
        <StatisticCard
          label="Reading Time"
          value={formatTime(stats.readingTimeMinutes, 'read')}
          icon={<Clock className="w-4 h-4" />}
          sublabel="Average reading speed"
        />
        <StatisticCard
          label="Speaking Time"
          value={formatTime(stats.speakingTimeMinutes, 'speech')}
          icon={<Mic className="w-4 h-4" />}
          sublabel="Standard speech rate"
        />
      </div>

      {/* Readability / Text Density Banner */}
      {stats.words > 0 && stats.sentences > 0 && (
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
            <BarChart2 className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Text Density & Readability:</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-800 dark:text-zinc-200 font-medium">
            <span>
              Average:{' '}
              <strong className="font-mono text-[#5722AF] dark:text-[#9B6BE8]">
                {stats.averageWordsPerSentence}
              </strong>{' '}
              words per sentence
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
