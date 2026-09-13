'use client';

import React from 'react';
import { LoanType, TenureType } from '@/lib/emi/types';
import { Landmark, Home, User, Car, GraduationCap, Sliders } from 'lucide-react';

interface EMIHeroProps {
  loanType: LoanType;
  onLoanTypeChange: (type: LoanType) => void;
  tenureType: TenureType;
  onTenureTypeChange: (type: TenureType) => void;
}

export const EMIHero: React.FC<EMIHeroProps> = ({
  loanType,
  onLoanTypeChange,
  tenureType,
  onTenureTypeChange,
}) => {
  const loanTypes = [
    { type: 'home' as LoanType, label: 'Home Loan', rate: '8.50%', icon: Home },
    { type: 'car' as LoanType, label: 'Car Loan', rate: '9.00%', icon: Car },
    { type: 'personal' as LoanType, label: 'Personal Loan', rate: '12.50%', icon: User },
    { type: 'education' as LoanType, label: 'Education Loan', rate: '10.00%', icon: GraduationCap },
    { type: 'custom' as LoanType, label: 'Custom', rate: '', icon: Sliders },
  ];

  return (
    <div className="w-full text-center mb-8">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-3">
        <Landmark className="w-3.5 h-3.5" />
        <span>RBI Reducing-Balance Formula</span>
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-3">
        EMI <span className="text-[#5722AF] dark:text-[#9B6BE8]">Calculator</span>
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-6">
        Accurately plan your loan repayments. Calculate monthly EMI, total interest, amortization schedules, and prepayment savings with interactive sliders.
      </p>

      {/* Loan Type Presets */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
        {loanTypes.map((item) => {
          const Icon = item.icon;
          const isActive = loanType === item.type;
          return (
            <button
              key={item.type}
              type="button"
              onClick={() => onLoanTypeChange(item.type)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border transition-all ${
                isActive
                  ? 'bg-[#5722AF] text-white border-[#5722AF] shadow-sm ring-1 ring-[#5722AF]'
                  : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.rate && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-purple-800 text-purple-200'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {item.rate}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tenure Toggle (Years vs Months) */}
      <div className="inline-flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold">
        <span className="px-3 py-1.5 text-neutral-500 dark:text-neutral-400">Tenure Mode:</span>
        <button
          type="button"
          onClick={() => onTenureTypeChange('years')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            tenureType === 'years'
              ? 'bg-white dark:bg-neutral-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          In Years
        </button>
        <button
          type="button"
          onClick={() => onTenureTypeChange('months')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            tenureType === 'months'
              ? 'bg-white dark:bg-neutral-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          In Months
        </button>
      </div>
    </div>
  );
};
