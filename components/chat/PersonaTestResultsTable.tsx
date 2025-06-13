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

interface PersonaTestResult {
  companyName: string;
  contactName: string;
  contactTitle: string;
  linkedinProfile: string;
  matchScore: number;
}

interface PersonaTestResultsTableProps {
  results: PersonaTestResult[];
}

const mockPersonaResults: PersonaTestResult[] = [
  {
    companyName: "Stripe",
    contactName: "Sarah Chen",
    contactTitle: "VP of Marketing",
    linkedinProfile: "linkedin.com/in/sarahchen",
    matchScore: 95
  },
  {
    companyName: "Stripe",
    contactName: "Marcus Rodriguez",
    contactTitle: "Chief Marketing Officer",
    linkedinProfile: "linkedin.com/in/marcusrodriguez",
    matchScore: 98
  },
  {
    companyName: "Notion",
    contactName: "Jennifer Park",
    contactTitle: "Head of Marketing Strategy",
    linkedinProfile: "linkedin.com/in/jenniferpark",
    matchScore: 92
  },
  {
    companyName: "Notion",
    contactName: "Alex Thompson",
    contactTitle: "VP of Brand & Marketing",
    linkedinProfile: "linkedin.com/in/alexthompson",
    matchScore: 87
  },
  {
    companyName: "Supabase",
    contactName: "David Kim",
    contactTitle: "VP of Brand & Marketing",
    linkedinProfile: "linkedin.com/in/davidkim",
    matchScore: 89
  },
  {
    companyName: "Supabase",
    contactName: "Lisa Wang",
    contactTitle: "Director of Marketing",
    linkedinProfile: "linkedin.com/in/lisawang",
    matchScore: 84
  }
];

export function PersonaTestResultsTable({ results }: PersonaTestResultsTableProps) {
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

        <div className="rounded-lg border border-muted/20 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-muted/20">
                <TableHead className="bg-muted/5 py-4 font-medium">Company Name</TableHead>
                <TableHead className="bg-muted/5 py-4 font-medium border-l border-muted/20">Contact Name</TableHead>
                <TableHead className="bg-muted/5 py-4 font-medium border-l border-muted/20">Contact Title</TableHead>
                <TableHead className="bg-muted/5 py-4 font-medium border-l border-muted/20">LinkedIn Profile</TableHead>
                <TableHead className="bg-muted/5 py-4 font-medium border-l border-muted/20">Match Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow
                  key={`${result.companyName}-${result.contactName}`}
                  className="hover:bg-muted/5 transition-colors duration-200"
                >
                  <TableCell className="py-4 font-medium">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="font-medium text-foreground">
                        {result.companyName}
                      </span>
                    </motion.div>
                  </TableCell>
                  <TableCell className="py-4 border-l border-muted/20">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.05 }}
                      className="space-y-1"
                    >
                      <div className="font-medium text-gray-900">{result.contactName}</div>
                      <button
                        onClick={() => handleViewDetails(result.contactName)}
                        className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors duration-200 text-sm"
                      >
                        View details
                      </button>
                    </motion.div>
                  </TableCell>
                  <TableCell className="py-4 border-l border-muted/20">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.1 }}
                      className="text-gray-700"
                    >
                      {result.contactTitle}
                    </motion.div>
                  </TableCell>
                  <TableCell className="py-4 border-l border-muted/20">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.15 }}
                    >
                      <a
                        href={`https://${result.linkedinProfile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="text-sm">LinkedIn</span>
                      </a>
                    </motion.div>
                  </TableCell>
                  <TableCell className="py-4 border-l border-muted/20">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreColor(result.matchScore)}`}>
                        {result.matchScore}% match
                      </span>
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
              {results.length} qualified contacts identified
            </span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            These contacts match your Strategic Marketing Executive persona criteria and are ready for personalized outreach.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Export the mock data for use in ChatInterface
export { mockPersonaResults };