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
import { CheckCircle2 } from "lucide-react";
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

  const truncateText = (text: string, maxLength: number = 70) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const renderResearchResultsCell = (company: QualifiedCompanyWithResearch) => {
    const fullText = company.researchResults;
    const truncatedText = truncateText(fullText);
    const needsTruncation = fullText.length > 70;

    if (!needsTruncation) {
      return (
        <div className="text-gray-700 leading-relaxed">
          {fullText}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="text-gray-700 leading-relaxed">
          {truncatedText}
        </div>
        <button
          onClick={() => handleViewDetails(company.companyName)}
          className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors duration-200 text-sm"
        >
          View details
        </button>
      </div>
    );
  };

  const renderCompanyNameCell = (company: QualifiedCompanyWithResearch) => {
    return (
      <div className="flex items-center gap-3">
        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
        <span className="font-medium text-foreground">
          {company.companyName}
        </span>
      </div>
    );
  };

  return (
    <>
      <TooltipProvider>
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
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                {renderResearchResultsCell(company)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent 
                              side="top" 
                              className="max-w-sm bg-gray-800 text-white border-gray-700 shadow-lg p-3"
                            >
                              <p className="text-sm leading-relaxed">{company.researchResults}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          company[column.field]
                        )}
                      </motion.div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TooltipProvider>

      <CompanyAnalysisPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        companyName={selectedCompany}
      />
    </>
  );
}