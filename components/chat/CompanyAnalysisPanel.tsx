"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronRight, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AgentResult } from "./types";

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
  console.log('[CompanyAnalysisPanel] Option:', option, 'at index:', optionIndex, '-> color index:', optionIndex % SOFT_PASTEL_COLORS.length);
  return SOFT_PASTEL_COLORS[optionIndex % SOFT_PASTEL_COLORS.length];
}
// --- End: Shared color logic ---

interface CompanyAnalysisPanelProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  result?: AgentResult;
}

export function CompanyAnalysisPanel({
  isOpen,
  onClose,
  companyName,
  result
}: CompanyAnalysisPanelProps) {
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);

  if (!result) {
    return null;
  }

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
          
          {/* Side Panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-[40%] bg-white shadow-xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-blue-50 sticky top-0">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {companyName} Analysis
                </h2>
                {/* Removed picklist chips from header for cleaner look */}
              </div>
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
            <div className="p-6 space-y-8 border-l-4 border-blue-500 bg-white">
              {/* Answer */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  ANSWER
                </div>
                {/* Show chips for Picklist, Yes/No for Boolean, number for Number */}
                {result.questionType === 'Picklist' && Array.isArray(result.selectedOptions) && result.selectedOptions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.selectedOptions.map((option, index) => (
                      <span
                        key={option}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getColorClass(option, index)}`}
                      >
                        {option}
                      </span>
                    ))}
                  </div>
                ) : result.questionType === 'Number' && result.researchSummary ? (
                  <div className="text-lg font-medium text-blue-700">
                    {result.researchSummary}
                  </div>
                ) : (
                  <div className={`text-lg font-medium ${result.qualified ? 'text-green-600' : 'text-red-500'}`}> 
                    {result.qualified ? 'Yes' : 'No'}
                  </div>
                )}
              </div>

              {/* Research Summary */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  RESEARCH SUMMARY
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-gray-800 leading-relaxed">
                    {result.researchSummary}
                  </div>
                </div>
              </div>

              {/* Evidence */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  EVIDENCE
                </div>
                <div className="space-y-4 text-gray-800 leading-relaxed">
                  {result.evidence.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="font-semibold text-gray-900">{item.title}</div>
                      <div className="text-gray-700 mt-1">{item.description}</div>
                      <div className="text-sm text-gray-500 mt-2">
                        Source: {item.source} • Confidence: {Math.round(item.confidence * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Sources */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  DATA SOURCES
                </div>
                <div className="space-y-2">
                  {result.dataSources.map((source, index) => (
                    <div key={index} className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{source}</span>
                            <ExternalLink className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}