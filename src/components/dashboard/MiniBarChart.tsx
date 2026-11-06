import React from "react";

interface MiniBarChartProps {
  values: number[]; // Array of 7 values (0 to 100)
  days?: string[];
  height?: number;
}

export function MiniBarChart({
  values = [20, 35, 45, 10, 60, 90, 40],
  days = ["W", "T", "F", "S", "S", "M", "T"],
  height = 42,
}: MiniBarChartProps) {
  const max = Math.max(...values, 1);

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      {/* Bars container */}
      <div
        className="flex items-end gap-1.5 px-1"
        style={{ height: `${height}px` }}
      >
        {values.map((v, i) => {
          const heightPercent = Math.max(15, Math.round((v / max) * 100));
          const isHighlight = v === max || i >= values.length - 2;

          return (
            <div
              key={i}
              className="w-2 rounded-full transition-all duration-300"
              style={{
                height: `${heightPercent}%`,
                backgroundColor: isHighlight ? "#0060df" : "#cbd5e1",
              }}
              title={`Day ${days[i] || i + 1}: ${v}`}
            />
          );
        })}
      </div>

      {/* Days labels */}
      <div className="flex items-center gap-1.5 px-1">
        {days.map((day, i) => (
          <span
            key={i}
            className="w-2 text-center text-[10px] font-normal text-slate-600"
          >
            {day}
          </span>
        ))}
      </div>
    </div>
  );
}
