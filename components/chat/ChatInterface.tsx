"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useDataConfig } from '@/hooks/useDataConfig';
import { ResultsGenerator } from '@/utils/ResultsGenerator';
import { ContactGenerator } from '@/utils/ContactGenerator';
import { 
  Agent, 
  AgentResult, 
  Persona, 
  SelectedPersona, 
  Step,
  Account,
  EnrichmentOption,
  ResearchStrategy,
  AgentAction,
  QualificationResult,
  QualifiedCompanyWithResearch,
  PersonaAction,
  PersonaTestResult
} from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChatInput } from "./ChatInput";
import { SuggestionChip } from "./SuggestionChip";
import { CsvUploadArea } from "./CsvUploadArea";
import { CustomizationPanel } from "./CustomizationPanel";
import { AccountTable } from "./AccountTable";
import { QualifiedCompaniesTable } from "./QualifiedCompaniesTable";
import { ResearchStrategyCard } from "./ResearchStrategyCard";
import { AgentCard } from "./AgentCard";
import { KoalaLoadingIndicator } from "./KoalaLoadingIndicator";
import { QualificationResultsTable } from "./QualificationResultsTable";
import { PersonaCard } from "./PersonaCard";
import { PersonaConfigurationModal } from "./PersonaConfigurationModal";
import { PersonaConfigurationCard } from "./PersonaConfigurationCard";
import { PersonaModificationCard } from "./PersonaModificationCard";
import { PersonaTestResultsTable } from "./PersonaTestResultsTable";
import { MultiPersonaSelectionCard } from "./MultiPersonaSelectionCard";
import { motion } from "framer-motion";
import AgentDetails from "./AgentDetails";

interface Suggestion {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}

interface GeneratedContact {
  id: string;
  name: string;
  title: string;
  email: string;
  linkedin: string;
  personaMatch: string;
  matchScore: number;
  companyId: string;
  companyName: string;
}

interface SelectedAgentConfig {
  agent: Agent;
  testResults: AgentResult[];
  qualifiedCompanies: QualifiedCompanyWithResearch[];
}

const containerVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

const initialEnrichmentOptions: EnrichmentOption[] = [
  { id: "companyName", label: "Company Name", icon: "🏢", isSelected: true, field: "companyName" },
  { id: "website", label: "Website", icon: "🌐", isSelected: true, field: "website" },
  { id: "industry", label: "Industry", icon: "🏭", isSelected: true, field: "industry" },
  { id: "hqCountry", label: "HQ Country", icon: "🌍", isSelected: true, field: "hqCountry" },
  { id: "employeeCount", label: "Employee Count", icon: "👥", isSelected: true, field: "employeeCount" },
  { id: "totalFunding", label: "Total funding", icon: "💰", isSelected: false, field: "totalFunding" },
  { id: "estimatedAnnualRevenue", label: "Estimated annual revenue", icon: "📈", isSelected: false, field: "estimatedAnnualRevenue" },
  { id: "hqCity", label: "HQ City", icon: "🏙️", isSelected: false, field: "hqCity" },
  { id: "yearFounded", label: "Year founded", icon: "📅", isSelected: false, field: "yearFounded" },
];

const workflowSteps = [
  { label: "Build list", icon: "📋" },
  { label: "Research & qualify", icon: "🤖" },
  { label: "Find contacts", icon: "👥" },
];

// Persona options for contact finding
const personaOptions: ResearchStrategy[] = [
  {
    id: "marketing-ops",
    icon: "📈",
    title: "Marketing Operations",
    description: "Target ops professionals managing martech stacks, data integration, and campaign automation",
    agents: []
  },
  {
    id: "growth-marketing",
    icon: "��",
    title: "Growth Marketing",
    description: "Focus on growth marketers driving acquisition, conversion, and retention through data-driven experiments",
    agents: []
  },
  {
    id: "marketing-leadership",
    icon: "👔",
    title: "Marketing Leadership",
    description: "Reach VPs and Directors making strategic decisions about marketing technology investments",
    agents: []
  }
];

const agentActions: AgentAction[] = [
  { icon: "🧪", label: "Test Agent", value: "test" },
  { icon: "✏️", label: "Modify Agent", value: "modify" },
  { icon: "➕", label: "Add to Campaign", value: "add" }
];

const personaActions: PersonaAction[] = [
  { icon: "🧪", label: "Test Personas", value: "test" },
  { icon: "✏️", label: "Modify Personas", value: "modify" },
  { icon: "🚀", label: "Launch Campaign", value: "launch" }
];

console.log('Available persona actions:', personaActions);

// Create a test component
const AgentDetailsTest = ({ agent }: { agent: any }) => (
  <div>Testing: {agent?.title}</div>
);

export function ChatInterface() {
  const router = useRouter();
  const { companies, agents, personas, isLoadingCompanies, isLoadingAgents, isLoadingPersonas, hasError, errors } = useDataConfig();
  
  // State hooks
  const [resultsGenerator, setResultsGenerator] = useState<ResultsGenerator | null>(null);
  const [contactGenerator, setContactGenerator] = useState<ContactGenerator | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>("initial");
  const [workflowStep, setWorkflowStep] = useState(1);
  const [customizationStage, setCustomizationStage] = useState<'customize' | 'confirm'>('customize');
  const [selectedResearchStrategyId, setSelectedResearchStrategyId] = useState<string | null>(null);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [selectedPersonaCategoryId, setSelectedPersonaCategoryId] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [selectedPersonas, setSelectedPersonas] = useState<SelectedPersona[]>([]);
  const [showMultiPersonaSelection, setShowMultiPersonaSelection] = useState(false);
  const [isAgentEditMode, setIsAgentEditMode] = useState(false);
  const [isTestingAgent, setIsTestingAgent] = useState(false);
  const [showTestResults, setShowTestResults] = useState(false);
  const [showFullResults, setShowFullResults] = useState(false);
  const [showAgentConfirmation, setShowAgentConfirmation] = useState(false);
  const [activeTab, setActiveTab] = useState<'qualified' | 'full'>('qualified');
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isTestingPersonas, setIsTestingPersonas] = useState(false);
  const [showPersonaTestResults, setShowPersonaTestResults] = useState(false);
  const [isPersonaModifyMode, setIsPersonaModifyMode] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadedAccounts, setUploadedAccounts] = useState<Account[]>([]);
  const [enrichmentOptions, setEnrichmentOptions] = useState<EnrichmentOption[]>(initialEnrichmentOptions);
  const [qualificationResults, setQualificationResults] = useState<AgentResult[]>([]);
  const [qualifiedCompanies, setQualifiedCompanies] = useState<QualifiedCompanyWithResearch[]>([]);
  const [personaTestResults, setPersonaTestResults] = useState<PersonaTestResult[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedAgentConfig, setSelectedAgentConfig] = useState<SelectedAgentConfig | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [sampleCompanies, setSampleCompanies] = useState<string[]>([]);
  const [lastTestedCompanies, setLastTestedCompanies] = useState<Account[]>([]);
  const [activeResultsTab, setActiveResultsTab] = useState<'qualified' | 'all'>('qualified');

  // Group agents by category
  const agentsByCategory = agents?.reduce((acc, agent) => {
    const categoryId = agent.categoryId || 'other';
    if (!acc[categoryId]) acc[categoryId] = [];
    acc[categoryId].push(agent);
    return acc;
  }, {} as Record<string, Agent[]>);

  // Create category display data
  const categories = [
    { 
      id: 'hiring', 
      title: 'Hiring Trend Analysis', 
      icon: '🏢',
      description: 'Uncover growth signals and organizational changes through hiring patterns',
      agents: agentsByCategory?.['hiring'] || []
    },
    { 
      id: 'news', 
      title: 'Company News & Events', 
      icon: '📰',
      description: 'Track major announcements, leadership changes, and strategic initiatives',
      agents: agentsByCategory?.['news'] || []
    },
    { 
      id: 'tech', 
      title: 'Tech & Product Insights', 
      icon: '🔧',
      description: 'Analyze technical infrastructure and integration complexity',
      agents: agentsByCategory?.['tech'] || []
    }
  ];

  // Add diagnostic logging
  console.log('🔍 ChatInterface Data Loading:', {
    companies: companies?.length || 0,
    agents: agents?.length || 0, 
    personas: personas?.length || 0,
    isLoading: {
      companies: isLoadingCompanies,
      agents: isLoadingAgents,
      personas: isLoadingPersonas
    },
    hasError,
    errors,
    firstAgent: agents?.[0]?.title || 'none',
    firstCompany: companies?.[0]?.companyName || 'none'
  });

  // Initialize generators
  useEffect(() => {
    if (companies.length > 0 && agents.length > 0) {
      setResultsGenerator(new ResultsGenerator(companies, agents));
    }
    if (companies.length > 0 && personas.length > 0) {
      setContactGenerator(new ContactGenerator(companies, personas));
    }
  }, [companies, agents, personas]);

  // Loading state
  if (isLoadingCompanies || isLoadingAgents || isLoadingPersonas) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <div className="space-y-2">
            <p className="text-lg font-medium">Loading data...</p>
            <div className="flex gap-4 justify-center text-sm text-muted-foreground">
              <span className={isLoadingCompanies ? "animate-pulse" : ""}>
                Companies {isLoadingCompanies ? "..." : "✓"}
              </span>
              <span className={isLoadingAgents ? "animate-pulse" : ""}>
                Agents {isLoadingAgents ? "..." : "✓"}
              </span>
              <span className={isLoadingPersonas ? "animate-pulse" : ""}>
                Personas {isLoadingPersonas ? "..." : "✓"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading data</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              {errors.companies && (
                <div>Companies: {errors.companies.message}</div>
              )}
              {errors.agents && (
                <div>Agents: {errors.agents.message}</div>
              )}
              {errors.personas && (
                <div>Personas: {errors.personas.message}</div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const suggestions: Suggestion[] = [
    {
      title: "Upload CSV of target accounts",
      description: "I'd like to upload a CSV of my target accounts.",
      icon: "📤",
      onClick: () => {
        setCurrentStep("uploading");
      },
    },
    {
      title: "Create lookalike list from existing customers",
      description: "I want to create a lookalike list from my existing customers.",
      icon: "👥",
      onClick: () => {
        handleSend("I want to create a lookalike list from my existing customers.");
      },
    },
    {
      title: "Describe my ideal customer profile",
      description: "I want to describe my ideal customer profile.",
      icon: "🎯",
      onClick: () => {
        handleSend("I want to describe my ideal customer profile.");
      },
    },
  ];

  const handleSend = (message: string) => {
    setMessage(message);
    console.log("Sending message:", message);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.title === "Upload CSV of target accounts") {
      setCurrentStep("uploading");
    } else {
      handleSend(suggestion.description);
    }
  };

  const handleUploadSuccess = (accounts: Account[], size: number) => {
    setUploadedAccounts(accounts);
    setPageSize(size);
    setCurrentStep("customizing");
    setCustomizationStage('customize');
  };

  const handleToggleOption = (id: string) => {
    setEnrichmentOptions((prev) =>
      prev.map((option) =>
        option.id === id
          ? { ...option, isSelected: !option.isSelected }
          : option
      )
    );
  };

  const handleStartResearch = () => {
    setWorkflowStep(2);
    setCurrentStep("researching");
  };

  const handleBuildAgent = (agent: Agent) => {
    console.log('Selected agent details:', agent);
    setSelectedAgent(agent);
    setIsAgentEditMode(false);
    setShowTestResults(false);
    setShowFullResults(false);
    setCurrentStep("agent-details");
  };

  const handleAgentAction = async (action: string, agent: Agent | null) => {
    if (!agent) return;
    
    // Debug: Log the agent state before test
    console.log('🔍 [DEBUG] handleAgentAction called with:', {
      action,
      agentId: agent.id,
      agentTitle: agent.title,
      agentQuestionType: agent.questionType,
      selectedAgentQuestionType: selectedAgent?.questionType,
      isAgentEditMode
    });
    
    // Get the current question type from the agent config modal or agent state
    // Use selectedAgent if it exists (updated from modal), otherwise use passed agent
    const currentQuestionType = selectedAgent?.questionType || agent.questionType || 'Boolean';
    
    // Clone the agent and update the questionType
    const agentForTest = { ...agent, questionType: currentQuestionType };
    
    console.log('🟣 [DEBUG] Agent for test (final):', {
      id: agentForTest.id,
      title: agentForTest.title,
      questionType: agentForTest.questionType,
      researchQuestion: agentForTest.researchQuestion
    });
    
    if (action === 'test') {
      // Debug log: agent object used for test
      console.log('🟣 [DEBUG] Agent for test:', agentForTest);
      
      setIsTestingAgent(true);
      setLoadingStep(0);
      setLoadingMessage("Selecting representative sample from your target list...");

      // Simulate progressive loading steps with longer duration
      setTimeout(() => {
        setLoadingStep(1);
        setLoadingMessage(`Running ${agentForTest.title} analysis on sample companies...`);
      }, 2000);

      setTimeout(() => {
        setLoadingStep(2);
        setLoadingMessage("Evaluating qualification criteria and confidence scores...");
      }, 4000);

      setTimeout(() => {
        setLoadingStep(3);
        setLoadingMessage("Preparing sample results...");
      }, 6000);

      if (agentForTest.id === 'marketing-hiring') {
        // Shuffle and pick 10 companies for this test
        const shuffled = [...uploadedAccounts].sort(() => 0.5 - Math.random());
        const sample = shuffled.slice(0, 10);
        setLastTestedCompanies(sample);
        // Convert Account[] to Company[]
        const sampleCompanies = sample.map(acc => ({
          id: acc.companyName.toLowerCase().replace(/[^a-z0-9]/g, ''),
          companyName: acc.companyName,
          website: acc.website,
          industry: acc.industry,
          employeeCount: acc.employeeCount,
          employeeCountNumeric: parseInt(acc.employeeCount.replace(/,/g, '')) || 0,
          hqCountry: acc.hqCountry,
          hqCity: acc.hqCity || '',
          hqState: null,
          totalFunding: acc.totalFunding || '',
          estimatedAnnualRevenue: acc.estimatedAnnualRevenue || '',
          yearFounded: acc.yearFounded ? parseInt(acc.yearFounded) : 2000,
          tags: []
        }));
        // Debug logging for sample companies
        console.log('🔍 [DEBUG] Sampled companies for marketing-hiring:', sampleCompanies.map(c => ({ id: c.id, name: c.companyName })));
        // Generate results using ResultsGenerator with this sample
        const results = resultsGenerator?.generateResults(agentForTest.id, sampleCompanies);
        // Debug log: results array
        console.log('🟢 [DEBUG] Results returned by ResultsGenerator:', results);
        if (results) {
          console.log('🔍 [DEBUG] Results returned by ResultsGenerator:', results.map(r => ({ id: r.companyId, name: r.companyName, qualified: r.qualified, whyQualified: r.whyQualified })));
          setQualificationResults(results);
          
          // Convert AgentResult[] to QualifiedCompanyWithResearch[]
          const qualifiedCompanies = results
            .filter(result => result.qualified)
            .map(result => ({
              companyId: result.companyId,
              companyName: result.companyName,
              industry: result.industry,
              employeeCount: result.employeeCount,
              hqCountry: result.hqCountry,
              hqState: result.hqState,
              hqCity: result.hqCity || '',
              website: result.website,
              totalFunding: result.totalFunding,
              estimatedAnnualRevenue: result.estimatedAnnualRevenue,
              yearFounded: result.yearFounded,
              researchSummary: result.researchSummary,
              whyQualified: result.whyQualified,
              evidence: result.evidence,
              qualified: true,
              researchResults: {
                summary: result.researchSummary,
                sources: result.dataSources
              },
              assignedPersonas: [],
              confidence: result.confidence,
              confidenceScore: result.confidenceScore,
              researchDate: result.researchDate,
              dataSources: result.dataSources,
              agentId: result.agentId,
              agentName: result.agentName
            }));

          // Update selectedAgentConfig with test results
          setSelectedAgentConfig({
            agent: agentForTest,
            testResults: results,
            qualifiedCompanies
          });

          // Show results after all loading steps
          setTimeout(() => {
            setIsTestingAgent(false);
            setShowTestResults(true);
            setLoadingStep(0);
          }, 7500);
        }
        return;
      }
      
      setIsTestingAgent(true);
      setLoadingStep(0);
      setLoadingMessage("Selecting representative sample from your target list...");

      // Simulate progressive loading steps with longer duration
      setTimeout(() => {
        setLoadingStep(1);
        setLoadingMessage(`Running ${agentForTest.title} analysis on sample companies...`);
      }, 2000);

      setTimeout(() => {
        setLoadingStep(2);
        setLoadingMessage("Evaluating qualification criteria and confidence scores...");
      }, 4000);

      setTimeout(() => {
        setLoadingStep(3);
        setLoadingMessage("Preparing sample results...");
      }, 6000);

      const results = resultsGenerator?.generateResults(agentForTest.id);
      // Debug log: results array
      console.log('🟢 [DEBUG] Results returned by ResultsGenerator:', results);
      if (results) {
        setQualificationResults(results);
        
        // Convert AgentResult[] to QualifiedCompanyWithResearch[]
        const qualifiedCompanies = results
          .filter(result => result.qualified)
          .map(result => ({
            companyId: result.companyId,
            companyName: result.companyName,
            industry: result.industry,
            employeeCount: result.employeeCount,
            hqCountry: result.hqCountry,
            hqState: result.hqState,
            hqCity: result.hqCity || '',
            website: result.website,
            totalFunding: result.totalFunding,
            estimatedAnnualRevenue: result.estimatedAnnualRevenue,
            yearFounded: result.yearFounded,
            researchSummary: result.researchSummary,
            whyQualified: result.whyQualified,
            evidence: result.evidence,
            qualified: true,
            researchResults: {
              summary: result.researchSummary,
              sources: result.dataSources
            },
            assignedPersonas: [],
            confidence: result.confidence,
            confidenceScore: result.confidenceScore,
            researchDate: result.researchDate,
            dataSources: result.dataSources,
            agentId: result.agentId,
            agentName: result.agentName
          }));

        // Update selectedAgentConfig with test results
        setSelectedAgentConfig({
          agent: agentForTest,
          testResults: results,
          qualifiedCompanies
        });

        // Show results after all loading steps
        setTimeout(() => {
          setIsTestingAgent(false);
          setShowTestResults(true);
          setLoadingStep(0);
        }, 7500);
      }
    } else if (action === 'modify') {
      setIsAgentEditMode(true);
      setShowTestResults(false);
      setShowFullResults(false);
    } else if (action === 'add') {
      // Generate results for the agent
      const results = resultsGenerator?.generateResults(agentForTest.id);
      if (results) {
        // Set qualification results
        setQualificationResults(results);
        
        // Convert AgentResult[] to QualifiedCompanyWithResearch[]
        const qualifiedCompanies = results
          .filter(result => result.qualified)
          .map(result => ({
            companyId: result.companyId,
            companyName: result.companyName,
            industry: result.industry,
            employeeCount: result.employeeCount,
            hqCountry: result.hqCountry,
            hqState: result.hqState,
            hqCity: result.hqCity || '',
            website: result.website,
            totalFunding: result.totalFunding,
            estimatedAnnualRevenue: result.estimatedAnnualRevenue,
            yearFounded: result.yearFounded,
            researchSummary: result.researchSummary,
            whyQualified: result.whyQualified,
            evidence: result.evidence,
            qualified: true,
            researchResults: {
              summary: result.researchSummary,
              sources: result.dataSources
            },
            assignedPersonas: [],
            confidence: result.confidence,
            confidenceScore: result.confidenceScore,
            researchDate: result.researchDate,
            dataSources: result.dataSources,
            agentId: result.agentId,
            agentName: result.agentName
          }));

        // Update selectedAgentConfig with results
        setSelectedAgentConfig({
          agent: agentForTest,
          testResults: results,
          qualifiedCompanies
        });

        // Show confirmation in left panel and results in right panel
        setShowAgentConfirmation(true);
        setShowTestResults(true);
      }
    }
  };

  const handleStartFindingContacts = () => {
    // Proceed to Step 3
    setWorkflowStep(3);
    setCurrentStep("find-contacts");
    setActiveTab('qualified');
    setSelectedPersona(null);
    setSelectedPersonaCategoryId(null);
    setShowMultiPersonaSelection(false);
  };

  const handleTestAgentFirst = () => {
    setShowAgentConfirmation(false);
    handleAgentAction('test', selectedAgent);
  };

  const handlePersonaCategorySelect = (categoryId: string) => {
    setSelectedPersonaCategoryId(categoryId);
  };

  const handlePersonaSelect = (personaId: string) => {
    setSelectedPersonaId(personaId);
  };

  const handlePersonaPreview = (persona: Persona) => {
    console.log("Preview persona:", persona);
  };

  const handlePersonaBuild = (persona: Persona) => {
    console.log("🔍 BUILD PERSONA DEBUG:");
    console.log("Persona to configure:", persona);
    console.log("Current selectedPersonas:", selectedPersonas);
    
    // Set the selected persona for configuration (NOT add to selectedPersonas yet)
    setSelectedPersona(persona);
    setIsPersonaModifyMode(false);
    setShowPersonaTestResults(false);
    setIsTestingPersonas(false);
    setShowMultiPersonaSelection(false);
  };

  const handleAddThisPersona = () => {
    console.log("🔍 ADD THIS PERSONA DEBUG:");
    console.log("Selected persona to add:", selectedPersona);
    console.log("Current selectedPersonas:", selectedPersonas);
    
    if (selectedPersona) {
      // Create new selected persona
      const newSelectedPersona: SelectedPersona = {
        id: selectedPersona.id,
        title: selectedPersona.title,
        description: selectedPersona.description
      };
      
      // Update selectedPersonas with new persona
      const updatedPersonas = [...selectedPersonas, newSelectedPersona];
      console.log("Updated selectedPersonas:", updatedPersonas);
      
      setSelectedPersonas(updatedPersonas);
      setShowMultiPersonaSelection(true);
      setSelectedPersona(null); // Clear selected persona after adding
    }
  };

  const handleEditPersona = (persona: SelectedPersona) => {
    console.log("🔍 EDIT PERSONA DEBUG:");
    console.log("Persona to edit:", persona);
    console.log("Current selectedPersonas:", selectedPersonas);
    
    // Find the full persona data
    const personaToEdit = personas.find(p => p.id === persona.id);
    if (personaToEdit) {
      setSelectedPersona(personaToEdit);
      setIsPersonaModifyMode(true);
      setShowMultiPersonaSelection(false);
    }
  };

  const handleRemovePersona = (personaId: string) => {
    console.log("🔍 REMOVE PERSONA DEBUG:");
    console.log("Persona ID to remove:", personaId);
    console.log("Current selectedPersonas:", selectedPersonas);
    
    const updatedPersonas = selectedPersonas.filter(p => p.id !== personaId);
    console.log("Updated selectedPersonas:", updatedPersonas);
    
    setSelectedPersonas(updatedPersonas);
  };

  const handleTestAllPersonas = () => {
    setIsTestingPersonas(true);
    setShowPersonaTestResults(false);
    setShowMultiPersonaSelection(false);
    
    // Generate contacts using ContactGenerator
    if (contactGenerator && qualifiedCompanies.length > 0) {
      // Convert QualifiedCompanyWithResearch to Company for ContactGenerator
      const companiesForContacts = qualifiedCompanies.map(qc => ({
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
        hqCity: '',
        yearFounded: parseInt(qc.yearFounded.toString()),
        tags: []
      }));

      const contacts = contactGenerator.generateContactsForCompanies(
        companiesForContacts,
        selectedPersonas.length
      );
      
      // Convert GeneratedContact to PersonaTestResult
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
      
      setPersonaTestResults(testResults);
      
      // Simulate testing for exactly 3-4 seconds
      setTimeout(() => {
        setIsTestingPersonas(false);
        setShowPersonaTestResults(true);
      }, 3500);
    }
  };

  const handleContinueToCampaign = () => {
    // Transition to campaign step
    setWorkflowStep(4);
    setCurrentStep("campaign");
    setShowMultiPersonaSelection(false);
  };

  const handlePersonaAction = (action: PersonaAction) => {
    console.log('🔍 PERSONA ACTION DEBUG:');
    console.log('Action:', action);
    console.log('Current state:', {
      currentStep,
      workflowStep,
      selectedPersonas: selectedPersonas.length,
      qualifiedCompanies: selectedAgentConfig?.qualifiedCompanies.length,
      personaTestResults: personaTestResults.length
    });
    
    if (action.value === "test") {
      console.log('🧪 PERSONA TESTING DEBUG:');
      console.log('Selected personas:', selectedPersonas);
      console.log('Selected agent config:', selectedAgentConfig);
      console.log('Qualified companies:', selectedAgentConfig?.qualifiedCompanies);
      console.log('Contact generator exists:', !!contactGenerator);
      
      setIsTestingPersonas(true);
      setShowPersonaTestResults(false);
      setShowMultiPersonaSelection(false);
      
      // Check if we have qualified companies
      const qualifiedCompanies = selectedAgentConfig?.qualifiedCompanies || [];
      console.log('Companies for contact generation:', qualifiedCompanies);
      
      if (contactGenerator && qualifiedCompanies.length > 0) {
        console.log('Generating contacts for companies:', qualifiedCompanies.length);
        
        // Convert QualifiedCompanyWithResearch to Company for ContactGenerator
        const companiesForContacts = qualifiedCompanies.map(qc => {
          console.log('Converting company:', qc.companyName);
          return {
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
          };
        });
        
        console.log('Converted companies for contacts:', companiesForContacts);
        
        // Use selectedPersonas length or default to 1 if testing single persona
        const numPersonas = selectedPersonas.length || 1;
        console.log('Number of personas to generate contacts for:', numPersonas);
        
        const contacts = contactGenerator.generateContactsForCompanies(
          companiesForContacts,
          numPersonas
        );
        
        console.log('Generated contacts:', contacts);
        
        // Convert GeneratedContact to PersonaTestResult
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
        
        console.log('Converted test results:', testResults);
        setPersonaTestResults(testResults);
        
        // Simulate testing for exactly 3.5 seconds
        setTimeout(() => {
          console.log('Test complete, showing results');
          setIsTestingPersonas(false);
          setShowPersonaTestResults(true);
        }, 3500);
      } else {
        console.log('❌ Missing data for persona testing:', {
          hasContactGenerator: !!contactGenerator,
          qualifiedCompaniesCount: qualifiedCompanies.length,
          selectedPersonasCount: selectedPersonas.length
        });
        
        // Show error state
        setIsTestingPersonas(false);
        setShowPersonaTestResults(false);
      }
    } else if (action.value === "launch") {
      console.log('🚀 LAUNCH CAMPAIGN DEBUG:');
      console.log('Selected Agent Config:', {
        agent: selectedAgentConfig?.agent,
        qualifiedCompaniesCount: selectedAgentConfig?.qualifiedCompanies.length,
        testResultsCount: selectedAgentConfig?.testResults.length
      });
      console.log('Selected Personas:', selectedPersonas.map(p => ({
        id: p.id,
        title: p.title
      })));
      console.log('Persona Test Results:', {
        count: personaTestResults.length,
        sample: personaTestResults.slice(0, 2)
      });
      console.log('Qualified Companies:', {
        count: selectedAgentConfig?.qualifiedCompanies.length,
        sample: selectedAgentConfig?.qualifiedCompanies.slice(0, 2).map(c => ({
          id: c.companyId,
          name: c.companyName
        }))
      });
      console.log('Current Step:', currentStep);
      console.log('Current Workflow Step:', workflowStep);
      
      // Store campaign data in localStorage for the inbox page
      const campaignData = {
        agent: selectedAgentConfig?.agent,
        qualifiedCompanies: selectedAgentConfig?.qualifiedCompanies,
        selectedPersonas,
        personaTestResults,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('campaignData', JSON.stringify(campaignData));
      
      // Navigate to inbox page
      console.log('Navigating to inbox page...');
      router.push('/inbox');
    } else if (action.value === "modify") {
      setIsPersonaModifyMode(true);
      setShowPersonaTestResults(false);
      setIsTestingPersonas(false);
      setShowMultiPersonaSelection(false);
    }
  };

  const handlePersonaModificationSave = () => {
    setIsPersonaModifyMode(false);
    if (selectedPersonas.length > 0) {
      setShowMultiPersonaSelection(true);
    }
    console.log("Persona modifications saved");
  };

  const handlePersonaModificationCancel = () => {
    setIsPersonaModifyMode(false);
    if (selectedPersonas.length > 0) {
      setShowMultiPersonaSelection(true);
    }
    console.log("Persona modifications cancelled");
  };

  const handleViewAllResults = () => {
    setShowFullResults(true);
  };

  const renderWorkflowProgress = () => (
    <div className="w-full bg-blue-50/30 border-b border-blue-100/50 shadow-[0_1px_3px_0_rgb(0,0,0,0.05)]">
      <div className="max-w-5xl mx-auto py-6">
        <div className="flex items-center justify-center gap-4">
          {workflowSteps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`flex items-center gap-2 ${
                  index + 1 <= workflowStep ? "text-primary" : "text-muted-foreground/40"
                }`}
              >
                <span className={`flex items-center justify-center w-7 h-7 rounded-full border ${
                  index + 1 <= workflowStep ? "border-primary bg-white" : "border-muted-foreground/10 bg-white"
                }`}>
                  {index + 1 <= workflowStep ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </span>
                <span className="text-sm font-medium whitespace-nowrap">{step.label}</span>
              </div>
              {index < workflowSteps.length - 1 && (
                <ArrowRight className="w-4 h-4 mx-4 text-muted-foreground/20" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCustomizationContent = () => {
    if (customizationStage === 'customize') {
      return (
        <>
          <CustomizationPanel
            enrichmentOptions={enrichmentOptions}
            onToggleOption={handleToggleOption}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-8 border-t border-muted/20"
          >
            {/* Company count indicator */}
            <div className="mb-2 text-xs text-muted-foreground">
              Showing {uploadedAccounts.length} of {companies.length} companies in your target list
            </div>
            <Button
              onClick={() => setCustomizationStage('confirm')}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-medium"
            >
              Finish customizing data
            </Button>
          </motion.div>
        </>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-8"
      >
        <div className="bg-white rounded-lg shadow-sm border border-muted/20 p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-lg font-medium">
              Excellent! Your target account list is ready with {companies.length} companies.
            </p>
            <p className="text-muted-foreground">
              Ready for step 2 of 3 with {companies.length} companies?
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleStartResearch}
              className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base font-medium"
            >
              Start AI account research
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCurrentStep("uploading");
                setCustomizationStage('customize');
              }}
              className="h-11"
            >
              Add more accounts first
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Helper function to render action chips with active states
  const renderActionChip = (action: AgentAction) => {
    let isActive = false;
    
    // Determine if this action is currently active
    if (action.value === "test" && (isTestingAgent || showTestResults)) {
      isActive = true;
    } else if (action.value === "modify" && isAgentEditMode) {
      isActive = true;
    }

    console.log('Rendering action chip:', {
      action: action.value,
      isActive,
      isAgentEditMode
    });

    return (
      <Button
        key={action.value}
        onClick={() => handleAgentAction(action.value, selectedAgent)}
        variant={isActive ? "default" : "outline"}
        className={`rounded-full text-sm font-medium py-2 px-4 h-auto transition-colors duration-200 shadow-sm ${
          isActive
            ? "bg-purple-600 text-white hover:bg-purple-700"
            : "bg-white border-muted text-muted-foreground hover:bg-accent/10 hover:text-accent-foreground hover:border-accent/20"
        }`}
      >
        <span className="mr-2">{action.icon}</span>
        {action.label}
      </Button>
    );
  };

  // Helper function to get available persona actions based on state
  const getPersonaActions = () => {
    console.log("🔍 GET PERSONA ACTIONS DEBUG:");
    console.log("showMultiPersonaSelection:", showMultiPersonaSelection);
    console.log("selectedPersonas length:", selectedPersonas.length);
    
    const baseActions = [
      { icon: "🧪", label: "Test Personas", value: "test" },
      { icon: "✏️", label: "Modify Personas", value: "modify" }
    ];

    // Add Launch Campaign action when in multi-persona selection mode and personas are selected
    if (showMultiPersonaSelection && selectedPersonas.length > 0) {
      console.log("Adding Launch Campaign action");
      baseActions.push({
        icon: "🚀",
        label: "Launch Campaign",
        value: "launch"
      });
    }
    
    console.log("Available actions:", baseActions);
    return baseActions;
  };

  // Helper function to render persona action chips
  const renderPersonaActionChip = (action: PersonaAction) => {
    console.log('Rendering chip for action:', action.value, action.label);
    
    let isActive = false;
    
    // Determine if this action is currently active
    if (action.value === "test" && (isTestingPersonas || showPersonaTestResults)) {
      isActive = true;
    } else if (action.value === "modify" && isPersonaModifyMode) {
      isActive = true;
    }

    return (
      <Button
        key={action.value}
        onClick={() => {
          if (action.value === "launch" && showMultiPersonaSelection) {
            console.log('Launch Campaign clicked');
            handlePersonaAction(action);
          } else {
            console.log('Chip clicked:', action.value);
            handlePersonaAction(action);
          }
        }}
        variant={isActive ? "default" : "outline"}
        className={`rounded-full text-sm font-medium py-2 px-4 h-auto transition-colors duration-200 shadow-sm ${
          isActive
            ? "bg-purple-600 text-white hover:bg-purple-700"
            : "bg-white border-muted text-muted-foreground hover:bg-accent/10 hover:text-accent-foreground hover:border-accent/20"
        }`}
      >
        <span className="mr-2">{action.icon}</span>
        {action.label}
      </Button>
    );
  };

  // Update mock data to use data from useDataConfig
  const mockQualifiedCompanies = companies.filter(c => c.tags.includes('qualified')) || [];
  const mockQualificationResults = qualificationResults;

  // Update the MultiPersonaSelectionCard to show selected personas
  const renderMultiPersonaSelection = () => (
    <MultiPersonaSelectionCard
      selectedPersonas={selectedPersonas}
      availablePersonas={personas}
      onEditPersona={handleEditPersona}
      onRemovePersona={handleRemovePersona}
      onBuildPersona={handlePersonaBuild}
      onContinueToCampaign={handleContinueToCampaign}
    />
  );

  // Update the persona testing view to include action buttons
  const renderPersonaTestingView = () => {
    if (isTestingPersonas) {
      return (
        <div className="h-full flex items-center justify-center p-8">
          <div className="text-center space-y-6">
            <KoalaLoadingIndicator />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-800 max-w-md">
                Testing {selectedPersonas.length || 1} persona{selectedPersonas.length !== 1 ? 's' : ''} on your qualified companies...
              </p>
              <p className="text-sm text-gray-600 max-w-md">
                Finding contacts that match your persona criteria
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (showPersonaTestResults) {
      if (personaTestResults.length === 0) {
        return (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No contacts found</AlertTitle>
                <AlertDescription>
                  We couldn't find any contacts matching your persona criteria. Try modifying your persona or selecting different companies.
                </AlertDescription>
              </Alert>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPersonaTestResults(false);
                  setIsPersonaModifyMode(true);
                }}
              >
                Modify Persona
              </Button>
            </div>
          </div>
        );
      }

      return (
        <div className="p-8">
          <div className="space-y-6">
            <PersonaTestResultsTable 
              results={personaTestResults}
              onAddThisPersona={() => {
                console.log('🔍 ADD TESTED PERSONA DEBUG:');
                console.log('Selected persona:', selectedPersona);
                console.log('Current selectedPersonas:', selectedPersonas);
                
                if (selectedPersona) {
                  const newSelectedPersona: SelectedPersona = {
                    id: selectedPersona.id,
                    title: selectedPersona.title,
                    description: selectedPersona.description
                  };
                  
                  setSelectedPersonas([...selectedPersonas, newSelectedPersona]);
                  setShowMultiPersonaSelection(true);
                  setShowPersonaTestResults(false);
                  setSelectedPersona(null);
                }
              }}
              onBackToConfiguration={() => {
                setShowPersonaTestResults(false);
              }}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  if (currentStep === "find-contacts") {
    const qualifiedCount = selectedAgentConfig?.qualifiedCompanies.length || 0;
    const totalCount = selectedAgentConfig?.testResults.length || 0;
    
    return (
      <div className="flex flex-col w-full h-screen">
        {renderWorkflowProgress()}
        <div className="flex flex-1 h-[calc(100vh-76px)]">
          <div className="w-[35%] border-r border-muted/20 bg-background p-8 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {showMultiPersonaSelection ? (
                <>
                  <div className="space-y-3">
                    <h2 className="text-lg font-medium text-primary">
                      Perfect! You have {selectedPersonas.length} persona{selectedPersonas.length !== 1 ? 's' : ''} selected. Add more personas or launch your campaign.
                    </h2>
                    <p className="text-muted-foreground">
                      Step 3 of 3: Launch targeted outreach
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {getPersonaActions().map(renderPersonaActionChip)}
                  </div>

                  <div className="pt-4">
                    <ChatInput
                      onSend={handleSend}
                      placeholder="Ask about persona targeting or next steps..."
                    />
                  </div>
                </>
              ) : selectedPersona ? (
                <>
                  <div className="space-y-3">
                    <h2 className="text-lg font-medium text-primary">
                      Configure your persona for targeted outreach at {qualifiedCount} qualified companies.
                    </h2>
                    <p className="text-muted-foreground">
                      Step 3 of 3: Configure persona and targeting
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {getPersonaActions().map(renderPersonaActionChip)}
                  </div>

                  <div className="pt-4">
                    <ChatInput
                      onSend={handleSend}
                      placeholder="Ask about persona targeting or next steps..."
                    />
                  </div>
                </>
              ) : selectedPersonaCategoryId ? (
                <>
                  <div className="space-y-3">
                    <p className="text-lg font-medium text-primary">
                      Great! Your research agent identified {qualifiedCount} qualified companies. Now let's find the right contacts at these companies.
                    </p>
                    <p className="text-muted-foreground">
                      Step 3 of 3: Find contacts at qualified companies
                    </p>
                  </div>

                  <div className="pt-4">
                    <ChatInput
                      onSend={handleSend}
                      placeholder="Ask about contact finding or next steps..."
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <p className="text-lg font-medium text-primary">
                      Let's identify the right personas to target at these {qualifiedCount} qualified companies.
                    </p>
                    <p className="text-muted-foreground">
                      Choose the marketing roles most likely to have budget and pain points that Segment addresses.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {personaOptions.map((option) => (
                      <ResearchStrategyCard
                        key={option.id}
                        strategy={option}
                        isSelected={selectedPersonaCategoryId === option.id}
                        onClick={() => handlePersonaCategorySelect(option.id)}
                      />
                    ))}
                  </div>

                  <div className="pt-4">
                    <ChatInput
                      onSend={handleSend}
                      placeholder="Ask about contact finding or next steps..."
                    />
                  </div>
                </>
              )}
            </motion.div>
          </div>
          <div className="w-[65%] bg-muted/10 overflow-y-auto">
            {isTestingPersonas || showPersonaTestResults ? (
              renderPersonaTestingView()
            ) : isPersonaModifyMode && selectedPersona ? (
              <PersonaModificationCard 
                persona={selectedPersona}
                onSave={handlePersonaModificationSave}
                onCancel={handlePersonaModificationCancel}
              />
            ) : showMultiPersonaSelection ? (
              renderMultiPersonaSelection()
            ) : selectedPersona ? (
              <PersonaConfigurationCard 
                persona={selectedPersona}
                onAddThisPersona={handleAddThisPersona}
              />
            ) : selectedPersonaCategoryId ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8"
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Choose the buyer types you want to target for your sales outreach</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {personas.map((persona) => (
                      <PersonaCard
                        key={persona.id}
                        persona={persona}
                        onBuildClick={handlePersonaBuild}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8"
              >
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold">Marketing Personas Hiring?</h2>
                      <p className="text-muted-foreground">
                        Identify companies actively expanding their marketing teams, particularly in leadership and specialized roles
                      </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                      <button
                        onClick={() => setActiveResultsTab('qualified')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          activeResultsTab === 'qualified'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Qualified ({qualifiedCount})
                      </button>
                      <button
                        onClick={() => setActiveResultsTab('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          activeResultsTab === 'all'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        All Tested ({totalCount})
                      </button>
                    </div>

                    {/* Results Table */}
                    <div>
                      {selectedAgentConfig?.agent && (
                        <QualificationResultsTable
                          results={selectedAgentConfig?.testResults || []}
                          allTestedCount={totalCount}
                          qualifiedCount={qualifiedCount}
                          companies={lastTestedCompanies.length > 0 ? lastTestedCompanies : uploadedAccounts.slice(0, 10)}
                          activeTab={activeResultsTab}
                          setActiveTab={setActiveResultsTab}
                          onViewAllResults={activeResultsTab !== 'all' ? handleViewAllResults : undefined}
                          agent={selectedAgentConfig.agent}
                          icon={categories.find(c => c.id === selectedCategoryId)?.icon || '🤖'}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Persona Configuration Modal */}
        <PersonaConfigurationModal
          isOpen={isPersonaModalOpen}
          onClose={() => setIsPersonaModalOpen(false)}
        />
      </div>
    );
  }

  if (currentStep === "agent-details") {
    return (
      <div className="flex flex-col w-full h-screen">
        {renderWorkflowProgress()}
        <div className="flex flex-1 h-[calc(100vh-76px)]">
          <div className="w-[40%] border-r border-muted/20 bg-background p-8 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {showAgentConfirmation ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-lg font-medium">
                      Perfect! Your {selectedAgent?.title} research agent is ready for deployment.
                    </p>
                    <p className="text-muted-foreground">
                      Ready for step 3 of 3?
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={handleStartFindingContacts}
                      className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base font-medium"
                    >
                      Find contacts at qualified companies
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleTestAgentFirst}
                      className="h-11"
                    >
                      Test this agent first
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <p className="text-lg font-medium text-primary">
                      Let's explore the {selectedAgent?.title} agent. You can test it on your companies or modify the approach before adding it to your campaign.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {agentActions.map(renderActionChip)}
                  </div>

                  <div className="pt-4">
                    <ChatInput
                      onSend={handleSend}
                      placeholder="Choose above or ask about the agent..."
                    />
                  </div>
                </>
              )}
            </motion.div>
          </div>
          <div className="w-[60%] bg-muted/10 overflow-y-auto">
            {isTestingAgent ? (
              <div className="h-full flex items-center justify-center p-8">
                <div className="w-full max-w-2xl">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 space-y-8">
                    {/* Agent Title Section */}
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-semibold text-gray-900">
                        {selectedAgent?.title}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Sample Testing in Progress
                      </p>
                    </div>

                    {/* Loading Animation */}
                    <div className="flex justify-center">
                      <KoalaLoadingIndicator />
                    </div>

                    {/* Progress Steps */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">Step {loadingStep + 1} of 4</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500 ease-in-out"
                          style={{ width: `${((loadingStep + 1) / 4) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Current Status */}
                    <div className="space-y-4">
                      <div className="text-center space-y-2">
                        <p className="text-lg font-medium text-gray-900">
                          {loadingMessage}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Testing on 10 of {uploadedAccounts.length} companies
                        </p>
                      </div>
                    </div>

                    {/* Educational Content */}
                    <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                      <h3 className="text-sm font-medium text-blue-900">
                        Why Sample Testing?
                      </h3>
                      <p className="text-sm text-blue-700">
                        We test on a representative sample first to ensure the agent's criteria are relevant before analyzing your full target list. This saves time and helps optimize your campaign strategy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : showTestResults ? (
              (() => {
                const allTestedCount = selectedAgentConfig?.testResults?.length || 0;
                const qualifiedCount = (selectedAgentConfig?.testResults || []).filter(r => r.qualified).length;
                let resultsToShow = activeResultsTab === 'all'
                  ? selectedAgentConfig?.testResults || []
                  : (selectedAgentConfig?.testResults || []).filter(r => r.qualified);
                if (activeResultsTab === 'all' && resultsToShow.length < 10) {
                  const missing = 10 - resultsToShow.length;
                  const pad = Array.from({ length: missing }, (_, i) => ({
                    companyId: `placeholder-${i}`,
                    companyName: '—',
                    qualified: false,
                    website: '',
                    industry: '',
                    employeeCount: '',
                    hqCountry: '',
                    hqState: '',
                    hqCity: '',
                    totalFunding: '',
                    estimatedAnnualRevenue: '',
                    yearFounded: 0,
                    researchSummary: '',
                    whyQualified: '',
                    evidence: [],
                    selectedOptions: [],
                    questionType: '',
                    confidence: 0,
                    confidenceScore: 0,
                    researchDate: '',
                    dataSources: [],
                    agentId: '',
                    agentName: ''
                  }));
                  resultsToShow = [...resultsToShow, ...pad];
                }
                return (
                  <div className="p-8">
                    {selectedAgentConfig?.agent && (
                      <QualificationResultsTable
                        results={resultsToShow}
                        allTestedCount={allTestedCount}
                        qualifiedCount={qualifiedCount}
                        companies={lastTestedCompanies.length > 0 ? lastTestedCompanies : uploadedAccounts.slice(0, 10)}
                        activeTab={activeResultsTab}
                        setActiveTab={setActiveResultsTab}
                        onViewAllResults={activeResultsTab !== 'all' ? handleViewAllResults : undefined}
                        agent={selectedAgentConfig.agent}
                        icon={categories.find(c => c.id === selectedCategoryId)?.icon || '🤖'}
                      />
                    )}
                  </div>
                );
              })()
            ) : (
              selectedAgent && (
                <AgentDetails 
                  agent={selectedAgent} 
                  isEditMode={isAgentEditMode}
                  icon={categories.find(c => c.id === selectedCategoryId)?.icon || "🤖"}
                  onSave={({ questionType, researchQuestion, selectedSources }) => {
                    const updatedAgent = selectedAgent ? {
                      ...selectedAgent,
                      questionType,
                      researchQuestion,
                      sources: selectedSources
                    } : null;
                    
                    setSelectedAgent(updatedAgent);
                    
                    // Update the ResultsGenerator with the modified agent
                    if (updatedAgent && resultsGenerator) {
                      // Find and update the agent in the agents array
                      const updatedAgents = agents.map(agent => 
                        agent.id === updatedAgent.id ? updatedAgent : agent
                      );
                      setResultsGenerator(new ResultsGenerator(companies, updatedAgents));
                    }
                    
                    setIsAgentEditMode(false);
                  }}
                  onSourcesChange={(sources) => {
                    console.log('[DEBUG] onSourcesChange fired with:', sources);
                    if (selectedAgent) {
                      const updatedAgent = { ...selectedAgent, sources };
                      console.log('[DEBUG] Updating selectedAgent:', updatedAgent);
                      setSelectedAgent(updatedAgent);
                      // Update ResultsGenerator with new sources immediately
                      if (resultsGenerator) {
                        const updatedAgents = agents.map(agent =>
                          agent.id === updatedAgent.id ? updatedAgent : agent
                        );
                        setResultsGenerator(new ResultsGenerator(companies, updatedAgents));
                        console.log('[DEBUG] ResultsGenerator updated with new agents:', updatedAgents);
                      }
                    }
                  }}
                />
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "researching") {
    return (
      <div className="flex flex-col w-full h-screen">
        {renderWorkflowProgress()}
        <div className="flex flex-1 h-[calc(100vh-76px)]">
          <div className="w-[40%] border-r border-muted/20 bg-background p-8 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <p className="text-lg font-medium text-primary">
                  Let's identify a research topic to deploy across your account list.
                </p>
                <p className="text-muted-foreground">
                  This will help identify which accounts are prime for a specific personalized campaign.
                </p>
              </div>

              <div className="space-y-4">
                {categories.map((category) => (
                  <ResearchStrategyCard
                    key={category.id}
                    strategy={{
                      id: category.id,
                      icon: category.icon,
                      title: category.title,
                      description: category.description,
                      agents: category.agents
                    }}
                    isSelected={selectedCategoryId === category.id}
                    onClick={() => {
                      setSelectedCategoryId(category.id);
                      setSelectedResearchStrategyId(null);
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
          <div className="w-[60%] p-8 bg-muted/10 overflow-y-auto">
            {selectedCategoryId ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-lg font-medium">
                      {categories.find(c => c.id === selectedCategoryId)?.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {categories.find(c => c.id === selectedCategoryId)?.description}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {categories.find(c => c.id === selectedCategoryId)?.agents.length} agents available
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {categories
                    .find(c => c.id === selectedCategoryId)
                    ?.agents.map((agent) => (
                      <AgentCard 
                        key={agent.id} 
                        agent={agent}
                        onBuildClick={handleBuildAgent}
                      />
                    ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center text-muted-foreground"
              >
                Select a research category to see available agents
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "customizing") {
    const totalPages = Math.ceil(uploadedAccounts.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentPageAccounts = uploadedAccounts.slice(startIndex, endIndex);

    return (
      <div className="flex flex-col w-full h-screen">
        {renderWorkflowProgress()}
        <div className="flex flex-1 h-[calc(100vh-76px)]">
          <div className="w-[35%] border-r border-muted/20 bg-background">
            {renderCustomizationContent()}
          </div>
          <div className="w-[65%] p-8 bg-muted/10">
            {/* Table header with company count and pagination */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                Showing {pageSize} of {uploadedAccounts.length} companies in your target list
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-muted/50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                </Button>
                <span className="text-sm text-muted-foreground">{currentPage} of {totalPages}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-muted/50"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
            <AccountTable
              accounts={currentPageAccounts}
              enrichmentOptions={enrichmentOptions}
            />
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "inbox") {
    console.log('📥 INBOX STEP DEBUG:');
    console.log('Rendering inbox step with data:', {
      workflowStep,
      selectedAgentConfig: {
        agent: selectedAgentConfig?.agent,
        qualifiedCompaniesCount: selectedAgentConfig?.qualifiedCompanies.length
      },
      selectedPersonas: {
        count: selectedPersonas.length,
        personas: selectedPersonas.map(p => p.title)
      },
      personaTestResults: {
        count: personaTestResults.length,
        sample: personaTestResults.slice(0, 2)
      }
    });

    return (
      <div className="flex flex-col w-full h-screen">
        {renderWorkflowProgress()}
        <div className="flex flex-1 h-[calc(100vh-76px)]">
          <div className="w-full p-8 bg-muted/10 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">Campaign Ready to Launch</h2>
                    <p className="text-muted-foreground">
                      Your campaign is ready with {selectedAgentConfig?.qualifiedCompanies.length} qualified companies and {personaTestResults.length} targeted contacts
                    </p>
                  </div>

                  {/* Campaign Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Research Agent</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-semibold">{selectedAgentConfig?.agent.title}</p>
                        <p className="text-sm text-muted-foreground">{selectedAgentConfig?.qualifiedCompanies.length} qualified companies</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Target Personas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-semibold">{selectedPersonas.length} personas</p>
                        <p className="text-sm text-muted-foreground">{personaTestResults.length} contacts found</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Campaign Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-semibold text-green-600">Ready to Launch</p>
                        <p className="text-sm text-muted-foreground">All data prepared</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={() => {
                        console.log('🎯 LAUNCH BUTTON CLICKED:');
                        console.log('Launching campaign with data:', {
                          agent: selectedAgentConfig?.agent,
                          qualifiedCompanies: selectedAgentConfig?.qualifiedCompanies.length,
                          personas: selectedPersonas.length,
                          contacts: personaTestResults.length
                        });
                        // Handle campaign launch
                      }}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Launch Campaign
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        console.log('Back to personas clicked');
                        setWorkflowStep(3);
                        setCurrentStep("find-contacts");
                      }}
                    >
                      Back to Personas
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {renderWorkflowProgress()}
      <div className={`flex flex-col items-center justify-center w-full mx-auto pt-20 ${
        currentStep === "initial" ? "max-w-3xl" : "max-w-4xl"
      }`}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3 mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            Let&apos;s build your hyperpersonalized outbound campaign
          </h1>
          <p className="text-base text-muted-foreground">
            Step 1 of 3: Build your target account list
          </p>
        </motion.div>

        {currentStep === "initial" ? (
          <div className="space-y-8">
            <ChatInput
              onSend={handleSend}
              placeholder="Choose an option below or describe your needs..."
            />

            <motion.div
              className="flex flex-wrap gap-4 justify-center mt-4 px-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <SuggestionChip
                    icon={suggestion.icon}
                    label={suggestion.title}
                    onClick={suggestion.onClick}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        ) : currentStep === "uploading" ? (
          <CsvUploadArea onUploadSuccess={handleUploadSuccess} />
        ) : null}
      </div>
    </>
  );
}