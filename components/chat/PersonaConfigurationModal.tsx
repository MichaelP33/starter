"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PersonaConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const personaTitles = [
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

export function PersonaConfigurationModal({
  isOpen,
  onClose,
}: PersonaConfigurationModalProps) {
  const [searchMode, setSearchMode] = useState<'strict' | 'creative'>('strict');
  const [titles, setTitles] = useState(personaTitles);
  const [newTitle, setNewTitle] = useState("");
  const [isAddingTitle, setIsAddingTitle] = useState(false);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-[50%] bg-white shadow-xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0">
              <h2 className="text-xl font-semibold text-gray-900">
                Strategic Marketing Executive
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* About This Role */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">About This Role</h3>
                <p className="text-gray-700 leading-relaxed">
                  C-level or VP-level marketing leader who sets the strategic direction for the entire marketing organization. 
                  Responsible for brand positioning, competitive strategy, and cross-functional initiatives with board-level accountability. 
                  Has executive authority over marketing budgets, major technology investments, and strategic partnerships. 
                  Focuses on long-term growth strategy, market positioning, and organizational alignment while managing stakeholder 
                  relationships and driving company-wide marketing transformation.
                </p>
              </div>

              {/* Example Titles */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Example Titles</h3>
                <div className="flex flex-wrap gap-2">
                  {titles.map((title, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
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
                </div>
              </div>

              {/* AI Search Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">AI Search Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="searchMode"
                      value="strict"
                      checked={searchMode === 'strict'}
                      onChange={(e) => setSearchMode(e.target.value as 'strict' | 'creative')}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-gray-900">
                        Strict Mode (fewer matches, higher accuracy)
                      </span>
                      <p className="text-xs text-gray-600">
                        Only matches exact titles and closely related variations
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="searchMode"
                      value="creative"
                      checked={searchMode === 'creative'}
                      onChange={(e) => setSearchMode(e.target.value as 'strict' | 'creative')}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-gray-900">
                        Creative Mode (more matches, potential false positives)
                      </span>
                      <p className="text-xs text-gray-600">
                        Includes broader interpretations and related roles
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="border-t border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Next: Growth Marketing Leader
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#6366f1] hover:bg-[#6366f1]/90 text-white"
                    onClick={onClose}
                  >
                    Add This Persona
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}