'use client';

import React, { useState } from 'react';
import { PersonEntry } from '@/lib/age/types';
import { calculateExactAge } from '@/lib/age/calculations';
import { formatDateDMY, getTodayDateInput } from '@/lib/age/dates';
import { Users, Plus, Trash2, ChevronDown } from 'lucide-react';

export const MultiPersonCompare: React.FC = () => {
  const today = getTodayDateInput();
  const [isOpen, setIsOpen] = useState(false);

  const [people, setPeople] = useState<PersonEntry[]>([
    { id: '1', name: 'Person 1', dob: { year: 1990, month: 4, day: 12 } },
    { id: '2', name: 'Person 2', dob: { year: 1995, month: 9, day: 18 } },
    { id: '3', name: 'Person 3', dob: { year: 2000, month: 1, day: 2 } },
  ]);

  const [newName, setNewName] = useState('');
  const [newYear, setNewYear] = useState('1998');
  const [newMonth, setNewMonth] = useState('6');
  const [newDay, setNewDay] = useState('15');

  const handleAdd = () => {
    if (people.length >= 5) return;
    const y = parseInt(newYear, 10) || 2000;
    const m = parseInt(newMonth, 10) || 1;
    const d = parseInt(newDay, 10) || 1;

    const newPerson: PersonEntry = {
      id: `person_${Date.now()}`,
      name: newName.trim() || `Person ${people.length + 1}`,
      dob: { year: y, month: m, day: d },
    };

    setPeople([...people, newPerson]);
    setNewName('');
  };

  const handleRemove = (id: string) => {
    setPeople(people.filter((p) => p.id !== id));
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Compare Multiple People (Up to 5)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Side-by-side age comparison table
            </p>
          </div>
        </div>

        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-purple-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="space-y-4 pt-2 animate-in fade-in duration-200">
          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Name / Label</th>
                  <th className="py-3 px-4">Date of Birth</th>
                  <th className="py-3 px-4">Current Age</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {people.map((p) => {
                  const age = calculateExactAge(p.dob, today);
                  return (
                    <tr key={p.id} className="hover:bg-purple-50/30 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {p.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                        {formatDateDMY(p.dob)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-purple-700 dark:text-purple-300">
                        {age.years} yrs, {age.months} mos, {age.days} days
                      </td>
                      <td className="py-3 px-4 text-right">
                        {people.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemove(p.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Remove person"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Add Person Bar */}
          {people.length < 5 ? (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Name (e.g. Alex)"
                className="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 flex-1 min-w-[120px] focus:ring-2 focus:ring-purple-600 outline-none"
              />
              <div className="flex items-center gap-1.5 text-xs">
                <input
                  type="number"
                  placeholder="DD"
                  min="1"
                  max="31"
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value)}
                  className="w-12 text-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2 focus:ring-2 focus:ring-purple-600 outline-none"
                />
                <span>/</span>
                <input
                  type="number"
                  placeholder="MM"
                  min="1"
                  max="12"
                  value={newMonth}
                  onChange={(e) => setNewMonth(e.target.value)}
                  className="w-12 text-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2 focus:ring-2 focus:ring-purple-600 outline-none"
                />
                <span>/</span>
                <input
                  type="number"
                  placeholder="YYYY"
                  min="1900"
                  max="2099"
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  className="w-16 text-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2 focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-700 hover:bg-purple-800 text-white transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Person</span>
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center">
              Maximum of 5 people reached.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
