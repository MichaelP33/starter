"use client";

import { motion } from "framer-motion";
import { User, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PersonaModificationCardProps {
  persona: {
    id: string;
    title: string;
    description: string;
  };
  onSave: () => void;
  onCancel: () => void;
}

type TargetingScope = 'precise' | 'expand' | 'senior';

const baseTitles = [
  "Chief Marketing Officer (CMO)",
  "VP of Marketing", 
  "VP of Brand Strategy",
  "Head of Marketing",
  "Marketing Executive",
  "VP of Strategic Marketing",
  "Chief Brand Officer",
  "Senior VP of Marketing",
  "Director of Marketing Strategy",
  "VP of Corporate Marketing"
];

const expandedTitles = [
  ...baseTitles,
  "Director of Digital Marketing",
  "Senior Marketing Manager",
  "Marketing Lead",
  "Digital Marketing Director",
  "Marketing Operations Director",
  "Growth Marketing Director",
  "Brand Marketing Manager",
  "Product Marketing Director"
];

const seniorFocusTitles = [
  "Chief Marketing Officer (CMO)",
  "Chief Brand Officer",
  "VP of Marketing", 
  "VP of Brand Strategy",
  "VP of Strategic Marketing",
  "Senior VP of Marketing",
  "Executive VP of Marketing",
  "Director of Marketing Strategy",
  "VP of Corporate Marketing",
  "Chief Revenue Officer",
  "Chief Growth Officer",
  "Executive Director of Marketing"
];

const scopeDescriptions = {
  precise: "Current exact title matching",
  expand: "Include related titles and broader role interpretations",
  senior: "Target more senior/executive variations and decision-makers"
};

const roleDescriptions = {
  precise: "C-level or VP-level marketing leader who sets the strategic direction for the entire marketing organization. Responsible for brand positioning, competitive strategy, and cross-functional initiatives with board-level accountability. Has executive authority over marketing budgets, major technology investments, and strategic partnerships. Focuses on long-term growth strategy, market positioning, and organizational alignment while managing stakeholder relationships and driving company-wide marketing transformation.",
  
  expand: "Marketing leader at director level or above who influences strategic marketing decisions and has significant budget authority. Includes both C-level executives and senior directors who drive marketing strategy, oversee major campaigns, and manage marketing technology investments. Responsible for growth initiatives, brand positioning, and cross-functional collaboration with sales and product teams. May include emerging leadership roles in digital marketing, growth marketing, and marketing operations.",
  
  senior: "Executive-level marketing leader with C-suite or senior VP authority who drives enterprise-wide marketing strategy and transformation. Focuses on board-level marketing executives with ultimate decision-making power over marketing budgets, technology investments, and strategic partnerships. Includes Chief Marketing Officers, Chief Brand Officers, Chief Revenue Officers, and Executive VPs who report directly to the CEO and have company-wide influence over marketing direction and organizational change."
};

export function PersonaModificationCard({ persona, onSave, onCancel }: PersonaModificationCardProps) {
  const [targetingScope, setTargetingScope] = useState<TargetingScope>('precise');
  const [titles, setTitles] = useState(baseTitles);
  const [roleDescription, setRoleDescription] = useState(roleDescriptions.precise);
  const [newTitle, setNewTitle] = useState("");
  const [isAddingTitle, setIsAddingTitle] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);

  const handleScopeChange = (scope: TargetingScope) => {
    if (scope === targetingScope) return;
    
    setIsRewriting(true);
    setTargetingScope(scope);
    
    // Simulate AI rewriting delay
    setTimeout(() => {
      switch (scope) {
        case 'expand':
          setTitles(expandedTitles);
          setRoleDescription(roleDescriptions.expand);
          break;
        case 'senior':
          setTitles(seniorFocusTitles);
          setRoleDescription(roleDescriptions.senior);
          break;
        default:
          setTitles(baseTitles);
          setRoleDescription(roleDescriptions.precise);
      }
      setIsRewriting(false);
    }, 2000);
  };

  const handleAddTitle = () => {
    if (newTitle.trim()) {
      setTitles([...titles, newTitle.trim()]);
      setNewTitle("");
      setIsAddingTitle(false);
    }
  };

  const handleRemoveTitle = (index: number) => {
    setTitles(titles.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTitle();
    } else if (e.key === 'Escape') {
      setIsAddingTitle(false);
      setNewTitle("");
    }
  };

  const renderTargetingChip = (scope: TargetingScope, label: string) => {
    const isSelected = scope === targetingScope;
    const showSparkle = scope !== 'precise';

    const chipContent = (
      <button
        onClick={() => handleScopeChange(scope)}
        disabled={isRewriting}
        className={`
          inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 
          ${isSelected
            ? 'bg-purple-600 text-white shadow-sm'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
          ${isRewriting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {showSparkle && !isSelected && (
          <Sparkles className="w-4 h-4 mr-2" />
        )}
        {label}
      </button>
    );

    if (showSparkle && !isSelected) {
      return (
        <Tooltip key={scope}>
          <TooltipTrigger asChild>
            {chipContent}
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="bg-gray-800 text-white border-gray-700 shadow-lg"
          >
            <p>{scopeDescriptions[scope]}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return <div key={scope}>{chipContent}</div>;
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8"
      >
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">{persona.title} - Targeting Options</h2>
            </div>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed">
              Adjust how broadly or specifically you want to target this persona across your qualified companies.
            </p>

            {/* Targeting Scope */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Targeting Scope</h3>
              <div className="flex gap-3">
                {renderTargetingChip('precise', 'Precise')}
                {renderTargetingChip('expand', 'Expand Reach')}
                {renderTargetingChip('senior', 'Senior Focus')}
              </div>
            </div>

            {/* About This Role - Dynamic Content */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">About This Role</h3>
                {isRewriting && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-sm text-purple-600 font-medium"
                  >
                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    Updating role definition...
                  </motion.div>
                )}
              </div>
              
              {isRewriting ? (
                // Loading state for role description
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-11/12" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-10/12" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-9/12" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-8/12" />
                </div>
              ) : (
                <motion.p 
                  key={targetingScope} // Key ensures re-animation when scope changes
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-gray-700 leading-relaxed"
                >
                  {roleDescription}
                </motion.p>
              )}
            </div>

            {/* Example Titles */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">Example Titles</h3>
                {isRewriting && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-sm text-purple-600 font-medium"
                  >
                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    Generating new titles...
                  </motion.div>
                )}
              </div>
              
              <motion.div 
                key={targetingScope} // Key ensures re-animation when scope changes
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-wrap gap-2"
              >
                {isRewriting ? (
                  // Show loading state
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-8 bg-gray-200 rounded-full animate-pulse"
                        style={{ width: `${Math.random() * 100 + 80}px` }}
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    {titles.map((title, index) => (
                      <motion.div
                        key={`${targetingScope}-${index}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative"
                      >
                        <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-800 border border-blue-200">
                          {title}
                          <button
                            onClick={() => handleRemoveTitle(index)}
                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-blue-900"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      </motion.div>
                    ))}
                    
                    {/* Add Title Button/Input */}
                    {isAddingTitle ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center"
                      >
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          onKeyDown={handleKeyPress}
                          onBlur={() => {
                            if (!newTitle.trim()) {
                              setIsAddingTitle(false);
                            }
                          }}
                          placeholder="Enter title..."
                          className="px-3 py-2 text-sm border border-blue-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => setIsAddingTitle(true)}
                        className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 transition-colors duration-200"
                      >
                        + Add Title
                      </button>
                    )}
                  </>
                )}
              </motion.div>
            </div>

            {/* Save/Cancel buttons */}
            <div className="flex gap-3 pt-4 border-t border-muted/20">
              <Button 
                onClick={onSave} 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isRewriting}
              >
                Save Changes
              </Button>
              <Button 
                variant="outline" 
                onClick={onCancel}
                disabled={isRewriting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}