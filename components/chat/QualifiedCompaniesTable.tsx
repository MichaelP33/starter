"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QualifiedCompanyWithResearch, EnrichmentOption } from "./types";
import { CompanyAnalysisPanel } from "./CompanyAnalysisPanel";
import { motion } from "framer-motion";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { useState } from "react";

interface QualifiedCompaniesTableProps {
  companies: QualifiedCompanyWithResearch[];
  enrichmentOptions: EnrichmentOption[];
}

export function QualifiedCompaniesTable({ companies, enrichmentOptions }: QualifiedCompaniesTableProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");

  // Get selected options and reorder to put Company Name first, then Research Results, then others
  const selectedOptions = enrichmentOptions.filter((option) => option.isSelected);
  
  // Create the research results column
  const researchResultsColumn = { 
    id: "researchResults", 
    label: "Research Results", 
    icon: "🔍", 
    isSelected: true, 
    field: "researchResults" as keyof QualifiedCompanyWithResearch 
  };

  // Find the company name column
  const companyNameColumn = selectedOptions.find(option => option.field === "companyName");
  
  // Get all other columns (excluding company name)
  const otherColumns = selectedOptions.filter(option => option.field !== "companyName");

  // Reorder: Company Name first, then Research Results, then all others
  const allColumns = [
    ...(companyNameColumn ? [companyNameColumn] : []),
    researchResultsColumn,
    ...otherColumns
  ];

  const handleViewDetails = (companyName: string) => {
    setSelectedCompany(companyName);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const renderResearchResultsCell = (company: QualifiedCompanyWithResearch) => {
    const fullText = company.researchResults.summary;
    const truncatedText = truncateText(fullText);
    const needsTruncation = fullText.length > 50;

    return (
      <div className="group relative">
        <div className="text-sm">
          {truncatedText}
          {needsTruncation && (
            <button
              onClick={() => handleViewDetails(company.companyName)}
              className="ml-1 text-gray-500 hover:text-gray-800 text-xs inline-flex items-center"
            >
              See More
              <ExternalLink className="w-3 h-3 ml-1" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderCompanyNameCell = (company: QualifiedCompanyWithResearch) => {
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {company.companyName}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {company.website}
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="rounded-lg border border-muted/20 bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-muted/20">
              {allColumns.map((column, index) => (
                <TableHead
                  key={column.id}
                  className={`bg-muted/5 py-4 ${
                    index < allColumns.length - 1 ? "border-r border-muted/20" : ""
                  }`}
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
            {companies.map((company, index) => (
              <TableRow
                key={index}
                className="hover:bg-green-50/30 transition-colors duration-200 bg-green-50/10"
              >
                {allColumns.map((column, colIndex) => (
                  <TableCell
                    key={column.id}
                    className={`py-3 ${
                      colIndex < allColumns.length - 1 ? "border-r border-muted/20" : ""
                    } ${column.id === "researchResults" ? "align-top" : ""}`}
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {column.id === "companyName" ? (
                        renderCompanyNameCell(company)
                      ) : column.id === "researchResults" ? (
                        renderResearchResultsCell(company)
                      ) : (
                        <div className="text-sm text-gray-900">
                          {String(company[column.field as keyof QualifiedCompanyWithResearch])}
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
        companyName={selectedCompany}
        result={companies.find(c => c.companyName === selectedCompany)}
      />
    </>
  );
}