import React, { useState } from 'react';
import { CategoryExpense } from '../types/finance';

interface CategoryDonutChartProps {
  categories: CategoryExpense[];
  totalAmount: number;
  formatCurrency: (val: number) => string;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  categories,
  totalAmount,
  formatCurrency,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryExpense | null>(null);

  // SVG parameters
  const size = 160;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate segment offsets with a small gap
  const gapAngle = 2.5; // degrees gap between segments
  const totalGapDegrees = categories.length * gapAngle;
  const availableDegrees = 360 - totalGapDegrees;

  let accumulatedAngle = -90; // Start at top

  return (
    <div className="flex items-center justify-between gap-3">
      {/* Donut SVG */}
      <div className="relative flex-shrink-0 w-[140px] h-[140px] flex items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full transform -rotate-90"
        >
          {/* Background subtle ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
          />

          {categories.map((cat) => {
            const segmentDegrees = (cat.percentage / 100) * availableDegrees;
            const strokeDasharray = `${(segmentDegrees / 360) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedAngle + 90) / 360) * circumference;

            // Increment for next segment
            accumulatedAngle += segmentDegrees + gapAngle;

            const isHovered = activeCategory?.id === cat.id;

            return (
              <circle
                key={cat.id}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={cat.color}
                strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                style={{
                  filter: isHovered
                    ? `drop-shadow(0 0 8px ${cat.color})`
                    : 'none',
                }}
                onMouseEnter={() => setActiveCategory(cat)}
                onMouseLeave={() => setActiveCategory(null)}
                onClick={() =>
                  setActiveCategory(activeCategory?.id === cat.id ? null : cat)
                }
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
          <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase font-numeric">
            {activeCategory ? activeCategory.name : 'TOTAL'}
          </span>
          <span className="text-sm font-bold text-white tracking-tight font-numeric">
            {activeCategory
              ? formatCurrency(activeCategory.amount)
              : formatCurrency(totalAmount)}
          </span>
          {activeCategory && (
            <span className="text-[10px] text-purple-400 font-semibold font-numeric">
              {activeCategory.percentage}%
            </span>
          )}
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 space-y-2">
        {categories.map((cat) => {
          const isSelected = activeCategory?.id === cat.id;

          return (
            <button
              key={cat.id}
              onMouseEnter={() => setActiveCategory(cat)}
              onMouseLeave={() => setActiveCategory(null)}
              onClick={() =>
                setActiveCategory(activeCategory?.id === cat.id ? null : cat)
              }
              className={`w-full flex items-center justify-between text-xs py-1 px-1.5 rounded-lg transition-all ${
                isSelected
                  ? 'bg-white/10 shadow-sm'
                  : 'hover:bg-white/5 opacity-90'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: cat.color,
                    boxShadow: isSelected ? `0 0 8px ${cat.color}` : 'none',
                  }}
                />
                <span className="font-medium text-slate-200 truncate text-[13px]">
                  {cat.name}
                </span>
              </div>
              <span className="font-bold text-slate-300 font-numeric text-[13px]">
                {cat.percentage}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
