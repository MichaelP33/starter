"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Info,
  Plus,
  Search,
  Settings,
  Target,
  Users,
  XCircle
} from "lucide-react";
import { QualifiedCompanyWithResearch, SelectedPersona, PersonaTestResult } from "@/components/chat/types";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import companiesData from "@/data/companies.json";
import { useDataConfig } from "@/hooks/useDataConfig";
import { CompanyAnalysisPanel } from "@/components/chat/CompanyAnalysisPanel";
import { Agent } from "@/components/chat/types";

interface Contact {
  name: string;
  title: string;
  linkedin: string;
  personaMatch: string;
  matchScore: number;
}

type MockContacts = {
  [key: string]: Contact[];
};

// Mock contacts data - in a real app, this would come from your data store
const mockContacts: MockContacts = {
  "Stripe": [
    {
      name: "Sarah Chen",
      title: "VP of Marketing",
      linkedin: "linkedin.com/in/sarahchen",
      personaMatch: "Marketing Leader",
      matchScore: 95,
    },
    {
      name: "Michael Rodriguez",
      title: "Head of Growth",
      linkedin: "linkedin.com/in/michaelrodriguez",
      personaMatch: "Growth Leader",
      matchScore: 92,
    }
  ],
  "Notion": [
    {
      name: "Emily Park",
      title: "Director of Marketing",
      linkedin: "linkedin.com/in/emilypark",
      personaMatch: "Marketing Leader",
      matchScore: 88,
    },
    {
      name: "David Kim",
      title: "VP of Growth",
      linkedin: "linkedin.com/in/davidkim",
      personaMatch: "Growth Leader",
      matchScore: 90,
    }
  ],
  "Figma": [
    {
      name: "Alex Wong",
      title: "Head of Marketing",
      linkedin: "linkedin.com/in/alexwong",
      personaMatch: "Marketing Leader",
      matchScore: 85,
    }
  ]
};

interface CampaignData {
  agent: Agent;
  qualifiedCompanies: QualifiedCompanyWithResearch[];
  selectedPersonas: SelectedPersona[];
  personaTestResults: PersonaTestResult[];
  createdAt: string;
}

export default function CampaignInbox() {
  const [activeTab, setActiveTab] = useState<'qualified' | 'full'>('qualified');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [showResearchQuestion, setShowResearchQuestion] = useState(false);
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);

  const { agents, isLoadingAgents } = useDataConfig();

  // Load campaign data from localStorage
  useEffect(() => {
    const storedData = localStorage.getItem('campaignData');
    if (storedData) {
      const data = JSON.parse(storedData) as CampaignData;
      console.log('📥 Loaded campaign data:', data);
      setCampaignData(data);
    }
  }, []);

  if (isLoadingAgents) {
    return <div>Loading...</div>;
  }

  // Use campaign data if available, otherwise fall back to mock data
  const agent = campaignData?.agent || agents.find(agent => agent.id === "marketing-hiring");
  const qualifiedCompanies = campaignData?.qualifiedCompanies || [];
  const selectedPersonas = campaignData?.selectedPersonas || [];
  const personaTestResults = campaignData?.personaTestResults || [];

  const qualifiedCount = qualifiedCompanies.filter(c => c.qualified).length;
  const totalCount = qualifiedCompanies.length;
  const totalPersonas = selectedPersonas.length;

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

  const renderContactCard = (contact: Contact) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{contact.name}</h4>
            <p className="text-sm text-gray-600">{contact.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {contact.matchScore}% Match
            </span>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          <p>Persona: {contact.personaMatch}</p>
          <a 
            href={`https://${contact.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            LinkedIn Profile
          </a>
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="text-sm font-medium"
          >
            View Profile
          </Button>
          <Button
            size="sm"
            className="bg-[#6366f1] hover:bg-[#6366f1]/90 text-white text-sm font-medium"
          >
            Coach ✨
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const columns = [
    { id: "companyName", label: "Company Name", icon: "🏢" },
    { id: "researchResults", label: "Research Results", icon: "🔍" },
    { id: "website", label: "Website", icon: "🌐" },
    { id: "industry", label: "Industry", icon: "🏭" },
    { id: "hqCountry", label: "HQ Country", icon: "🌍" },
    { id: "employeeCount", label: "Employee Count", icon: "👥" },
    { id: "assignedPersonas", label: "Personas", icon: "🎯" }
  ];

  const filteredCompanies = activeTab === 'qualified' 
    ? qualifiedCompanies.filter(c => c.qualified)
    : qualifiedCompanies;

  const renderResearchResultsCell = (company: QualifiedCompanyWithResearch) => {
    const fullText = company.researchResults.summary;
    const truncatedText = truncateText(fullText);
    const needsTruncation = fullText.length > 70;

    return (
      <div className="relative group">
        <div className="text-sm leading-relaxed">
          {needsTruncation ? truncatedText : fullText}
        </div>
        {needsTruncation && (
          <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        )}
      </div>
    );
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50/50">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="text-gray-900 font-medium">Campaigns</span>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-gray-900 font-medium">{agent?.title}</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                  Active
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Campaign
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto py-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Campaign Overview */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                {/* Campaign Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-semibold text-gray-900">
                        {agent?.title}
                      </h1>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          Started {formatDate(campaignData?.createdAt)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          Last updated {formatDate(new Date().toISOString())}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">{totalPersonas} Personas</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          {qualifiedCount}/{totalCount} Qualified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Research Context */}
                <div className="p-6 border-b border-gray-100">
                  <div className="grid grid-cols-2 divide-x divide-gray-100">
                    {/* Left Column */}
                    <div className="pr-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <Search className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">Research Agent</span>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {agent?.questionType}
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {agent?.title}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {agent?.description}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                          <button
                            onClick={() => setShowResearchQuestion(!showResearchQuestion)}
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            <Info className="w-4 h-4" />
                            {showResearchQuestion ? 'Hide' : 'Show'} Research Question
                          </button>
                          {showResearchQuestion && (
                            <p className="mt-2 text-sm text-gray-600">
                              {agent?.researchQuestion}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="pl-6">
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-3">
                            <Target className="w-4 h-4" />
                            Outbound Strategy
                          </div>
                          <p className="text-sm text-gray-600">
                            {agent?.description}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-3">
                            <Users className="w-4 h-4" />
                            Enrolled Personas
                          </div>
                          <div className="space-y-1">
                            {selectedPersonas.map(persona => (
                              <div key={persona.id} className="text-sm text-gray-900">
                                {persona.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Campaign Progress */}
                <div className="p-6 bg-gray-50/50 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-900">Campaign Progress</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${(qualifiedCount / totalCount) * 100}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-white rounded-lg border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Qualification Rate</div>
                        <div className="text-2xl font-semibold text-gray-900">
                          {Math.round((qualifiedCount / totalCount) * 100)}%
                        </div>
                      </div>
                      <div className="p-4 bg-white rounded-lg border border-gray-100">
                        <div className="text-sm text-green-600 mb-1">Messages Sent</div>
                        <div className="text-2xl font-semibold text-green-700">0</div>
                      </div>
                      <div className="p-4 bg-white rounded-lg border border-gray-100">
                        <div className="text-sm text-blue-600 mb-1">Response Rate</div>
                        <div className="text-2xl font-semibold text-blue-700">0%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Company Results</h2>
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
                      onClick={() => setActiveTab('full')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        activeTab === 'full'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Full List ({totalCount})
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-muted/20">
                      <TableHead className="w-8 bg-muted/5"></TableHead>
                      {columns.map((column, index) => (
                        <TableHead
                          key={column.id}
                          className={`bg-muted/5 py-4 ${
                            index < columns.length - 1 ? "border-r border-muted/20" : ""
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
                          </motion.div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((company) => (
                      <>
                        <TableRow
                          key={company.companyName}
                          className="hover:bg-green-50/30 transition-colors duration-200 bg-green-50/10 cursor-pointer"
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
                            <div className="flex items-center gap-3">
                              {company.qualified ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                              )}
                              <span className="font-medium text-foreground">
                                {company.companyName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 border-r border-muted/20 align-top">
                            {renderResearchResultsCell(company)}
                          </TableCell>
                          <TableCell className="py-3 border-r border-muted/20">
                            {company.website}
                          </TableCell>
                          <TableCell className="py-3 border-r border-muted/20">
                            {company.industry}
                          </TableCell>
                          <TableCell className="py-3 border-r border-muted/20">
                            {company.hqCountry}
                          </TableCell>
                          <TableCell className="py-3 border-r border-muted/20">
                            {company.employeeCount}
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {company.qualified ? `${selectedPersonas.length} Personas` : "0 Personas"}
                            </div>
                          </TableCell>
                        </TableRow>
                        <AnimatePresence>
                          {expandedRows.has(company.companyName) && (
                            <TableRow>
                              <TableCell colSpan={8} className="p-0">
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="bg-gray-50 border-t border-muted/20"
                                >
                                  <div className="p-6 space-y-6">
                                    {/* Research Results */}
                                    <div className="space-y-2">
                                      <h3 className="text-sm font-medium text-gray-900">Research Results</h3>
                                      <p className="text-sm text-gray-600">{company.researchResults.summary}</p>
                                      <div className="mt-2">
                                        <h4 className="text-xs font-medium text-gray-500">Sources:</h4>
                                        <ul className="mt-1 space-y-1">
                                          {company.researchResults.sources.map((source, index) => (
                                            <li key={index} className="text-xs text-gray-600">{source}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>

                                    {/* Company Details */}
                                    <div className="space-y-2">
                                      <h3 className="text-sm font-medium text-gray-900">Company Details</h3>
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
                                    </div>

                                    {/* Sample Contacts */}
                                    {personaTestResults.filter(c => c.companyName === company.companyName).length > 0 && (
                                      <div className="space-y-3">
                                        <h3 className="text-sm font-medium text-gray-900">Sample Contacts</h3>
                                        <div className="grid gap-4">
                                          {personaTestResults
                                            .filter(c => c.companyName === company.companyName)
                                            .map(contact => (
                                              <div key={contact.id}>
                                                {renderContactCard({
                                                  name: contact.contactName,
                                                  title: contact.contactTitle,
                                                  linkedin: contact.linkedinProfile,
                                                  personaMatch: contact.personaMatch,
                                                  matchScore: contact.matchScore
                                                })}
                                              </div>
                                            ))}
                                        </div>
                                      </div>
                                    )}
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
      </div>

      <CompanyAnalysisPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        companyName={selectedCompany}
      />
    </TooltipProvider>
  );
} 