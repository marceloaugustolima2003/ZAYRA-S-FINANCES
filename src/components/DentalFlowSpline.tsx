import React, { useState } from 'react';
import { triggerHaptic } from '../utils/haptics';

export interface DataPoint {
  day: string;
  value: number;
}

interface DentalFlowSplineProps {
  data?: DataPoint[];
  currentBalance?: number;
  userName?: string;
  neonColor?: string;
}

const defaultData: DataPoint[] = [
  { day: 'Seg', value: 7100 },
  { day: 'Ter', value: 7350 },
  { day: 'Qua', value: 7200 },
  { day: 'Qui', value: 7650 },
  { day: 'Sex', value: 7500 },
  { day: 'Sáb', value: 7800 },
  { day: 'Hoje', value: 8120 },
];

export const DentalFlowSpline: React.FC<DentalFlowSplineProps> = ({
  data = defaultData,
  currentBalance = 8120,
  userName = 'Minha Conta',
  neonColor = '#00F0FF',
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // SVG coordinate calculations
  const width = 340;
  const height = 95;
  const paddingX = 14;
  const paddingY = 14;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values) * 0.96;
  const maxVal = Math.max(...values) * 1.04;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
    const y =
      height -
      paddingY -
      ((d.value - minVal) / (maxVal - minVal || 1)) * (height - paddingY * 2);
    return { x, y, ...d };
  });

  // Generate smooth cubic bezier spline path
  const generateSplinePath = () => {
    if (points.length === 0) return '';
    let path = `M ${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : points.length - 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const linePath = generateSplinePath();
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const areaPath = `${linePath} L ${lastPoint.x},${height} L ${firstPoint.x},${height} Z`;

  const activePoint = activeIndex !== null ? points[activeIndex] : null;

  return (
    <div className="relative w-full overflow-hidden select-none">
      {/* Dynamic Tooltip on hover/touch */}
      <div className="flex items-center justify-between px-2 pb-1 text-[11px] text-gray-400 font-medium">
        <span className="flex items-center gap-1.5 text-xs" style={{ color: neonColor }}>
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: neonColor,
              boxShadow: `0 0 8px ${neonColor}`,
            }}
          />
          Dental Flow: Saldo Semanal
        </span>
        <span className="font-semibold text-white font-mono">
          {activePoint
            ? `${activePoint.day}: R$ ${activePoint.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : `Saldo Atual: R$ ${currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        </span>
      </div>

      <div className="relative w-full h-[95px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Liquid Flow Gradient for the line */}
            <linearGradient id="splineLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#39FF14" />
              <stop offset="50%" stopColor="#00F0FF" />
              <stop offset="100%" stopColor="#0066FF" />
            </linearGradient>

            {/* Liquid translucent area gradient merging into card base */}
            <linearGradient id="splineAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={neonColor} stopOpacity="0.32" />
              <stop offset="50%" stopColor="#0066FF" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0B0F19" stopOpacity="0.0" />
            </linearGradient>

            <filter id="splineGlow" x="-20%" y="-40%" width="140%" height="180%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Area under spline */}
          <path d={areaPath} fill="url(#splineAreaGrad)" />

          {/* Glowing continuous spline line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#splineLineGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            filter="url(#splineGlow)"
          />

          {/* Interactive touch targets & milestone dots */}
          {points.map((pt, idx) => {
            const isLast = idx === points.length - 1;
            const isSelected = activeIndex === idx;

            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => {
                  triggerHaptic('light');
                  setActiveIndex(idx);
                }}
                onTouchStart={() => {
                  triggerHaptic('light');
                  setActiveIndex(idx);
                }}
              >
                <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

                {(isLast || isSelected) && (
                  <>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="7"
                      fill={neonColor}
                      opacity="0.3"
                      className="animate-ping"
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4.5"
                      fill="#FFFFFF"
                      stroke={neonColor}
                      strokeWidth="2.5"
                      filter="url(#splineGlow)"
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Weekday ticks */}
      <div className="flex justify-between px-3 pt-1 text-[10px] text-gray-400 font-mono tracking-wider">
        {data.map((d, i) => (
          <span
            key={i}
            className={`transition-colors ${
              activeIndex === i
                ? 'text-[#00F0FF] font-bold'
                : i === data.length - 1
                ? 'text-gray-200 font-medium'
                : 'text-gray-500'
            }`}
          >
            {d.day}
          </span>
        ))}
      </div>
    </div>
  );
};
