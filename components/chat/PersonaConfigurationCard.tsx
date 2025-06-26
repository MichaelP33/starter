"use client";

import { motion } from "framer-motion";
import { User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Persona } from "./types";

interface PersonaConfigurationCardProps {
  persona: Persona;
  onAddThisPersona: () => void;
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

export function PersonaConfigurationCard({ persona, onAddThisPersona }: PersonaConfigurationCardProps) {
  const [searchMode, setSearchMode] = useState<'strict' | 'creative'>('strict');

  return (
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
            <h2 className="text-2xl font-semibold">{persona.expandedName}</h2>
          </div>

          {/* About This Role */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">About This Role</h3>
            <p className="text-gray-700 leading-relaxed">
              {persona.expandedDescription}
            </p>
          </div>

          {/* Example Titles */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Example Titles</h3>
            <div className="flex flex-wrap gap-2">
              {persona.expandedTitles.map((title, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative"
                >
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                    {title}
                  </span>
                </motion.div>
              ))}
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

          {/* Add This Persona Button */}
          <div className="pt-4 border-t border-gray-200">
            <Button 
              onClick={onAddThisPersona}
              className="w-full bg-[#6366f1] hover:bg-[#6366f1]/90 text-white h-12 text-base font-medium"
            >
              Add This Persona
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}