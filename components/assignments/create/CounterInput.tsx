'use client';

import { Minus, Plus } from 'lucide-react';

interface CounterInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function CounterInput({ value, onChange, min = 1, max = 99 }: CounterInputProps) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div className="inline-flex items-center rounded-full border border-gray-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition"
        aria-label="Decrease"
      >
        <Minus size={14} />
      </button>
      <span className="w-8 text-center text-sm font-medium text-gray-900 tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition"
        aria-label="Increase"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
