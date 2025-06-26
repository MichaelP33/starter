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
import { QualifiedCompanyWithResearch, EnrichmentOption, Contact } from "./types";
import { CompanyAnalysisPanel } from "./CompanyAnalysisPanel";
import { motion } from "framer-motion";
import { CheckCircle2, ExternalLink, XCircle, ArrowUpRight, ChevronRight, AlertTriangle } from "lucide-react";
import { useState } from "react";
import PicklistChips from "./PicklistChips";
import CompactPicklistChips from "./CompactPicklistChips";
import { cn } from "@/lib/utils";
import { PersonaContactRow, ExpandedContactHeader } from "./PersonaContactRow";
import { useDataConfig } from "@/hooks/useDataConfig";
import { ContactGenerator } from "@/utils/ContactGenerator";
import React from "react";

interface QualifiedCompaniesTableProps {
  companies: QualifiedCompanyWithResearch[];
  enrichmentOptions: EnrichmentOption[];
  totalPersonas?: number;
}

export function QualifiedCompaniesTable({ companies, enrichmentOptions, totalPersonas }: QualifiedCompaniesTableProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [expandedCompanyIds, setExpandedCompanyIds] = useState<string[]>([]);
  const [generatedContacts, setGeneratedContacts] = useState<Record<string, Contact[]>>({});
  const { companies: allCompanies, personas } = useDataConfig();

  const handleViewDetails = (companyName: string) => {
    setSelectedCompany(companyName);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  const handleToggleExpansion = (companyId: string, company: QualifiedCompanyWithResearch) => {
    const isCurrentlyExpanded = expandedCompanyIds.includes(companyId);

    if (!isCurrentlyExpanded && !generatedContacts[companyId]) {
      const companyData = allCompanies.find(c => c.id === companyId);
      // Fallback: if no assignedPersonas, use all persona names
      const personaList = (company.assignedPersonas && company.assignedPersonas.length > 0)
        ? company.assignedPersonas
        : personas.map(p => p.name);
      if (companyData && personaList.length > 0) {
        const contactGenerator = new ContactGenerator(allCompanies, personas);
        const newContacts = contactGenerator.generateContactsForCompany(
          companyData,
          personaList,
          2
        );
        setGeneratedContacts(prev => ({ ...prev, [companyId]: newContacts }));
      }
    }

    setExpandedCompanyIds(prev =>
      isCurrentlyExpanded
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const renderCompanyNameCell = (company: QualifiedCompanyWithResearch) => {
    const hasPersonas = company.assignedPersonas && company.assignedPersonas.length > 0;
    const isExpanded = expandedCompanyIds.includes(company.companyId);

    return (
      <div className="flex items-start gap-3">
        <div className="mt-1 flex-shrink-0">
          {company.needsReview ? (
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          ) : company.qualified ? (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
        </div>
        <div
          className={cn(
            "flex-1 min-w-0 group",
            hasPersonas &&
              "cursor-pointer hover:bg-gray-50 rounded-lg -m-2 p-2 transition-colors duration-150"
          )}
          onClick={
            hasPersonas
              ? () => handleToggleExpansion(company.companyId, company)
              : undefined
          }
        >
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-gray-900 truncate">
              {company.companyName}
            </p>
            {hasPersonas && (
              <span className="text-sm text-gray-500 font-normal">
                ({company.assignedPersonas.length})
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">
            {company.website}
          </p>
          {hasPersonas && (
            <div className="flex items-center gap-2 mt-1">
              <ChevronRight
                className={cn(
                  "w-3 h-3 text-gray-400 hover:text-purple-500 transition-colors cursor-pointer flex-shrink-0",
                  isExpanded && "transform rotate-90"
                )}
              />
              <span className="text-gray-400 opacity-75 text-sm opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap hover:text-purple-600 hover:opacity-100 hover:scale-105 cursor-pointer">
                Start Prospecting ✨
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderResearchResultsCell = (company: QualifiedCompanyWithResearch) => {
    if (company.questionType === 'Boolean') {
      return (
        <div className="flex flex-col items-start gap-1">
          <span className={cn("text-sm font-semibold", company.qualified ? "text-green-700" : "text-red-600")}>
            {company.qualified ? 'Yes' : 'No'}
          </span>
          <button
            onClick={() => handleViewDetails(company.companyName)}
            className="inline-flex items-center gap-0.5 text-xs text-blue-700 hover:text-blue-900 transition-colors"
          >
            View Details <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      );
    }
    if (company.questionType === 'Picklist') {
      return (
        <div className="flex flex-col items-start gap-2">
          {Array.isArray(company.selectedOptions) && company.selectedOptions.length > 0 ? (
            <CompactPicklistChips options={company.selectedOptions} />
          ) : (
            <span className="text-xs text-gray-500">No matching roles found</span>
          )}
          <button
            onClick={() => handleViewDetails(company.companyName)}
            className="inline-flex items-center gap-0.5 text-xs text-blue-700 hover:text-blue-900 transition-colors"
          >
            View Details <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      );
    }
    return (
      <div className="text-sm text-gray-700">
        {company.researchResults.summary}
      </div>
    );
  };

  // Reorder columns to have a fixed structure
  const allColumns = [
    { id: "companyName", label: "Company Name", icon: "🏢" },
    { id: "researchResults", label: "Research Results", icon: "🔍" },
    { id: "website", label: "Website", icon: "🌐", field: "website" },
    { id: "industry", label: "Industry", icon: "🏭", field: "industry" },
    { id: "hqCountry", label: "HQ Country", icon: "🌍", field: "hqCountry" },
    { id: "employeeCount", label: "Employee Count", icon: "👥", field: "employeeCount" },
    { id: "personas", label: "Personas", icon: "👤" },
  ];

  return (
    <>
      <div className="rounded-b-lg border-t border-muted/20 bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-muted/20">
              {allColumns.map((column) => (
                <TableHead key={column.id} className="bg-muted/5 py-4 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span>{column.icon}</span>
                    <span className="font-medium">{column.label}</span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => {
              const isExpanded = expandedCompanyIds.includes(company.companyId);
              const contacts = generatedContacts[company.companyId] || [];

              return (
                <React.Fragment key={company.companyId}>
                  <TableRow
                    className={cn(
                      "hover:bg-gray-50/50 transition-colors duration-200",
                      company.needsReview
                        ? "bg-yellow-50/40"
                        : company.qualified
                        ? ""
                        : "bg-red-50/20"
                    )}
                  >
                    <TableCell className="p-1.5 align-top">
                      {renderCompanyNameCell(company)}
                    </TableCell>
                    <TableCell className="p-3 align-top">
                      {renderResearchResultsCell(company)}
                    </TableCell>
                    {allColumns.slice(2, 6).map(column => (
                      <TableCell key={column.id} className="p-3 align-top text-sm text-gray-800">
                        {String(company[column.field as keyof QualifiedCompanyWithResearch])}
                      </TableCell>
                    ))}
                    <TableCell className="p-3 align-top text-sm text-gray-800">
                      {totalPersonas} Personas
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={allColumns.length} className="p-0 !border-0">
                        <div className="bg-gray-50/60 p-4 pl-12 shadow-sm border-t border-gray-100">
                          <ExpandedContactHeader />
                          <div className="divide-y divide-gray-100">
                            {contacts.map((contact) => (
                              <PersonaContactRow key={contact.id} contact={contact} />
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
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