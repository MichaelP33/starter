import React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// --- Begin: Shared color logic with PicklistChips.tsx ---
const SOFT_PASTEL_COLORS = [
  "bg-purple-50 text-purple-700 border-purple-200",
  "bg-green-50 text-green-700 border-green-200",
  "bg-orange-50 text-orange-700 border-orange-200",
  "bg-pink-50 text-pink-700 border-pink-200",
  "bg-indigo-50 text-indigo-700 border-indigo-200",
  "bg-teal-50 text-teal-700 border-teal-200",
  "bg-rose-50 text-rose-700 border-rose-200",
];

function getColorClass(option: string, optionIndex: number) {
  console.log('[CompactPicklistChips] Option:', option, 'at index:', optionIndex, '-> color index:', optionIndex % SOFT_PASTEL_COLORS.length);
  return SOFT_PASTEL_COLORS[optionIndex % SOFT_PASTEL_COLORS.length];
}
// --- End: Shared color logic ---

interface CompactPicklistChipsProps {
  options: string[];
  maxVisible?: number;
  className?: string;
  referenceOptions?: string[];
}

const MAX_CHARS = 40; // Only truncate if text exceeds 40 chars
const DEFAULT_MAX_VISIBLE = 3;

const CompactPicklistChips: React.FC<CompactPicklistChipsProps> = ({ options, maxVisible = DEFAULT_MAX_VISIBLE, className, referenceOptions }) => {
  console.log('[CompactPicklistChips] Rendering with options:', options, 'maxVisible:', maxVisible, 'className:', className);
  if (!options || options.length === 0) return null;
  const visible = options.slice(0, maxVisible);
  const remaining = options.length - maxVisible;
  const colorReference = referenceOptions || options;

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      <TooltipProvider>
        {visible.map((option, idx) => {
          const shouldTruncate = option.length > MAX_CHARS;
          const displayText = shouldTruncate ? option.slice(0, MAX_CHARS) + "…" : option;
          const colorIdx = colorReference.indexOf(option);
          const colorClass = getColorClass(option, colorIdx === -1 ? idx : colorIdx);
          return (
            <Tooltip key={option + idx}>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "inline-block px-2 py-0.5 rounded-full text-xs font-normal max-w-[180px] truncate cursor-default border",
                    colorClass
                  )}
                  style={{ maxWidth: 180 }}
                >
                  {displayText}
                </span>
              </TooltipTrigger>
              {shouldTruncate && (
                <TooltipContent>
                  {option}
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
        {remaining > 0 && (
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-normal bg-gray-100 text-gray-500 border border-gray-200">
            +{remaining} more
          </span>
        )}
      </TooltipProvider>
    </div>
  );
};

export default CompactPicklistChips; 