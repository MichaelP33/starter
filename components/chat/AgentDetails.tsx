"use client";

import React, { useState, useEffect, useRef } from "react";
import { Agent, QuestionType } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, FileText, Briefcase, Globe, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PicklistChips from "./PicklistChips";

interface AgentDetailsProps {
  agent: Agent;
  isEditMode: boolean;
  icon?: string;
  onSave?: (updates: { questionType: QuestionType; researchQuestion: string; selectedSources: string[]; responseOptions?: string[] }) => void;
  onSourcesChange?: (sources: string[]) => void;
  allAgents?: Agent[];
}

const questionTemplates: Record<QuestionType, string> = {
  Boolean: "Does the company...?",
  Number: "How many...?",
  Picklist: "What type of...?"
};

const sourceIcons = {
  "Company Career Pages": FileText,
  "Company Blog Posts": FileText,
  "Company Press Releases": FileText,
  "Company Case Studies": FileText,
  "Investor Relations Pages": FileText,
  "Company Social Media": Globe,
  "Executive LinkedIn Profiles": Briefcase,
  "Industry Publications": FileText,
  "Tech News Outlets": FileText,
  "Business News Publications": FileText,
  "Financial News Sources": FileText,
  "Trade Publications": FileText,
  "Professional Networks": Briefcase,
  "Job Posting Platforms": Briefcase,
  "Financial Data Platforms": FileText,
  "Business Intelligence Databases": FileText,
  "Industry Research Reports": FileText,
  "Product Discovery Platforms": FileText,
  "Developer Communities": Globe,
  "Conference Presentations": FileText
};

// Helper function to get default response options based on agent ID
const getDefaultResponseOptions = (agentId: string): string[] => {
  switch (agentId) {
    case 'marketing-hiring':
      return ["Marketing Leadership", "Marketing Operations", "Growth Marketing", "Digital Marketing"];
    case 'data-hiring':
      return ["Data Engineering", "Data Science", "Analytics", "Data Leadership"];
    default:
      return ["Option 1", "Option 2", "Option 3", "Option 4"];
  }
};

export default function AgentDetails({ agent, isEditMode, icon = "🤖", onSave, onSourcesChange, allAgents }: AgentDetailsProps) {
  // Debug logging
  console.log('AgentDetails received agent:', agent);
  console.log('Available question types:', agent.availableQuestionTypes);
  console.log('Current question type:', agent.questionType);

  const [editMode, setEditMode] = useState(isEditMode);
  const [researchQuestion, setResearchQuestion] = useState(agent.researchQuestion);
  const [questionType, setQuestionType] = useState<QuestionType>(agent.questionType);
  const [isRewritingAgent, setIsRewritingAgent] = useState(false);
  const [responseOptions, setResponseOptions] = useState<string[]>(
    agent.questionType === 'Picklist'
      ? agent.responseOptions || getDefaultResponseOptions(agent.id)
      : []
  );
  const [newOption, setNewOption] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [booleanQualification, setBooleanQualification] = useState<'true' | 'false'>('true');
  const [qualifyingOptions, setQualifyingOptions] = useState<string[]>(responseOptions || []);

  // Update sources when question type changes
  useEffect(() => {
    const newSources = agent.sourcesByQuestionType?.[questionType] || agent.sources || [];
    console.log('Updating sources for', questionType, ':', newSources);
  }, [questionType, agent]);

  // Sync selectedSources with agent.sources whenever agent.sources changes
  useEffect(() => {
  }, [agent.sources]);

  // Log agent data on mount and when it changes
  useEffect(() => {
    console.log('AgentDetails: Agent data updated:', {
      id: agent.id,
      title: agent.title,
      rewriteTemplates: agent.rewriteTemplates,
      currentQuestionType: questionType,
      currentResearchQuestion: researchQuestion,
      editMode,
    });
  }, [agent, questionType, researchQuestion, editMode]);

  // Update edit mode when prop changes
  useEffect(() => {
    console.log('AgentDetails: Edit mode prop changed:', isEditMode);
    setEditMode(isEditMode);
  }, [isEditMode]);

  // Sync local state with agent prop changes (for persisted data)
  useEffect(() => {
    setResearchQuestion(agent.researchQuestion);
    setQuestionType(agent.questionType);
    console.log('[AgentDetails] agent.responseOptions:', agent.responseOptions);
    if (agent.questionType === 'Picklist') {
      setResponseOptions(agent.responseOptions || getDefaultResponseOptions(agent.id));
      console.log('[AgentDetails] Setting responseOptions state to:', agent.responseOptions || getDefaultResponseOptions(agent.id));
    } else {
      setResponseOptions([]);
    }
  }, [agent.researchQuestion, agent.questionType, agent.responseOptions]);

  useEffect(() => {
    // Reset response options if question type changes
    if (questionType === 'Picklist' && responseOptions.length === 0) {
      setResponseOptions(getDefaultResponseOptions(agent.id));
    }
    if (questionType !== 'Picklist') {
      setResponseOptions([]);
    }
  }, [questionType]);

  useEffect(() => {
    setQualifyingOptions(responseOptions || []);
  }, [responseOptions]);

  const handleSaveChanges = () => {
    console.log('AgentDetails: Saving changes');
    setEditMode(false);
    if (typeof onSave === 'function') {
      onSave({
        questionType,
        researchQuestion,
        selectedSources: agent.sources,
        responseOptions: questionType === 'Picklist' ? responseOptions : undefined
      });
    }
  };

  const handleCancel = () => {
    console.log('AgentDetails: Canceling changes');
    setEditMode(false);
    setResearchQuestion(agent.researchQuestion);
    setQuestionType(agent.questionType);
  };

  const handleQuestionTypeChange = (newType: QuestionType) => {
    if (!editMode) return;
    // Find canonical agent config by id
    let canonicalAgent = agent;
    if (Array.isArray(allAgents)) {
      const found = allAgents.find(a => a.id === agent.id);
      if (found) canonicalAgent = found;
    }
    // Always use canonical templates for the new type
    const template = canonicalAgent.rewriteTemplates?.[newType as keyof typeof canonicalAgent.rewriteTemplates];
    setQuestionType(newType);
    if (template) {
      let cleanedTemplate = template;
      if (newType === 'Picklist') {
        cleanedTemplate = template.replace(/\s*Categories:.*$/, '');
      }
      setResearchQuestion(cleanedTemplate);
    } else {
      // Fallback to default
      setResearchQuestion(questionTemplates[newType]);
    }
    // Update sources
    const newSources = canonicalAgent.sourcesByQuestionType?.[newType] || canonicalAgent.sources || [];
    if (typeof onSourcesChange === 'function') {
      onSourcesChange(newSources);
    }
    if (newType === 'Picklist') {
      console.log('[AgentDetails] handleQuestionTypeChange: canonicalAgent.responseOptions:', canonicalAgent.responseOptions);
      setResponseOptions(canonicalAgent.responseOptions || getDefaultResponseOptions(agent.id));
    } else {
      setResponseOptions([]);
    }
  };

  const handleSourceToggle = (source: string) => {
    if (isRewritingAgent) return;
    let updated;
    if (agent.sources.includes(source)) {
      updated = agent.sources.filter(s => s !== source);
    } else {
      updated = [...agent.sources, source];
    }
    if (typeof onSourcesChange === 'function') {
      onSourcesChange(updated);
    }
  };

  const handleAddOption = (option: string) => {
    const trimmed = option.trim();
    if (trimmed && !responseOptions.includes(trimmed)) {
      setResponseOptions([...responseOptions, trimmed]);
    }
    setNewOption("");
    if (inputRef.current) inputRef.current.focus();
  };

  const handleRemoveOption = (optionToRemove: string) => {
    setResponseOptions(responseOptions.filter(option => option !== optionToRemove));
  };

  const renderQuestionTypeChip = (type: QuestionType) => {
    const isAvailable = agent.availableQuestionTypes?.includes(type) ?? true;
    const isSelected = questionType === type;
    const needsAI = type === 'Number' || type === 'Picklist';

    if (!isAvailable) return null;

    return (
      <button
        key={type}
        onClick={() => handleQuestionTypeChange(type)}
        disabled={!editMode || isRewritingAgent}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
          "flex items-center gap-2",
          isSelected ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          (!editMode || isRewritingAgent) && 'opacity-50 cursor-not-allowed',
          isRewritingAgent && type === questionType && 'animate-pulse'
        )}
      >
        {type}
        {needsAI && <Sparkles className="w-4 h-4" />}
      </button>
    );
  };

  // Get available sources for current question type
  const availableSources = agent.sourcesByQuestionType?.[questionType] || agent.sources || [];

  const showPicklistOptions = editMode && questionType === 'Picklist' && !isRewritingAgent;

  return (
    <div className="p-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <h2 className="text-2xl font-semibold">{agent.title}</h2>
          </div>
          <p className="text-muted-foreground">{agent.description}</p>
        </div>

        {/* Question Type Selection */}
        <div className="bg-gray-50/50 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Question Type</h3>
          <div className="flex flex-wrap gap-2">
            {(agent.availableQuestionTypes || []).map(type => {
              const isSelected = questionType === type;
              const needsAI = type === 'Number' || type === 'Picklist';
              return (
                <button
                  key={type}
                  onClick={() => handleQuestionTypeChange(type)}
                  disabled={!editMode || isRewritingAgent}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200",
                    isSelected
                      ? 'bg-blue-100 text-blue-800 border border-blue-200 shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-blue-50',
                    (!editMode || isRewritingAgent) && 'opacity-50 cursor-not-allowed',
                    isRewritingAgent && type === questionType && 'animate-pulse'
                  )}
                >
                  {type}
                  {(type === 'Number' || type === 'Picklist') && (
                    <Sparkles className="w-3 h-3 inline ml-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Research Question */}
        <div className="bg-gray-50/50 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Research Question</h3>
          <AnimatePresence mode="wait">
            {isRewritingAgent ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>🤖 AI is rewriting the research question...</span>
                </div>
                <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {editMode ? (
                  <textarea
                    value={researchQuestion}
                    onChange={(e) => setResearchQuestion(e.target.value)}
                    className="w-full h-24 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
                    placeholder="Enter your research question..."
                  />
                ) : (
                  <p className="text-gray-700 text-base leading-relaxed">{researchQuestion}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* After Research Question, before Data Sources */}
        {editMode && questionType === 'Boolean' && (
          <div className="bg-gray-50/50 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Qualification Criteria</h3>
            <p className="text-xs text-gray-500 mb-3">Which response should qualify leads for enrollment?</p>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="booleanQualification"
                  value="true"
                  checked={booleanQualification === 'true'}
                  onChange={() => setBooleanQualification('true')}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span>
                  <span className="text-sm font-medium text-gray-900">Yes/True responses qualify leads</span>
                  <div className="text-xs text-gray-600">Companies that answer 'Yes' to this question will be enrolled</div>
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="booleanQualification"
                  value="false"
                  checked={booleanQualification === 'false'}
                  onChange={() => setBooleanQualification('false')}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span>
                  <span className="text-sm font-medium text-gray-900">No/False responses qualify leads</span>
                  <div className="text-xs text-gray-600">Companies that answer 'No' to this question will be enrolled</div>
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Picklist Response Options (no add/remove, muted chips) */}
        {(showPicklistOptions || (!editMode && questionType === 'Picklist')) && (
          <div className="bg-gray-50/50 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Picklist Response Options</h3>
            {(() => { console.log('Rendering picklist chips with options:', responseOptions); return null; })()}
            {editMode ? (
              <>
                <div className="flex flex-wrap gap-2 items-center">
                  <PicklistChips
                    options={responseOptions}
                    onRemove={handleRemoveOption}
                  />
                </div>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleAddOption(newOption);
                  }}
                  className="flex items-center gap-2 mt-3 w-full max-w-sm"
                >
                  <span className="inline-flex items-center justify-center mr-2">
                    <svg width="16" height="16" fill="none" viewBox="0 0 20 20" className="w-4 h-4 text-gray-400"><path d="M10 4v12m6-6H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={newOption}
                    onChange={e => setNewOption(e.target.value)}
                    placeholder="Add response option..."
                    className="min-w-0 flex-1 px-3 py-2 rounded-full border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50/30"
                    maxLength={40}
                    onKeyDown={e => {
                      if (e.key === 'Escape') setNewOption("");
                    }}
                  />
                </form>
              </>
            ) : (
              <PicklistChips options={responseOptions} />
            )}
          </div>
        )}

        {/* After Picklist Response Options, before Data Sources */}
        {editMode && questionType === 'Picklist' && (
          <div className="bg-gray-50/50 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Qualification Criteria</h3>
            <p className="text-xs text-gray-500 mb-3">Select which response options should qualify leads for enrollment</p>
            <PicklistChips
              options={responseOptions}
              selectedOptions={qualifyingOptions}
              onToggle={(option, selected) => {
                setQualifyingOptions(selected
                  ? [...qualifyingOptions, option]
                  : qualifyingOptions.filter(o => o !== option)
                );
              }}
              variant="qualification"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">Leads will qualify if they match ANY of the selected options</p>
              <span className="text-xs text-gray-500">{qualifyingOptions.length} of {responseOptions.length} options selected for qualification</span>
            </div>
          </div>
        )}

        {/* Data Sources */}
        <div className="bg-gray-50/50 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Data Sources</h3>
          <div className="flex flex-wrap gap-2">
            {editMode ? (
              <PicklistChips
                options={availableSources}
                selectedOptions={agent.sources}
                onToggle={(source, selected) => handleSourceToggle(source)}
                onRemove={handleSourceToggle}
                variant="source"
              />
            ) :
              agent.sources.map((source) => (
                <span
                  key={source}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 shadow-sm"
                >
                  {source}
                </span>
              ))
            }
          </div>
        </div>

        {/* Action Buttons */}
        {editMode && (
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSaveChanges}
              disabled={isRewritingAgent}
              className={cn(
                "bg-purple-600 hover:bg-purple-700 text-white",
                isRewritingAgent && "opacity-50 cursor-not-allowed"
              )}
            >
              Save Changes
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isRewritingAgent}
              variant="outline"
              className={cn(
                "bg-gray-100 text-gray-700 hover:bg-gray-200",
                isRewritingAgent && "opacity-50 cursor-not-allowed"
              )}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}