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
  XCircle,
  ExternalLink
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
import { ContactGenerator } from '@/utils/ContactGenerator';

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
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [contactGenerator, setContactGenerator] = useState<ContactGenerator | null>(null);
  const [generatedContacts, setGeneratedContacts] = useState<PersonaTestResult[]>([]);

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

  // Initialize ContactGenerator when campaign data is loaded
  useEffect(() => {
    if (campaignData?.qualifiedCompanies && campaignData?.selectedPersonas) {
      const generator = new ContactGenerator(
        campaignData.qualifiedCompanies.map(qc => ({
          id: qc.companyId,
          companyName: qc.companyName,
          industry: qc.industry,
          employeeCount: qc.employeeCount,
          hqCountry: qc.hqCountry,
          hqState: qc.hqState,
          website: qc.website,
          totalFunding: qc.totalFunding,
          estimatedAnnualRevenue: qc.estimatedAnnualRevenue,
          employeeCountNumeric: parseInt(qc.employeeCount.replace(/,/g, '')),
          hqCity: qc.hqCity || '',
          yearFounded: parseInt(qc.yearFounded.toString()),
          tags: []
        })),
        campaignData.selectedPersonas.map(p => ({
          ...p,
          icon: '👤' // Add default icon for persona
        }))
      );
      setContactGenerator(generator);

      // Generate contacts for all qualified companies
      const contacts = generator.generateContactsForCompanies(
        campaignData.qualifiedCompanies.map(qc => ({
          id: qc.companyId,
          companyName: qc.companyName,
          industry: qc.industry,
          employeeCount: qc.employeeCount,
          hqCountry: qc.hqCountry,
          hqState: qc.hqState,
          website: qc.website,
          totalFunding: qc.totalFunding,
          estimatedAnnualRevenue: qc.estimatedAnnualRevenue,
          employeeCountNumeric: parseInt(qc.employeeCount.replace(/,/g, '')),
          hqCity: qc.hqCity || '',
          yearFounded: parseInt(qc.yearFounded.toString()),
          tags: []
        })),
        campaignData.selectedPersonas.length
      );

      // Convert to PersonaTestResult format
      const testResults = contacts.map(contact => ({
        id: contact.id,
        contactName: contact.name,
        contactTitle: contact.title,
        email: contact.email,
        linkedinProfile: contact.linkedin,
        personaMatch: contact.personaMatch,
        matchScore: contact.matchScore,
        companyId: contact.companyId,
        companyName: contact.companyName
      }));

      setGeneratedContacts(testResults);
    }
  }, [campaignData]);

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

  const renderContactCard = (contact: PersonaTestResult) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{contact.contactName}</h4>
            <p className="text-sm text-gray-600">{contact.contactTitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {Math.round(contact.matchScore)}% Match
            </span>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          <p>Persona: {contact.personaMatch}</p>
          <a 
            href={`https://${contact.linkedinProfile}`}
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
            onClick={() => console.log('View profile for:', contact.contactName)}
          >
            View Profile
          </Button>
          <Button
            size="sm"
            className="bg-[#6366f1] hover:bg-[#6366f1]/90 text-white text-sm font-medium"
            onClick={() => console.log('Coach contact:', contact.contactName)}
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

        <div className="container mx-auto py-4 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Compact Campaign Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-gray-900">
                      {agent?.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{totalPersonas} Personas</span>
                      <span>•</span>
                      <span>{qualifiedCount}/{totalCount} Qualified</span>
                      <span>•</span>
                      <span>{Math.round((qualifiedCount / totalCount) * 100)}% Rate</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCampaignDetails(!showCampaignDetails)}
                    className="gap-2"
                  >
                    {showCampaignDetails ? (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronRight className="w-4 h-4" />
                        Show Details
                      </>
                    )}
                  </Button>
                </div>

                {/* Collapsible Campaign Details */}
                <AnimatePresence>
                  {showCampaignDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 pt-4 border-t border-gray-100"
                    >
                      <div className="grid grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Research Agent</h3>
                            <p className="text-sm text-gray-600">{agent?.description}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Research Question</h3>
                            <p className="text-sm text-gray-600">{agent?.researchQuestion}</p>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Outbound Strategy</h3>
                            <p className="text-sm text-gray-600">{agent?.description}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Enrolled Personas</h3>
                            <div className="space-y-1">
                              {selectedPersonas.map(persona => (
                                <div key={persona.id} className="text-sm text-gray-600">
                                  {persona.title}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Campaign Progress */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-500">Qualification Rate</div>
                            <div className="text-lg font-semibold text-gray-900">
                              {Math.round((qualifiedCount / totalCount) * 100)}%
                            </div>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-green-600">Messages Sent</div>
                            <div className="text-lg font-semibold text-green-700">0</div>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-blue-600">Response Rate</div>
                            <div className="text-lg font-semibold text-blue-700">0%</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Results Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100">
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
                                  <div className="p-4">
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium text-gray-900">Target Contacts</h3>
                                        <span className="text-sm text-gray-500">
                                          {generatedContacts.filter(c => c.companyName === company.companyName).length} contacts identified
                                        </span>
                                      </div>

                                      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                                        <table className="w-full">
                                          <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact
                                              </th>
                                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Title
                                              </th>
                                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Persona Match
                                              </th>
                                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Match Score
                                              </th>
                                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-gray-100">
                                            {generatedContacts
                                              .filter(c => c.companyName === company.companyName)
                                              .map(contact => (
                                                <tr key={contact.id} className="hover:bg-gray-50">
                                                  <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                      <span className="text-sm font-medium text-gray-900">
                                                        {contact.contactName}
                                                      </span>
                                                      <Button
                                                        size="sm"
                                                        className="bg-[#6366f1] hover:bg-[#6366f1]/90 text-white text-xs font-medium px-2 py-1 h-6"
                                                        onClick={() => console.log('Coach contact:', contact.contactName)}
                                                      >
                                                        Coach ✨
                                                      </Button>
                                                    </div>
                                                  </td>
                                                  <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{contact.contactTitle}</div>
                                                  </td>
                                                  <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{contact.personaMatch}</div>
                                                  </td>
                                                  <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                      {Math.round(contact.matchScore)}% Match
                                                    </span>
                                                  </td>
                                                  <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                      <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-xs h-7"
                                                        onClick={() => window.open(`https://${contact.linkedinProfile}`, '_blank')}
                                                      >
                                                        LinkedIn
                                                      </Button>
                                                    </div>
                                                  </td>
                                                </tr>
                                              ))}
                                          </tbody>
                                        </table>
                                      </div>
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
      </div>

      <CompanyAnalysisPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        companyName={selectedCompany}
        result={qualifiedCompanies.find(c => c.companyName === selectedCompany)}
      />
    </TooltipProvider>
  );
} 