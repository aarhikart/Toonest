'use client';

import React from 'react';
import { Briefcase, Plane, CalendarCheck, Clock, ShieldCheck, HeartHandshake } from 'lucide-react';

export const DateTimeUseCases: React.FC = () => {
  const cases = [
    {
      title: 'Project Deadlines & Sprints',
      desc: 'Accurately plan agile milestones, deliverables, and client delivery schedules in exact calendar and working business days.',
      icon: <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
    },
    {
      title: 'Shift & Payroll Tracking',
      desc: 'Calculate exact shift hours for part-time, full-time, and overnight workers across midnight boundaries without negative durations.',
      icon: <Clock className="w-5 h-5 text-blue-500" />,
    },
    {
      title: 'Travel, Flights & Layovers',
      desc: 'Estimate exact transit times, connection layovers, and cross-timezone arrival clocks for domestic and international journeys.',
      icon: <Plane className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: 'Contracts, Leases & SLAs',
      desc: 'Verify contractual start and termination periods, warranty validity, and service-level agreements with inclusive or exclusive counting.',
      icon: <ShieldCheck className="w-5 h-5 text-amber-500" />,
    },
    {
      title: 'Vacation & Annual Leave',
      desc: 'Differentiate actual calendar days away from work from billable annual leave days using customized weekend and holiday exclusions.',
      icon: <CalendarCheck className="w-5 h-5 text-rose-500" />,
    },
    {
      title: 'Events & Milestone Countdowns',
      desc: 'Count down remaining days, hours, and minutes until weddings, birthdays, product launches, or retirement anniversaries.',
      icon: <HeartHandshake className="w-5 h-5 text-indigo-500" />,
    },
  ];

  return (
    <section className="py-12 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Practical Everyday Use Cases
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Built for professionals, project managers, travelers, and teams worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5 hover:border-purple-300 dark:hover:border-purple-800 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                {c.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {c.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
