import React, { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Soft pastel color palette
const SOFT_PASTEL_COLORS = [
  "bg-purple-50 text-purple-700 border-purple-200",
  "bg-blue-50 text-blue-700 border-blue-200",
  "bg-green-50 text-green-700 border-green-200",
  "bg-orange-50 text-orange-700 border-orange-200",
  "bg-pink-50 text-pink-700 border-pink-200",
  "bg-indigo-50 text-indigo-700 border-indigo-200",
  "bg-teal-50 text-teal-700 border-teal-200",
  "bg-rose-50 text-rose-700 border-rose-200",
];

// Simple hash function to assign a color index based on option text
function getColorClass(option: string) {
  let hash = 0;
  for (let i = 0; i < option.length; i++) {
    hash = option.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % SOFT_PASTEL_COLORS.length;
  return SOFT_PASTEL_COLORS[idx];
}

interface PicklistChipsProps {
  options: string[];
  selectedOptions?: string[];
  onToggle?: (option: string, selected: boolean) => void;
  onRemove?: (option: string) => void;
  className?: string;
  variant?: 'default' | 'source' | 'qualification'; // add 'qualification' for picklist qualification selection
}

const PicklistChips: React.FC<PicklistChipsProps> = ({ options, selectedOptions, onToggle, onRemove, className, variant = 'default' }) => {
  const isToggleable = typeof selectedOptions !== 'undefined' && typeof onToggle === 'function';
  const [internalSelected, setInternalSelected] = useState<string[]>(selectedOptions || []);
  const isControlled = typeof selectedOptions !== 'undefined';
  const selected = isControlled ? selectedOptions! : internalSelected;
  const [deselected, setDeselected] = useState<string | null>(null);

  const handleToggle = (option: string) => {
    const isSelected = selected.includes(option);
    let updated: string[];
    if (isSelected) {
      updated = selected.filter(o => o !== option);
      setDeselected(option); // trigger animation
      setTimeout(() => setDeselected(null), 180); // match transition duration
    } else {
      updated = [...selected, option];
    }
    if (!isControlled) setInternalSelected(updated);
    if (onToggle) onToggle(option, !isSelected);
  };

  if (!options || options.length === 0) return null;

  // Display-only chips (not toggleable)
  if (!isToggleable) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {options.map((option) => (
          <div key={option} className="group relative inline-flex items-center">
            <span
              className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-sm",
                getColorClass(option),
                typeof onRemove === 'function' ? 'pr-6' : ''
              )}
            >
              {option}
            </span>
            {typeof onRemove === 'function' && (
              <button
                type="button"
                aria-label={`Remove ${option}`}
                onClick={() => onRemove(option)}
                className="absolute right-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500"
                tabIndex={-1}
              >
                <span className="sr-only">Remove</span>
                <svg width="14" height="14" fill="none" viewBox="0 0 16 16"><path d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 1 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06z" fill="currentColor"/></svg>
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Toggleable chips (selection logic)
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        const removable = typeof onRemove === 'function';
        const colorClass = getColorClass(option);
        if (variant === 'source') {
          // Data Source chip style
          return (
            <motion.div
              key={option}
              className="group relative"
              initial={false}
              animate={isSelected ? { scale: 1, opacity: 1 } : { scale: deselected === option ? 0.92 : 1, opacity: 1 }}
              transition={{ duration: 0.18 }}
            >
              <button
                type="button"
                onClick={() => handleToggle(option)}
                aria-pressed={isSelected}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center border transition-all duration-200 focus:outline-none cursor-pointer select-none",
                  isSelected
                    ? colorClass + " ring-2 ring-blue-200"
                    : colorClass + " opacity-70 hover:opacity-100",
                  removable ? 'pr-6' : ''
                )}
              >
                {option}
              </button>
              {removable && (
                <button
                  type="button"
                  aria-label={`Remove ${option}`}
                  onClick={() => onRemove(option)}
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500"
                  tabIndex={-1}
                >
                  <span className="sr-only">Remove</span>
                  <svg width="14" height="14" fill="none" viewBox="0 0 16 16"><path d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 1 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06z" fill="currentColor"/></svg>
                </button>
              )}
            </motion.div>
          );
        } else if (variant === 'qualification') {
          // Qualification selection chips (green accent for selected)
          return (
            <button
              key={option}
              type="button"
              onClick={() => handleToggle(option)}
              className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 focus:outline-none cursor-pointer pr-6",
                isSelected
                  ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 shadow-sm"
                  : colorClass + " opacity-70 hover:opacity-100 border",
                "transition-all duration-200"
              )}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <Check className="w-3 h-3 mr-1 text-green-700" />
              )}
              {option}
            </button>
          );
        } else {
          // Default picklist chip style (with checkmark)
          return (
            <div key={option} className="group relative inline-flex items-center">
              <button
                type="button"
                onClick={() => handleToggle(option)}
                className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 focus:outline-none cursor-pointer pr-6",
                  colorClass,
                  isSelected ? "ring-2 ring-primary/30" : "opacity-80 hover:opacity-100",
                  "transition-all duration-200"
                )}
                aria-pressed={isSelected}
              >
                {isSelected && (
                  <Check className="w-3 h-3 mr-1 text-primary" />
                )}
                {option}
              </button>
              {removable && (
                <button
                  type="button"
                  aria-label={`Remove ${option}`}
                  onClick={() => onRemove(option)}
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500"
                  tabIndex={-1}
                >
                  <span className="sr-only">Remove</span>
                  <svg width="14" height="14" fill="none" viewBox="0 0 16 16"><path d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 1 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06z" fill="currentColor"/></svg>
                </button>
              )}
            </div>
          );
        }
      })}
    </div>
  );
};

export default PicklistChips; 