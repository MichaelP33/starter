"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronRight, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CompanyAnalysisPanelProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
}

// Mock data for different companies
const companyAnalysisData: Record<string, any> = {
  "Stripe": {
    answer: "Yes",
    shortAnswer: "Stripe has current openings for Head of Americas Field Marketing, Head of Content Marketing, and Program Lead for Startups with marketing responsibilities.",
    longAnswer: [
      {
        title: "Head of Americas Field Marketing:",
        description: "Leads regional marketing strategy focusing on startups to Fortune 500 companies. Requires experience in data-driven marketing, collaboration with sales teams, and ambiguity management[2]."
      },
      {
        title: "Head of Content Marketing:",
        description: "Oversees content strategy to engage users and prospects through innovative campaigns[4]."
      },
      {
        title: "Program Lead, Stripe Startups:",
        description: "Manages marketing strategies for early-stage companies, including campaigns and sales enablement[5]."
      }
    ],
    reasoning: "The analysis identified multiple marketing leadership positions currently posted on Stripe's careers page. These roles demonstrate active expansion of their marketing organization, particularly in field marketing, content strategy, and startup-focused initiatives. The positions require significant marketing experience and indicate budget allocation for senior marketing talent, making Stripe a qualified prospect for marketing-focused solutions."
  },
  "Notion": {
    answer: "Yes",
    shortAnswer: "Notion has 3 open marketing leadership positions including VP Marketing, Senior Growth Marketing Manager, and Marketing Operations Lead.",
    longAnswer: [
      {
        title: "VP Marketing:",
        description: "Senior leadership role overseeing all marketing functions including brand, growth, and product marketing. Requires 8+ years of marketing leadership experience[1]."
      },
      {
        title: "Senior Growth Marketing Manager:",
        description: "Focuses on user acquisition, conversion optimization, and growth experiments across multiple channels[2]."
      },
      {
        title: "Marketing Operations Lead:",
        description: "Manages marketing technology stack, attribution modeling, and campaign performance analytics[3]."
      }
    ],
    reasoning: "Notion is actively expanding their marketing organization with senior-level positions that indicate significant investment in marketing capabilities. The VP Marketing role suggests executive-level commitment to marketing growth, while the Growth Marketing and Marketing Operations roles demonstrate focus on data-driven marketing approaches."
  },
  "Supabase": {
    answer: "Yes",
    shortAnswer: "Supabase is actively recruiting Marketing Operations and Digital Marketing specialists, plus a Developer Marketing Manager role.",
    longAnswer: [
      {
        title: "Marketing Operations Manager:",
        description: "Responsible for marketing automation, lead scoring, and campaign attribution across the developer funnel[1]."
      },
      {
        title: "Digital Marketing Specialist:",
        description: "Manages paid acquisition campaigns, SEO strategy, and content distribution for developer audiences[2]."
      },
      {
        title: "Developer Marketing Manager:",
        description: "Creates technical content, manages developer community engagement, and coordinates with product teams[3]."
      }
    ],
    reasoning: "Supabase's hiring pattern shows focus on specialized marketing roles tailored to their developer audience. The Marketing Operations role indicates investment in marketing infrastructure, while the Developer Marketing position demonstrates understanding of their technical customer base. This suggests budget allocation for sophisticated marketing approaches."
  }
};

export function CompanyAnalysisPanel({
  isOpen,
  onClose,
  companyName,
}: CompanyAnalysisPanelProps) {
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);

  const analysisData = companyAnalysisData[companyName] || companyAnalysisData["Stripe"];

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
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0">
              <h2 className="text-xl font-semibold text-gray-900">
                {companyName} Analysis
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
            <div className="p-6 space-y-6">
              {/* Answer */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  ANSWER
                </div>
                <div className="text-lg font-medium text-green-600">
                  {analysisData.answer}
                </div>
              </div>

              {/* Short Answer */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  SHORT ANSWER
                </div>
                <div className="text-gray-800 leading-relaxed">
                  {analysisData.shortAnswer}
                </div>
              </div>

              {/* Long Answer */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  LONG ANSWER
                </div>
                <div className="space-y-4 text-gray-800 leading-relaxed">
                  {analysisData.longAnswer.map((item: any, index: number) => (
                    <div key={index}>
                      <span className="font-semibold">{item.title}</span> {item.description}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sources - Redesigned */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  SOURCES
                </div>
                <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">Marketing Leadership Positions</span>
                        <ExternalLink className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <a 
                          href={`https://${companyName.toLowerCase()}.com`} 
                          className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors duration-200"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {companyName.toLowerCase()}.com
                        </a>
                        <div className="text-xs text-gray-600">
                          Official career page
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reasoning - Collapsible */}
              <div className="space-y-2">
                <button
                  onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-700 transition-colors"
                >
                  {isReasoningExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  REASONING
                </button>
                
                <AnimatePresence>
                  {isReasoningExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
                        <div className="text-sm text-gray-800 leading-relaxed">
                          {analysisData.reasoning}
                        </div>
                        
                        {/* Model Attribution */}
                        <div className="text-xs text-gray-400 pt-2 border-t border-gray-200">
                          Model: perplexity-reasoning
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}