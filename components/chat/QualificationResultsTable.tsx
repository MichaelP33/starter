"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QualificationResult } from "./types";
import { CompanyAnalysisPanel } from "./CompanyAnalysisPanel";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface QualificationResultsTableProps {
  results: QualificationResult[];
  onViewAllResults?: () => void;
}

const qualificationInsights: Record<string, string> = {
  "Stripe": "Currently hiring Marketing Operations Manager and Senior Growth Marketing roles",
  "Notion": "3 open marketing leadership positions including VP Marketing",
  "Supabase": "Actively recruiting Marketing Operations and Digital Marketing specialists"
};

export function QualificationResultsTable({ results, onViewAllResults }: QualificationResultsTableProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  
  const qualifiedResults = results.filter(result => result.qualified);
  const totalCount = results.length;
  const qualifiedCount = qualifiedResults.length;

  const handleCompanyClick = (companyName: string) => {
    setSelectedCompany(companyName);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Test Results</h2>
              {onViewAllResults && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onViewAllResults}
                  className="text-primary hover:text-primary/80 text-sm"
                >
                  View all results
                </Button>
              )}
            </div>
            <p className="text-muted-foreground">
              {qualifiedCount} of {totalCount} companies qualified for Marketing Personas Hiring
            </p>
          </div>

          <div className="rounded-lg border border-muted/20 bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-muted/20">
                  <TableHead className="bg-muted/5 py-4 font-medium w-1/3">Company Name</TableHead>
                  <TableHead className="bg-muted/5 py-4 font-medium border-l border-muted/20">Why Qualified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qualifiedResults.map((result, index) => (
                  <TableRow
                    key={result.companyName}
                    className="hover:bg-muted/5 transition-colors duration-200"
                  >
                    <TableCell className="py-4 font-medium">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.15 }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="font-medium text-foreground">
                          {result.companyName}
                        </span>
                        <button
                          onClick={() => handleCompanyClick(result.companyName)}
                          className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors duration-200 ml-2 text-sm"
                        >
                          View details
                        </button>
                      </motion.div>
                    </TableCell>
                    <TableCell className="py-4 border-l border-muted/20">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.15 + 0.1 }}
                        className="text-gray-700"
                      >
                        {qualificationInsights[result.companyName]}
                      </motion.div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="bg-green-50/50 border border-green-200/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">
                {qualifiedCount} qualified companies identified
              </span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              These companies show strong hiring signals for marketing roles and are prime targets for your personalized outreach campaign.
            </p>
          </div>
        </div>
      </motion.div>

      <CompanyAnalysisPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        companyName={selectedCompany}
      />
    </>
  );
}