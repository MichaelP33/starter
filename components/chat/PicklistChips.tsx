import React from "react";

const CATEGORY_COLORS: Record<string, string> = {
  "Marketing Leadership": "bg-purple-100 text-purple-800 border border-purple-200",
  "Marketing Operations": "bg-blue-100 text-blue-800 border border-blue-200",
  "Growth Marketing": "bg-green-100 text-green-800 border border-green-200",
  "Digital Marketing": "bg-orange-100 text-orange-800 border border-orange-200"
};

interface PicklistChipsProps {
  options: string[];
  className?: string;
}

const PicklistChips: React.FC<PicklistChipsProps> = ({ options, className }) => {
  if (!options || options.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-1 ${className || ""}`}>
      {options.map((option) => (
        <span
          key={option}
          className={`px-2 py-0.5 rounded-full text-xs font-semibold border shadow-sm ${CATEGORY_COLORS[option] || "bg-gray-100 text-gray-800 border border-gray-200"}`}
        >
          {option}
        </span>
      ))}
    </div>
  );
};

export default PicklistChips; 