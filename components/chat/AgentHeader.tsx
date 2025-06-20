import React from "react";
import { Agent, QuestionType } from "./types";
import { cn } from "@/lib/utils";
import PicklistChips from "./PicklistChips";

interface AgentHeaderProps {
  agent: Agent;
  icon?: string;
  showStats?: boolean;
  qualifiedCount?: number;
  totalCount?: number;
  responseOptions?: string[];
}

const questionTypeColors: Record<QuestionType, string> = {
  Boolean: "bg-green-100 text-green-800 border-green-200",
  Number: "bg-blue-100 text-blue-800 border-blue-200",
  Picklist: "bg-purple-100 text-purple-800 border-purple-200",
};

export const AgentHeader: React.FC<AgentHeaderProps> = ({
  agent,
  icon = "🤖",
  showStats = false,
  qualifiedCount,
  totalCount,
  responseOptions,
}) => {
  return (
    <div className="bg-gray-50/30 border border-gray-200 rounded-xl">
      {/* Header Section */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h2 className="text-xl font-semibold">{agent.title}</h2>
          <span className={cn(
            "px-2.5 py-1 text-sm border rounded-full",
            questionTypeColors[agent.questionType]
          )}>
            {agent.questionType}
          </span>
        </div>
        {showStats && (
          <div className="text-sm text-gray-600">
            {qualifiedCount} Qualified • {totalCount} Tested
          </div>
        )}
      </div>

      {/* Research Question */}
      <div className="px-6 pb-6 pt-2">
        <h3 className="text-xs font-medium text-gray-600 mb-2">Research Question</h3>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">{agent.researchQuestion}</p>
        
        {/* Picklist Response Options - directly under research question */}
        {agent.questionType === 'Picklist' && responseOptions && responseOptions.length > 0 && (
          <div>
            <PicklistChips options={responseOptions} />
          </div>
        )}
      </div>
    </div>
  );
}; 