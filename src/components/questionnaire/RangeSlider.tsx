"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface RangeSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  labels?: [string, string];
}

export function RangeSlider({
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  labels
}: RangeSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full space-y-4">
      {/* Value Display */}
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm">
          {labels?.[0] || `${min}${unit}`}
        </span>
        <div className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
          <span className="text-purple-400 font-bold text-lg">
            {value}{unit}
          </span>
        </div>
        <span className="text-gray-400 text-sm">
          {labels?.[1] || `${max}${unit}`}
        </span>
      </div>

      {/* Slider Track */}
      <div className="relative h-3 bg-slate-600 rounded-full overflow-hidden">
        {/* Progress Fill */}
        <motion.div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          style={{ width: `${percentage}%` }}
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />

        {/* Slider Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {/* Slider Thumb */}
        <motion.div
          className="absolute top-1/2 w-6 h-6 bg-white border-2 border-purple-500 rounded-full shadow-lg transform -translate-y-1/2 pointer-events-none"
          style={{ left: `calc(${percentage}% - 12px)` }}
          initial={false}
          animate={{ left: `calc(${percentage}% - 12px)` }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          whileHover={{ scale: 1.1 }}
        />
      </div>


    </div>
  );
}
