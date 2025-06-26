import React, { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const LIGHT_CATEGORY_COLORS: Record<string, string> = {
  "Marketing Leadership": "bg-purple-100 text-purple-800 border border-purple-200",
  "Marketing Operations": "bg-blue-100 text-blue-800 border border-blue-200",
  "Growth Marketing": "bg-green-100 text-green-800 border border-green-200",
  "Digital Marketing": "bg-orange-100 text-orange-800 border border-orange-200",
  "Data Engineering": "bg-purple-100 text-purple-800 border border-purple-200",
  "Data Science": "bg-blue-100 text-blue-800 border border-blue-200",
  "Analytics": "bg-green-100 text-green-800 border border-green-200",
  "Data Leadership": "bg-orange-100 text-orange-800 border border-orange-200"
};

const DARK_CATEGORY_COLORS: Record<string, string> = {
  "Marketing Leadership": "bg-purple-600 text-white border-purple-700",
  "Marketing Operations": "bg-blue-600 text-white border-blue-700",
  "Growth Marketing": "bg-green-600 text-white border-green-700",
  "Digital Marketing": "bg-orange-600 text-white border-orange-700",
  "Data Engineering": "bg-purple-600 text-white border-purple-700",
  "Data Science": "bg-blue-600 text-white border-blue-700",
  "Analytics": "bg-green-600 text-white border-green-700",
  "Data Leadership": "bg-orange-600 text-white border-orange-700"
};

interface PicklistChipsProps {
  options: string[];
  selectedOptions?: string[];
  onToggle?: (option: string, selected: boolean) => void;
  onRemove?: (option: string) => void;
  className?: string;
  variant?: 'default' | 'source' | 'qualification'; // add 'qualification' for picklist qualification selection
}

const PicklistChips: React.FC<PicklistChipsProps> = ({ options, selectedOptions, onToggle, onRemove, className, variant = 'default' }) => {
  console.log('[PicklistChips] Rendering with options:', options, 'selectedOptions:', selectedOptions, 'variant:', variant);
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
                LIGHT_CATEGORY_COLORS[option] || "bg-gray-100 text-gray-800 border border-gray-200",
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
                    ? "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
                    : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200",
                  "transition-all duration-200",
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
                  : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200",
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
                  isSelected
                    ? `${DARK_CATEGORY_COLORS[option] || "bg-gray-600 text-white border-gray-700"} shadow-sm`
                    : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200 hover:text-gray-800",
                  "transition-all duration-200"
                )}
                aria-pressed={isSelected}
              >
                {isSelected && (
                  <Check className="w-3 h-3 mr-1 text-white" />
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