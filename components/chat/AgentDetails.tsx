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

export default function AgentDetails({ agent, isEditMode, icon = "🤖", onSave, onSourcesChange }: AgentDetailsProps) {
  const [editMode, setEditMode] = useState(isEditMode);
  const [researchQuestion, setResearchQuestion] = useState(agent.researchQuestion);
  const [questionType, setQuestionType] = useState<QuestionType>(agent.questionType);
  const [isRewritingAgent, setIsRewritingAgent] = useState(false);
  const [responseOptions, setResponseOptions] = useState<string[]>(
    agent.questionType === 'Picklist'
      ? ["Marketing Leadership", "Marketing Operations", "Growth Marketing", "Digital Marketing"]
      : []
  );
  const [newOption, setNewOption] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    // Reset response options if question type changes
    if (questionType === 'Picklist' && responseOptions.length === 0) {
      setResponseOptions(["Marketing Leadership", "Marketing Operations", "Growth Marketing", "Digital Marketing"]);
    }
    if (questionType !== 'Picklist') {
      setResponseOptions([]);
    }
  }, [questionType]);

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
    
    console.log('Question type change requested:', {
      newType,
      currentType: questionType,
      isEditMode: editMode,
      agentId: agent.id,
      agentTitle: agent.title
    });

    // If switching to Boolean, update immediately
    if (newType === 'Boolean') {
      setQuestionType(newType);
      setResearchQuestion(agent.researchQuestion);
      return;
    }

    // For Number and Picklist, show loading state
    setIsRewritingAgent(true);
    setQuestionType(newType);

    // Simulate AI rewriting delay
    setTimeout(() => {
      // Get the template for the new question type
      const template = agent.rewriteTemplates?.[newType as keyof typeof agent.rewriteTemplates];
      
      if (template) {
        console.log('Found template for type:', newType, template);
        setResearchQuestion(template);
      } else {
        console.log('No template found for type:', newType);
        // Use a default template if none provided
        const defaultTemplate = newType === 'Number' 
          ? `How many ${agent.title.toLowerCase()} positions has this company posted in the last 3 months?`
          : `What types of ${agent.title.toLowerCase()} positions has this company posted in the last 3 months?`;
        setResearchQuestion(defaultTemplate);
      }

      // Update data sources based on question type
      const newSources = agent.sourcesByQuestionType?.[newType] || agent.sources || [];
      if (typeof onSourcesChange === 'function') {
        onSourcesChange(newSources);
      }

      setIsRewritingAgent(false);
    }, 2500); // 2.5 second delay for AI rewriting
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
            {(['Boolean', 'Number', 'Picklist'] as QuestionType[]).map(type => {
              const isSelected = questionType === type;
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

        {/* Picklist Response Options (no add/remove, muted chips) */}
        {(showPicklistOptions || (!editMode && questionType === 'Picklist')) && (
          <div className="bg-gray-50/50 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Picklist Response Options</h3>
            <PicklistChips options={responseOptions} />
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