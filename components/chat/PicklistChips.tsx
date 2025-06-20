import React, { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const LIGHT_CATEGORY_COLORS: Record<string, string> = {
  "Marketing Leadership": "bg-purple-100 text-purple-800 border border-purple-200",
  "Marketing Operations": "bg-blue-100 text-blue-800 border border-blue-200",
  "Growth Marketing": "bg-green-100 text-green-800 border border-green-200",
  "Digital Marketing": "bg-orange-100 text-orange-800 border border-orange-200"
};

const DARK_CATEGORY_COLORS: Record<string, string> = {
  "Marketing Leadership": "bg-purple-600 text-white border-purple-700",
  "Marketing Operations": "bg-blue-600 text-white border-blue-700",
  "Growth Marketing": "bg-green-600 text-white border-green-700",
  "Digital Marketing": "bg-orange-600 text-white border-orange-700"
};

interface PicklistChipsProps {
  options: string[];
  selectedOptions?: string[];
  onToggle?: (option: string, selected: boolean) => void;
  className?: string;
  variant?: 'default' | 'source'; // 'default' for picklist, 'source' for data source chips
}

const PicklistChips: React.FC<PicklistChipsProps> = ({ options, selectedOptions, onToggle, className, variant = 'default' }) => {
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
          <span
            key={option}
            className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-sm",
              LIGHT_CATEGORY_COLORS[option] || "bg-gray-100 text-gray-800 border border-gray-200"
            )}
          >
            {option}
          </span>
        ))}
      </div>
    );
  }

  // Toggleable chips (selection logic)
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        if (variant === 'source') {
          // Data Source chip style
          return (
            <motion.button
              key={option}
              type="button"
              onClick={() => handleToggle(option)}
              aria-pressed={isSelected}
              initial={false}
              animate={isSelected ? { scale: 1, opacity: 1 } : { scale: deselected === option ? 0.92 : 1, opacity: 1 }}
              transition={{ duration: 0.18 }}
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-semibold inline-flex items-center border transition-all duration-200 focus:outline-none cursor-pointer select-none",
                isSelected
                  ? "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
                  : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200",
                "transition-all duration-200"
              )}
            >
              {option}
            </motion.button>
          );
        } else {
          // Default picklist chip style (with checkmark)
          return (
            <button
              key={option}
              type="button"
              onClick={() => handleToggle(option)}
              className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 focus:outline-none cursor-pointer",
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
          );
        }
      })}
    </div>
  );
};

export default PicklistChips; 