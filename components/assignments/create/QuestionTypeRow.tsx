'use client';

import { X, ChevronDown } from 'lucide-react';
import { CounterInput } from './CounterInput';

export const QUESTION_TYPE_OPTIONS = [
  { value: 'mcq', label: 'Multiple Choice Questions' },
  { value: 'short_answer', label: 'Short Questions' },
  { value: 'diagram', label: 'Diagram/Graph-Based Questions' },
  { value: 'numerical', label: 'Numerical Problems' },
  { value: 'long_answer', label: 'Long Answer Questions' },
] as const;

export interface QuestionRowData {
  type: string;
  count: number;
  marks: number;
}

interface QuestionTypeRowProps {
  row: QuestionRowData;
  index: number;
  onChange: (index: number, field: keyof QuestionRowData, value: string | number) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

export function QuestionTypeRow({
  row,
  index,
  onChange,
  onRemove,
  canRemove,
}: QuestionTypeRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto_auto] gap-4 items-center">
      <div className="flex items-center gap-2 min-w-0">
        <div className="relative flex-1 min-w-0">
          <select
            value={row.type}
            onChange={(e) => onChange(index, 'type', e.target.value)}
            className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          >
            {QUESTION_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-700 transition"
            aria-label="Remove question type"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between sm:justify-center gap-3 sm:block">
        <span className="text-xs font-semibold text-gray-500 sm:hidden">No. of Questions</span>
        <CounterInput
          value={row.count}
          onChange={(v) => onChange(index, 'count', v)}
          min={1}
        />
      </div>

      <div className="flex items-center justify-between sm:justify-center gap-3 sm:block">
        <span className="text-xs font-semibold text-gray-500 sm:hidden">Marks</span>
        <CounterInput
          value={row.marks}
          onChange={(v) => onChange(index, 'marks', v)}
          min={1}
        />
      </div>
    </div>
  );
}
