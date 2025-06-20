import React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CompactPicklistChipsProps {
  options: string[];
  maxVisible?: number;
  className?: string;
}

// Use the same color palette as PicklistChips
const CATEGORY_COLORS: Record<string, string> = {
  "Marketing Leadership": "bg-purple-100 text-purple-800 border border-purple-200",
  "Marketing Operations": "bg-blue-100 text-blue-800 border border-blue-200",
  "Growth Marketing": "bg-green-100 text-green-800 border border-green-200",
  "Digital Marketing": "bg-orange-100 text-orange-800 border border-orange-200"
};

const MAX_CHARS = 40; // Only truncate if text exceeds 40 chars
const DEFAULT_MAX_VISIBLE = 3;

const CompactPicklistChips: React.FC<CompactPicklistChipsProps> = ({ options, maxVisible = DEFAULT_MAX_VISIBLE, className }) => {
  console.log('[CompactPicklistChips] Rendering with options:', options, 'maxVisible:', maxVisible, 'className:', className);
  if (!options || options.length === 0) return null;
  const visible = options.slice(0, maxVisible);
  const remaining = options.length - maxVisible;

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      <TooltipProvider>
        {visible.map((option, idx) => {
          // Only truncate if not a standard category and text is very long
          const isStandardCategory = Object.keys(CATEGORY_COLORS).includes(option);
          const shouldTruncate = !isStandardCategory && option.length > MAX_CHARS;
          const displayText = shouldTruncate ? option.slice(0, MAX_CHARS) + "…" : option;
          const colorClass = CATEGORY_COLORS[option] || "bg-gray-100 text-gray-800 border border-gray-200";
          return (
            <Tooltip key={option + idx}>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "inline-block px-2 py-0.5 rounded-full text-xs font-normal max-w-[180px] truncate cursor-default",
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