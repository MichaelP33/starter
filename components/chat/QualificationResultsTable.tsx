"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AgentResult, EnrichmentOption } from './types';
import { CompanyAnalysisPanel } from "./CompanyAnalysisPanel";
import { motion } from "framer-motion";
import { CheckCircle2, ExternalLink, XCircle } from "lucide-react";
import { useState } from "react";

interface QualificationResultsTableProps {
  results: AgentResult[];
  companies: any[];
  activeTab: 'qualified' | 'all';
  setActiveTab: (tab: 'qualified' | 'all') => void;
  onViewAllResults?: () => void;
}

const qualificationInsights: Record<string, string> = {
  "Stripe": "Currently hiring Marketing Operations Manager and Senior Growth Marketing roles",
  "Notion": "3 open marketing leadership positions including VP Marketing",
  "Supabase": "Actively recruiting Marketing Operations and Digital Marketing specialists"
};

export function QualificationResultsTable({ results, companies = [], activeTab, setActiveTab, onViewAllResults }: QualificationResultsTableProps) {
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

  const qualifiedResults = results.filter(result => result.qualified);

  const qualifiedCount = qualifiedResults.length;
  const totalCount = results.length;

  const truncateText = (text: string, maxLength: number = 50) => {
    console.log('Truncating text:', {
      originalLength: text.length,
      maxLength,
      willTruncate: text.length > maxLength
    });

    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Define columns in the desired order with min-width specifications
  const columns = [
    { id: "companyName", label: "Company Name", icon: "🏢", field: "companyName", minWidth: "160px" },
    { id: "researchResults", label: "Research Results", icon: "🔍", field: "researchResults", minWidth: "320px" },
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
        {result.qualified ? (
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

  const filteredResults = activeTab === 'qualified' ? qualifiedResults : results;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Agent Test Results</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Agent tested on {totalCount} companies - {qualifiedCount} qualified
              </p>
            </div>
            <div className="flex gap-1 bg-gray-50 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('qualified')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'qualified'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Qualified ({qualifiedCount})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Tested ({totalCount})
              </button>
            </div>
          </div>
        </div>

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
                      <span className="font-medium">{column.label}</span>
                      {column.id === "researchResults" && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 ml-2">
                          Qualified
                        </span>
                      )}
                    </motion.div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((result, index) => (
                <TableRow
                  key={result.companyId}
                  className={`hover:bg-green-50/30 transition-colors duration-200 ${
                    result.qualified ? "bg-green-50/10" : "bg-red-50/10"
                  }`}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell
                      key={column.id}
                      className={`py-5 px-4 ${
                        colIndex < columns.length - 1 ? "border-r border-muted/20" : ""
                      } ${column.id === "researchResults" ? "align-top" : ""}`}
                      style={{ minWidth: column.minWidth }}
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {column.id === "companyName" ? (
                          renderCompanyNameCell(result)
                        ) : column.id === "researchResults" ? (
                          renderResearchResultsCell(result)
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