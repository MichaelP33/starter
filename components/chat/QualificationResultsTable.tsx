"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AgentResult } from './types';
import { CompanyAnalysisPanel } from "./CompanyAnalysisPanel";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface QualificationResultsTableProps {
  results: AgentResult[];
  onViewAllResults?: () => void;
}

const qualificationInsights: Record<string, string> = {
  "Stripe": "Currently hiring Marketing Operations Manager and Senior Growth Marketing roles",
  "Notion": "3 open marketing leadership positions including VP Marketing",
  "Supabase": "Actively recruiting Marketing Operations and Digital Marketing specialists"
};

export function QualificationResultsTable({ results, onViewAllResults }: QualificationResultsTableProps) {
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
  const totalCount = results.length;
  const qualifiedCount = qualifiedResults.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Qualification Results</h2>
          <p className="text-sm text-muted-foreground">
            {qualifiedCount} of {totalCount} companies qualified
          </p>
        </div>
        {onViewAllResults && (
          <Button
            variant="outline"
            onClick={onViewAllResults}
            className="text-sm"
          >
            View All Results
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Qualified</TableHead>
              <TableHead>Why Qualified</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.companyId} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  {result.companyName}
                </TableCell>
                <TableCell>
                  {result.qualified ? "Yes" : "No"}
                </TableCell>
                <TableCell>
                  {result.whyQualified}
                </TableCell>
                <TableCell>
                  {Math.round(result.confidence * 100)}%
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(result.companyName)}
                  >
                    View Details
                  </Button>
                </TableCell>
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