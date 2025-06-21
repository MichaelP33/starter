"use client";

import { motion } from "framer-motion";
import { User, Sparkles, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Persona } from "./types";

interface PersonaModificationCardProps {
  persona: Persona;
  onSave: (modifiedData: { name: string; description: string; titles: string[] }) => void;
  onCancel: () => void;
}

type TargetingScope = 'precise' | 'expand' | 'senior';

const scopeDescriptions = {
  precise: "Current exact title matching",
  expand: "Include related titles and broader role interpretations",
  senior: "Target more senior/executive variations and decision-makers"
};

export function PersonaModificationCard({ persona, onSave, onCancel }: PersonaModificationCardProps) {
  const [targetingScope, setTargetingScope] = useState<TargetingScope>('precise');
  const [currentTitles, setCurrentTitles] = useState<string[]>([]);
  const [currentDescription, setCurrentDescription] = useState("");
  const [currentName, setCurrentName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [isAddingTitle, setIsAddingTitle] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);

  useEffect(() => {
    handleScopeChange(targetingScope, true);
  }, [persona, targetingScope]);

  const handleScopeChange = (scope: TargetingScope, initial = false) => {
    if (scope === targetingScope && !initial) return;
    
    if (!initial) {
      setIsRewriting(true);
    }
    setTargetingScope(scope);
    
    const updateContent = () => {
      switch (scope) {
        case 'expand':
          setCurrentName(persona.expandedName);
          setCurrentDescription(persona.expandedDescription);
          setCurrentTitles(persona.expandedTitles);
          break;
        case 'senior':
          setCurrentName(persona.seniorName);
          setCurrentDescription(persona.expandedDescription);
          setCurrentTitles(persona.expandedTitles);
          break;
        default: // 'precise'
          setCurrentName(persona.name);
          setCurrentDescription(persona.description);
          setCurrentTitles(persona.titles);
      }
      if (!initial) {
        setIsRewriting(false);
      }
    };
    
    if (initial) {
      updateContent();
    } else {
      setTimeout(updateContent, 1000);
    }
  };

  const handleAddTitle = () => {
    if (newTitle.trim()) {
      setCurrentTitles([...currentTitles, newTitle.trim()]);
      setNewTitle("");
      setIsAddingTitle(false);
    }
  };

  const handleRemoveTitle = (index: number) => {
    setCurrentTitles(currentTitles.filter((_, i) => i !== index));
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
              <input
                value={currentName}
                onChange={(e) => setCurrentName(e.target.value)}
                className="text-2xl font-semibold w-full bg-transparent border-none focus:ring-0 p-0"
              />
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
                  {currentDescription}
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
                    {currentTitles.map((title, index) => (
                      <motion.div
                        key={`${title}-${index}`}
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

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={onCancel}>Cancel</Button>
              <Button 
                onClick={() => onSave({ 
                  name: currentName, 
                  description: currentDescription, 
                  titles: currentTitles 
                })}
                className="bg-[#6366f1] hover:bg-[#6366f1]/90 text-white"
              >
                Save Persona Targeting
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}