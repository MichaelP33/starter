"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { PersonaTestResult } from './types';
import { Button } from '@/components/ui/button';

interface PersonaTestResultsTableProps {
  results: PersonaTestResult[];
  onAddThisPersona?: () => void;
  onBackToConfiguration?: () => void;
}

export function PersonaTestResultsTable({ 
  results,
  onAddThisPersona,
  onBackToConfiguration 
}: PersonaTestResultsTableProps) {
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  const handleViewDetails = (contactName: string) => {
    setSelectedContact(contactName);
    // This would open a detailed analysis panel similar to company analysis
    console.log("View details for:", contactName);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 95) return "text-green-600 bg-green-50";
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 85) return "text-yellow-600 bg-yellow-50";
    return "text-orange-600 bg-orange-50";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Persona Test Results</h2>
          <p className="text-muted-foreground">
            {results.length} contacts found matching Strategic Marketing Executive at 3 qualified companies
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Persona Match
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Match Score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {result.contactName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {result.contactTitle}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{result.companyName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{result.personaMatch}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {Math.round(result.matchScore)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-green-50/50 border border-green-200/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">
              {results.length} qualified contacts identified
            </span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            These contacts match your Strategic Marketing Executive persona criteria and are ready for personalized outreach.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex gap-3">
            <Button 
              onClick={onAddThisPersona}
              className="bg-[#6366f1] hover:bg-[#6366f1]/90 text-white h-12 text-base font-medium"
            >
              Add This Persona to Campaign
            </Button>
            <Button 
              variant="outline"
              onClick={onBackToConfiguration}
              className="h-12"
            >
              Back to Configuration
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}