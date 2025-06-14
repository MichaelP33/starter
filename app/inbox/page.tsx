"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { QualifiedCompanyWithResearch } from "@/components/chat/types";

// Mock data - in a real app, this would come from your data store
const mockQualifiedCompanies: QualifiedCompanyWithResearch[] = [
  {
    companyName: "Stripe",
    website: "stripe.com",
    industry: "FinTech",
    hqCountry: "United States",
    employeeCount: "5000+",
    totalFunding: "$600M",
    estimatedAnnualRevenue: "$1B+",
    hqCity: "San Francisco",
    yearFounded: "2010",
    researchResults: "Currently hiring Marketing Operations Manager and Senior Growth Marketing roles",
    qualified: true,
    assignedPersonas: 2
  },
  {
    companyName: "Notion",
    website: "notion.so",
    industry: "Productivity Software",
    hqCountry: "United States",
    employeeCount: "1000+",
    totalFunding: "$275M",
    estimatedAnnualRevenue: "$500M",
    hqCity: "San Francisco",
    yearFounded: "2013",
    researchResults: "3 open marketing leadership positions including VP Marketing",
    qualified: true,
    assignedPersonas: 3
  },
  {
    companyName: "Figma",
    website: "figma.com",
    industry: "Design Software",
    hqCountry: "United States",
    employeeCount: "1000+",
    totalFunding: "$200M",
    estimatedAnnualRevenue: "$400M",
    hqCity: "San Francisco",
    yearFounded: "2012",
    researchResults: "No current marketing leadership openings",
    qualified: false,
    assignedPersonas: 0
  }
];

export default function CampaignInbox() {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (companyName: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(companyName)) {
        next.delete(companyName);
      } else {
        next.add(companyName);
      }
      return next;
    });
  };

  const qualifiedCount = mockQualifiedCompanies.filter(c => c.qualified).length;
  const totalPersonas = mockQualifiedCompanies.reduce((sum, c) => sum + c.assignedPersonas, 0);

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Campaign Inbox</h1>
          <p className="text-muted-foreground">
            {qualifiedCount} qualified companies, {totalPersonas} personas configured
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="rounded-lg border border-muted/20 bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-muted/20">
                  <TableHead className="w-8 bg-muted/5"></TableHead>
                  <TableHead className="bg-muted/5 py-4 border-r border-muted/20">
                    <span className="font-medium">Company</span>
                  </TableHead>
                  <TableHead className="bg-muted/5 py-4 border-r border-muted/20">
                    <span className="font-medium">Industry</span>
                  </TableHead>
                  <TableHead className="bg-muted/5 py-4 border-r border-muted/20">
                    <span className="font-medium">Status</span>
                  </TableHead>
                  <TableHead className="bg-muted/5 py-4">
                    <span className="font-medium">Personas</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockQualifiedCompanies.map((company) => (
                  <>
                    <TableRow
                      key={company.companyName}
                      className="hover:bg-muted/5 transition-colors duration-200 cursor-pointer"
                      onClick={() => toggleRow(company.companyName)}
                    >
                      <TableCell className="py-3">
                        {expandedRows.has(company.companyName) ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="py-3 border-r border-muted/20">
                        <div className="space-y-1">
                          <div className="font-medium">{company.companyName}</div>
                          <div className="text-sm text-muted-foreground">{company.website}</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 border-r border-muted/20">
                        {company.industry}
                      </TableCell>
                      <TableCell className="py-3 border-r border-muted/20">
                        {company.qualified ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Qualified</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600">
                            <XCircle className="w-4 h-4" />
                            <span>Not Qualified</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        {company.assignedPersonas}
                      </TableCell>
                    </TableRow>
                    <AnimatePresence>
                      {expandedRows.has(company.companyName) && (
                        <TableRow>
                          <TableCell colSpan={5} className="p-4 bg-muted/5">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-4"
                            >
                              <div className="space-y-2">
                                <h4 className="font-medium">Research Results</h4>
                                <p className="text-sm text-muted-foreground">{company.researchResults}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">HQ Location:</span>{" "}
                                  {company.hqCity}, {company.hqCountry}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Employee Count:</span>{" "}
                                  {company.employeeCount}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Founded:</span>{" "}
                                  {company.yearFounded}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Total Funding:</span>{" "}
                                  {company.totalFunding}
                                </div>
                              </div>
                            </motion.div>
                          </TableCell>
                        </TableRow>
                      )}
                    </AnimatePresence>
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 