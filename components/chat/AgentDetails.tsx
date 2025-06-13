"use client";

import React from "react";
import { Agent, QuestionType, SourceOption } from "./types";
import { motion } from "framer-motion";
import { useState } from "react";
import { Pencil, FileText, Briefcase, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AgentDetailsProps {
  agent: Agent;
  isEditMode?: boolean;
}

const questionTypes: QuestionType[] = ['Boolean', 'Number', 'Picklist'];

const sourceOptions: SourceOption[] = [
  { id: 'career-page', label: 'Company Career Page', isSelected: true },
  { id: 'linkedin', label: 'LinkedIn Postings', isSelected: false },
  { id: 'job-boards', label: '3rd Party Job Boards', isSelected: false },
];

const sourceIcons = {
  'career-page': FileText,
  'linkedin': Briefcase,
  'job-boards': Globe,
};

const questionTypeTooltips = {
  'Number': 'Rewrite agent as a number question',
  'Picklist': 'Rewrite agent as a picklist question',
};

const questionTemplates = {
  'Boolean': "Does the company currently have any open job positions specifically for Marketing Leadership, Operations, Growth Marketing, or Digital Marketing roles posted on their official careers page or LinkedIn?",
  'Number': "How many data-driven marketing leadership positions does the company currently have posted? Focus on roles involving marketing operations, growth marketing, performance marketing, or marketing analytics - excluding traditional brand, creative, or event marketing roles.",
  'Picklist': "What types of data-centric marketing roles is the company currently hiring for? Categories: Marketing Operations, Growth Marketing, Performance Marketing, Marketing Analytics."
};

// AI Loading Component
function AILoadingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 text-purple-600 font-medium"
    >
      <div className="relative">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 w-5 h-5 border border-purple-300 rounded-full"
        />
      </div>
      <span className="text-sm">AI is rewriting the agent...</span>
    </motion.div>
  );
}

export function AgentDetails({ agent, isEditMode = false }: AgentDetailsProps) {
  const [editMode, setEditMode] = useState(isEditMode);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [researchQuestion, setResearchQuestion] = useState(
    agent.researchQuestion || questionTemplates.Boolean
  );
  const [questionType, setQuestionType] = useState<QuestionType>(agent.questionType as QuestionType || 'Boolean');
  const [sources, setSources] = useState<SourceOption[]>(sourceOptions);
  const [isRewritingAgent, setIsRewritingAgent] = useState(false);

  // Update edit mode when prop changes
  React.useEffect(() => {
    setEditMode(isEditMode);
  }, [isEditMode]);

  const handleSourceToggle = (sourceId: string) => {
    if (editMode) {
      setSources(prev => 
        prev.map(source => 
          source.id === sourceId 
            ? { ...source, isSelected: !source.isSelected }
            : source
        )
      );
    }
  };

  const handleSaveChanges = () => {
    setEditMode(false);
    setIsEditingQuestion(false);
    setIsRewritingAgent(false);
    // Here you would typically save the changes to your state management or API
    console.log('Saving changes:', { researchQuestion, questionType, sources });
  };

  const handleCancel = () => {
    setEditMode(false);
    setIsEditingQuestion(false);
    setIsRewritingAgent(false);
    // Reset to original values
    setResearchQuestion(agent.researchQuestion || questionTemplates.Boolean);
    setQuestionType(agent.questionType as QuestionType || 'Boolean');
    setSources(sourceOptions);
  };

  const handleQuestionTypeChange = (type: QuestionType) => {
    if (editMode && type !== questionType) {
      // Show loading for Number and Picklist types
      if (type === 'Number' || type === 'Picklist') {
        setIsRewritingAgent(true);
        
        // Simulate AI rewriting delay (2-3 seconds)
        setTimeout(() => {
          setQuestionType(type);
          setResearchQuestion(questionTemplates[type]);
          setIsRewritingAgent(false);
        }, 2500);
      } else {
        // Immediate change for Boolean
        setQuestionType(type);
        setResearchQuestion(questionTemplates[type]);
      }
    }
  };

  const renderQuestionTypeChip = (type: QuestionType) => {
    const isSelected = type === questionType;
    const needsTooltip = editMode && !isSelected && (type === 'Number' || type === 'Picklist');
    const isDisabled = isRewritingAgent;

    const chipContent = (
      <button
        onClick={() => handleQuestionTypeChange(type)}
        disabled={!editMode || isDisabled}
        className={`
          inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 
          ${editMode && !isDisabled ? 'cursor-pointer' : 'cursor-default'}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isSelected
            ? editMode 
              ? 'bg-purple-600 text-white shadow-sm' // Full vibrant purple in edit mode
              : 'bg-purple-600/30 text-purple-800 shadow-sm' // 30% opacity in default mode
            : editMode
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'hidden' // Hide unselected chips in default mode
          }
        `}
      >
        {!isSelected && editMode && !isDisabled && (
          <span className="mr-2">✨</span>
        )}
        {type}
      </button>
    );

    if (needsTooltip && !isDisabled) {
      return (
        <Tooltip key={type}>
          <TooltipTrigger asChild>
            {chipContent}
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="bg-gray-800 text-white border-gray-700 shadow-lg"
          >
            <p>{questionTypeTooltips[type as keyof typeof questionTypeTooltips]}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return <div key={type}>{chipContent}</div>;
  };

  return (
    <TooltipProvider>
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-8"
        >
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">{agent.title}</h2>
              <p className="text-lg text-muted-foreground">{agent.description}</p>
            </div>

            <div className="space-y-8">
              {/* Research Question Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Research Question</h3>
                  {editMode && !isRewritingAgent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingQuestion(!isEditingQuestion)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="bg-muted/10 p-6 rounded-lg border border-muted/20">
                  {isRewritingAgent ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <AILoadingIndicator />
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-11/12" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-10/12" />
                      </div>
                    </motion.div>
                  ) : editMode && isEditingQuestion ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Textarea
                        value={researchQuestion}
                        onChange={(e) => setResearchQuestion(e.target.value)}
                        className="min-h-[100px] text-sm bg-white"
                        placeholder="Enter your research question..."
                      />
                    </motion.div>
                  ) : (
                    <motion.p 
                      key={researchQuestion} // Key ensures re-animation when question changes
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-muted-foreground"
                    >
                      {researchQuestion}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Question Type Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">Question Type</h3>
                  {isRewritingAgent && (
                    <AILoadingIndicator />
                  )}
                </div>
                <p className="text-sm text-gray-600">How should the agent respond?</p>
                <div className="bg-white p-4 rounded-lg border border-muted/20">
                  <div className="flex gap-3">
                    {questionTypes.map(renderQuestionTypeChip)}
                  </div>
                </div>
              </div>

              {/* Sources Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sources</h3>
                <p className="text-sm text-gray-600">Data sources for research</p>
                <div className="bg-white p-4 rounded-lg border border-muted/20">
                  <div className="flex flex-wrap gap-3">
                    {editMode ? (
                      // Show all sources when in edit mode
                      sources.map((source) => {
                        const IconComponent = sourceIcons[source.id as keyof typeof sourceIcons];
                        return (
                          <button
                            key={source.id}
                            onClick={() => handleSourceToggle(source.id)}
                            disabled={isRewritingAgent}
                            className={`
                              inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer hover:scale-105
                              ${isRewritingAgent ? 'opacity-50 cursor-not-allowed' : ''}
                              ${source.isSelected
                                ? 'bg-purple-600 text-white shadow-sm' // Full vibrant purple in edit mode
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }
                            `}
                          >
                            <IconComponent className="w-4 h-4 mr-2" />
                            {source.label}
                          </button>
                        );
                      })
                    ) : (
                      // Show only selected sources when not in edit mode with lighter background
                      sources
                        .filter(source => source.isSelected)
                        .map((source) => {
                          const IconComponent = sourceIcons[source.id as keyof typeof sourceIcons];
                          return (
                            <span
                              key={source.id}
                              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-600/30 text-purple-800 shadow-sm"
                            >
                              <IconComponent className="w-4 h-4 mr-2" />
                              {source.label}
                            </span>
                          );
                        })
                    )}
                  </div>
                </div>
              </div>

              {/* Save/Cancel buttons when in edit mode */}
              {editMode && (
                <div className="flex gap-3 pt-4 border-t border-muted/20">
                  <Button 
                    onClick={handleSaveChanges} 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isRewritingAgent}
                  >
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isRewritingAgent}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}