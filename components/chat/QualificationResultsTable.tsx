"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AgentResult, EnrichmentOption, Agent } from './types';
import { CompanyAnalysisPanel } from "./CompanyAnalysisPanel";
import { motion } from "framer-motion";
import { CheckCircle2, ExternalLink, XCircle, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { AgentHeader } from './AgentHeader';
import { cn } from "@/lib/utils";
import PicklistChips from './PicklistChips';
import CompactPicklistChips from './CompactPicklistChips';

interface QualificationResultsTableProps {
  results: AgentResult[];
  allTestedCount: number;
  qualifiedCount: number;
  needsReviewCount?: number;
  companies: any[];
  activeTab: 'qualified' | 'needsReview' | 'all';
  setActiveTab: (tab: 'qualified' | 'needsReview' | 'all') => void;
  onViewAllResults?: () => void;
  agent: Agent;
  icon?: string;
}

const qualificationInsights: Record<string, string> = {
  "Stripe": "Currently hiring Marketing Operations Manager and Senior Growth Marketing roles",
  "Notion": "3 open marketing leadership positions including VP Marketing",
  "Supabase": "Actively recruiting Marketing Operations and Digital Marketing specialists"
};

const ResearchResultCell = ({ result, onViewDetails, compact = false }: { result: AgentResult; onViewDetails: (companyName: string) => void; compact?: boolean }) => {
  // Picklist question type: always use vertical stack
  if (result.questionType === 'Picklist') {
    const hasOptions = Array.isArray(result.selectedOptions) && result.selectedOptions.length > 0;
    const options = result.selectedOptions || [];
    return (
      <div className="flex flex-col items-start gap-2">
        <div className="flex flex-wrap items-start gap-1">
          {hasOptions ? (
            <CompactPicklistChips options={options} />
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
              No Relevant Hiring
            </span>
          )}
        </div>
        <button
          onClick={() => onViewDetails(result.companyName)}
          className="inline-flex items-center gap-0.5 text-xs text-blue-700 hover:text-blue-900 transition-colors p-0 h-auto min-h-0"
          style={{ lineHeight: 1 }}
        >
          View Details
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // Boolean question type: show Yes/No
  if (result.questionType === 'Boolean') {
    return (
      <div className="flex flex-col items-start gap-1">
        <span className={cn(
          "text-sm font-semibold",
          result.qualified ? "text-green-700" : "text-red-600"
        )}>
          {result.qualified ? 'Yes' : 'No'}
        </span>
        <button
          onClick={() => onViewDetails(result.companyName)}
          className="inline-flex items-center gap-0.5 text-xs text-blue-700 hover:text-blue-900 transition-colors p-0 h-auto min-h-0"
          style={{ lineHeight: 1 }}
        >
          View Details
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // Default: show research summary
  return (
    <div className="flex items-center justify-between w-full">
      <span className="text-sm text-gray-700 truncate">{result.researchSummary}</span>
      <button
        onClick={() => onViewDetails(result.companyName)}
        className="inline-flex items-center gap-0.5 text-sm text-primary hover:text-primary/80 transition-colors ml-2 flex-shrink-0"
      >
        View Details
        <ArrowUpRight className="w-3 h-3" />
      </button>
    </div>
  );
};

export function QualificationResultsTable({ results, allTestedCount, qualifiedCount, needsReviewCount, companies = [], activeTab, setActiveTab, onViewAllResults, agent, icon }: QualificationResultsTableProps) {
  console.log('📊 Results received by UI:', results.map(r => ({
    companyName: r.companyName,
    whyQualified: r.whyQualified,
    researchSummary: r.researchSummary,
    evidence: r.evidence
  })));

  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleViewDetails = (companyName: string) => {
    setSelectedCompany(companyName);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedCompany(null);
  };

  const selectedResult = selectedCompany 
    ? results.find(r => r.companyName === selectedCompany)
    : undefined;

  const truncateText = (text: string, maxLength: number = 50) => {
    console.log('Truncating text:', {
      originalLength: text.length,
      maxLength,
      willTruncate: text.length > maxLength
    });

    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const isBoolean = agent.questionType === 'Boolean';
  const columns = [
    { id: "companyName", label: "Company Name", icon: "🏢", field: "companyName", minWidth: "180px" },
    { id: "researchResults", label: "Research Results", icon: "🔍", field: "researchSummary", minWidth: isBoolean ? "80px" : "320px", maxWidth: isBoolean ? "120px" : undefined },
    { id: "website", label: "Website", icon: "🌐", field: "website", minWidth: "140px" },
    { id: "industry", label: "Industry", icon: "🏭", field: "industry", minWidth: "120px" },
    { id: "hqCountry", label: "HQ Country", icon: "🌍", field: "hqCountry", minWidth: "110px" },
    { id: "employeeCount", label: "Employee Count", icon: "👥", field: "employeeCount", minWidth: "110px" },
    { id: "confidence", label: "Confidence", icon: "📊", field: "confidence", minWidth: "100px" }
  ];

  const renderResearchResultsCell = (result: AgentResult) => {
    const fullText = result.whyQualified;
    const truncatedText = truncateText(fullText);
    return (
      <div className="group relative">
        <div className="text-sm leading-relaxed">
          <div className="flex items-start gap-2">
            <p className="text-gray-900 flex-1">
              {truncatedText}
              <button
                onClick={() => handleViewDetails(result.companyName)}
                className="ml-1 text-gray-500 hover:text-gray-800 text-xs inline-flex items-center"
              >
                See More
                <ExternalLink className="w-3 h-3 ml-1" />
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderCompanyNameCell = (result: AgentResult) => {
    return (
      <div className="flex items-center gap-3">
        {result.needsReview ? (
          <div className="w-4 h-4 bg-yellow-500 rounded-full flex-shrink-0 flex items-center justify-center">
            <span className="text-white text-xs font-bold">!</span>
          </div>
        ) : result.qualified ? (
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {result.companyName}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {result.website}
          </p>
        </div>
      </div>
    );
  };

  const filteredResults = activeTab === 'qualified' 
    ? results.filter(r => r.qualified && !r.needsReview) 
    : activeTab === 'needsReview' 
    ? results.filter(r => r.needsReview) 
    : results;

  // Default response options for Picklist agents
  const defaultResponseOptions = [
    "Marketing Leadership", 
    "Marketing Operations", 
    "Growth Marketing", 
    "Digital Marketing"
  ];

  // Clean up research question by removing redundant categories text
  const cleanedAgent = {
    ...agent,
    researchQuestion: agent.researchQuestion.replace(/\s*Categories:.*$/, '')
  };

  return (
    <div className="border border-t-0 border-gray-200 bg-white">
      <AgentHeader
        agent={cleanedAgent}
        icon={icon}
        showStats={true}
        qualifiedCount={qualifiedCount}
        totalCount={allTestedCount}
        responseOptions={agent.questionType === 'Picklist' ? (agent.responseOptions || defaultResponseOptions) : undefined}
      />

      {/* Modern Segmented Control Tabs */}
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="inline-flex bg-gray-100 p-1 rounded-full">
          <button
            onClick={() => setActiveTab('qualified')}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
              activeTab === 'qualified' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Qualified ({qualifiedCount})
          </button>
          <button
            onClick={() => setActiveTab('needsReview')}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
              activeTab === 'needsReview' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Needs Review ({needsReviewCount})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
              activeTab === 'all' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            All Tested ({allTestedCount})
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-muted/20">
              {columns.map((column, index) => (
                <TableHead
                  key={column.id}
                  className={`bg-muted/5 py-5 px-4 ${
                    index < columns.length - 1 ? "border-r border-muted/20" : ""
                  }`}
                  style={{ minWidth: column.minWidth }}
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <span>{column.icon}</span>
                    <span>{column.label}</span>
                  </motion.div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResults.map((result, index) => (
              <TableRow
                key={result.companyId}
                className={cn(
                  "hover:bg-green-50/30 transition-colors duration-200",
                  result.needsReview 
                    ? "bg-yellow-50/10 hover:bg-yellow-50/30" 
                    : result.qualified 
                    ? "bg-green-50/10" 
                    : "bg-red-50/10"
                )}
              >
                {columns.map((column, colIndex) => (
                  <TableCell
                    key={column.id}
                    className={cn(
                      colIndex < columns.length - 1 ? "border-r border-muted/20" : "",
                      column.id === "researchResults" && isBoolean
                        ? "py-2 px-2 w-auto max-w-fit align-middle"
                        : column.id === "researchResults"
                        ? "align-top py-5 px-4"
                        : "py-5 px-4"
                    )}
                    style={{ minWidth: column.minWidth, maxWidth: column.maxWidth }}
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {column.id === "companyName" ? (
                        renderCompanyNameCell(result)
                      ) : column.id === "researchResults" ? (
                        <ResearchResultCell result={result} onViewDetails={handleViewDetails} compact={isBoolean} />
                      ) : column.id === "confidence" ? (
                        <div className="text-sm text-gray-900">
                          {Math.round(result.confidence * 100)}%
                        </div>
                      ) : (
                        <div className="text-sm text-gray-900">
                          {String(result[column.field as keyof AgentResult])}
                        </div>
                      )}
                    </motion.div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CompanyAnalysisPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        companyName={selectedCompany || ""}
        result={selectedResult}
      />
    </div>
  );
}