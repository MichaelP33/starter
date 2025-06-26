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
import { motion, AnimatePresence } from "framer-motion";
import AgentDetails from "./AgentDetails";
import { CampaignLaunchScreen } from "./CampaignLaunchScreen";
import { AutoTestLoadingScreen } from "./AutoTestLoadingScreen";

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

// Persona options for contact finding - updated to match actual persona categories
const personaOptions: ResearchStrategy[] = [
  {
    id: "data-driven-marketers",
    icon: "📊",
    title: "Data-Driven Marketers",
    description: "Marketing professionals who rely on data and analytics to drive campaign performance and customer insights",
    agents: []
  },
  {
    id: "data-team",
    icon: "🔬",
    title: "Data Team",
    description: "Data engineers, analysts, and scientists responsible for data infrastructure and analytics",
    agents: []
  },
  {
    id: "engineering-leadership",
    icon: "⚙️",
    title: "Engineering Leadership",
    description: "Technical leaders overseeing product development, infrastructure, and engineering teams",
    agents: []
  },
  {
    id: "executive-leadership",
    icon: "👔",
    title: "Executive Leadership",
    description: "C-level executives and senior leadership making strategic technology and budget decisions",
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
  const { 
    companies, 
    agents, 
    personas: initialPersonas, 
    personaCategories,
    isLoadingCompanies, 
    isLoadingAgents, 
    isLoadingPersonas, 
    hasError, 
    errors,
    getPersonasByCategory: getPersonasByCategoryFromHook,
    getPersonaCategory
  } = useDataConfig();
  
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
  const [isLaunchingCampaign, setIsLaunchingCampaign] = useState(false);
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
  const [activeResultsTab, setActiveResultsTab] = useState<'qualified' | 'needsReview' | 'all'>('qualified');
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [phaseLabel, setPhaseLabel] = useState("");
  const [hasManuallyTestedAgent, setHasManuallyTestedAgent] = useState(false);
  const [autoTestInProgress, setAutoTestInProgress] = useState(false);

  useEffect(() => {
    if (initialPersonas.length > 0) {
      setPersonas(initialPersonas);
    }
  }, [initialPersonas]);

  const getPersonasByCategory = (categoryId: string | null) => {
    if (!categoryId) return [];
    return personas.filter(p => p.categoryId === categoryId);
  };

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
    if (!agent) {
      console.error("handleAgentAction called with null agent");
      return;
    }

    console.log(`[DEBUG] handleAgentAction: action=${action}, agentId=${agent.id}`);

    const agentForTest = {
      ...agent,
      questionType: selectedAgent?.questionType || agent.questionType || 'Boolean',
    };

    if (action === 'test') {
      setIsTestingAgent(true);
      setHasManuallyTestedAgent(true);
      setAutoTestInProgress(false);
      setLoadingStep(0);
      setLoadingMessage("Selecting representative sample from your target list...");

      // Simulate loading steps
      setTimeout(() => setLoadingMessage("Running analysis on sample companies..."), 2000);
      setTimeout(() => setLoadingMessage("Evaluating qualification criteria..."), 4000);
      setTimeout(() => setLoadingMessage("Preparing sample results..."), 6000);

      // Generate results
      const sample = [...uploadedAccounts].sort(() => 0.5 - Math.random()).slice(0, 10);
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
      const results = resultsGenerator?.generateResults(agentForTest.id, sampleCompanies);
      if (results) {
        setQualificationResults(results);
        const allCompanies: QualifiedCompanyWithResearch[] = results
          .map(r => ({ ...r, assignedPersonas: [], researchResults: { summary: r.researchSummary, sources: r.dataSources } }));
        setSelectedAgentConfig({ agent: agentForTest, testResults: results, qualifiedCompanies: allCompanies });
        setQualifiedCompanies(allCompanies);
      }

      setTimeout(() => {
        setIsTestingAgent(false);
        setShowTestResults(true);
        setLoadingStep(0);
      }, 7500);

    } else if (action === 'modify') {
      setIsAgentEditMode(true);
      setShowTestResults(false);
      setShowFullResults(false);

    } else if (action === 'add') {
      if (hasManuallyTestedAgent) {
        const results = resultsGenerator?.generateResults(agentForTest.id);
        if (results) {
          setQualificationResults(results);
          // Connect selected personas to qualified companies
          const personaNames = selectedPersonas.map(p => p.name);
          console.log('---CONNECTING PERSONAS---');
          console.log('Selected personas:', personaNames);
          
          const allCompanies: QualifiedCompanyWithResearch[] = results.map(r => ({
            ...r,
            assignedPersonas: r.qualified ? personaNames : [],
            researchResults: { summary: r.researchSummary, sources: r.dataSources },
          }));

          console.log('Companies with assigned personas:', allCompanies.filter(c => c.assignedPersonas.length > 0));
          
          setSelectedAgentConfig({
            agent: agentForTest,
            testResults: results,
            qualifiedCompanies: allCompanies,
          });
          setQualifiedCompanies(allCompanies);

          // Show confirmation/results screen, do NOT advance yet
          setShowAgentConfirmation(true);
          setShowTestResults(true);
        }
      } else {
        setIsTestingAgent(true);
        setHasManuallyTestedAgent(true);
        setAutoTestInProgress(true);
        setLoadingStep(0);
        setLoadingMessage("Selecting representative sample from your target list...");

        // Simulate loading steps
        setTimeout(() => setLoadingMessage("Running analysis on sample companies..."), 2000);
        setTimeout(() => setLoadingMessage("Evaluating qualification criteria..."), 4000);
        setTimeout(() => setLoadingMessage("Preparing sample results..."), 6000);

        // Generate results
        const sample = [...uploadedAccounts].sort(() => 0.5 - Math.random()).slice(0, 10);
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
        const results = resultsGenerator?.generateResults(agentForTest.id, sampleCompanies);
        if (results) {
          setQualificationResults(results);
          const allCompanies: QualifiedCompanyWithResearch[] = results
            .map(r => ({ ...r, assignedPersonas: [], researchResults: { summary: r.researchSummary, sources: r.dataSources } }));
          setSelectedAgentConfig({ agent: agentForTest, testResults: results, qualifiedCompanies: allCompanies });
          setQualifiedCompanies(allCompanies);
        }

        setTimeout(() => {
          setIsTestingAgent(false);
          setLoadingStep(0);
          setAutoTestInProgress(false);
          // Show confirmation/results screen, do NOT advance yet
          setShowAgentConfirmation(true);
          setShowTestResults(true);
          setCurrentStep('agent-details');
          setWorkflowStep(2);
        }, 7500);
      }
    }
  };

  const handleStartFindingContacts = () => {
    // Clear all agent-related displays
    setShowTestResults(false);
    setShowAgentConfirmation(false);
    setShowFullResults(false);
    setIsTestingAgent(false);
    
    // Proceed to Step 3
    setWorkflowStep(3);
    setCurrentStep("find-contacts");
    setActiveTab('qualified');
    setSelectedPersona(null);
    setSelectedPersonaCategoryId(null);
    setShowMultiPersonaSelection(false);

    // Update qualified companies with selected personas before proceeding
    if (selectedAgentConfig) {
      const personaNames = selectedPersonas.map(p => p.name);
      const defaultPersona = personaNames[0] || 'Growth Marketing Leader';
      const updatedCompanies = selectedAgentConfig.qualifiedCompanies.map(c => ({
        ...c,
        assignedPersonas: c.qualified
          ? (personaNames.length > 0 ? personaNames : [defaultPersona])
          : [],
      }));
      setSelectedAgentConfig(prev => prev ? { ...prev, qualifiedCompanies: updatedCompanies } : null);
      setQualifiedCompanies(updatedCompanies);
      console.log('---UPDATING QUALIFIED COs WITH PERSONAS---');
      console.log('Personas to assign:', personaNames);
      console.log('Updated companies:', updatedCompanies.filter(c => c.assignedPersonas.length > 0));
    }
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
    console.log("Current selectedPersona before:", selectedPersona);
    
    // Set the selected persona for configuration (NOT add to selectedPersonas yet)
    setSelectedPersona(persona);
    setIsPersonaModifyMode(false);
    setShowPersonaTestResults(false);
    setIsTestingPersonas(false);
    setShowMultiPersonaSelection(false);
    
    console.log("🔍 BUILD PERSONA DEBUG - State updated:");
    console.log("selectedPersona should now be:", persona);
    console.log("isPersonaModifyMode:", false);
    console.log("showPersonaTestResults:", false);
    console.log("isTestingPersonas:", false);
    console.log("showMultiPersonaSelection:", false);
  };

  const handleAddThisPersona = () => {
    console.log("🔍 ADD THIS PERSONA DEBUG:");
    console.log("Selected persona to add:", selectedPersona);
    console.log("Current selectedPersonas:", selectedPersonas);
    
    if (selectedPersona) {
      // Create new selected persona
      const newSelectedPersona: SelectedPersona = {
        id: selectedPersona.id,
        name: selectedPersona.name,
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
    // Instead of immediately saving and routing, trigger the animated launch flow
    handlePersonaAction({ value: 'launch', icon: '🚀', label: 'Launch Campaign' });
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
      setIsLaunchingCampaign(true);

      const agentName = selectedAgentConfig?.agent?.title || 'the selected';
      const researchQuestion = selectedAgentConfig?.agent?.researchQuestion || '';
      // 8 steps: 2 per phase
      const messages = [
        // Full Prospect Analysis
        "Scanning your entire prospect list of 152 companies...",
        "Running Marketing Personas Hiring? analysis across all targets...",
        // Company Qualification
        "Identifying companies that match your criteria...",
        "Finding businesses actively hiring marketing talent...",
        // Contact Discovery
        "Searching for qualified contacts at target companies...",
        "Matching prospects to your selected personas...",
        // List Building
        "Building your personalized target list...",
        "Preparing contact workflows and outreach sequences..."
      ];
      const phaseLabels = [
        "Full Prospect Analysis",
        "Full Prospect Analysis",
        "Company Qualification",
        "Company Qualification",
        "Contact Discovery",
        "Contact Discovery",
        "List Building",
        "List Building"
      ];
      let messageIndex = 0;
      setLoadingMessage(messages[messageIndex]);
      setLoadingStep(messageIndex);
      setPhaseLabel(phaseLabels[messageIndex]);

      const intervalId = setInterval(() => {
        messageIndex++;
        if (messageIndex < messages.length) {
          setLoadingMessage(messages[messageIndex]);
          setLoadingStep(messageIndex);
          setPhaseLabel(phaseLabels[messageIndex]);
        } else {
          clearInterval(intervalId);
        }
      }, 1000);

      setTimeout(() => {
        const campaignData = {
          agent: selectedAgentConfig?.agent,
          qualifiedCompanies: selectedAgentConfig?.qualifiedCompanies,
          selectedPersonas,
          personaTestResults,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('campaignData', JSON.stringify(campaignData));
        router.push('/inbox');
        setIsLaunchingCampaign(false);
      }, 8200);
    } else if (action.value === "modify") {
      setIsPersonaModifyMode(true);
      setShowPersonaTestResults(false);
      setIsTestingPersonas(false);
      setShowMultiPersonaSelection(false);
    }
  };

  const handlePersonaModificationSave = (modifiedData: { name: string; description: string; titles: string[] }) => {
    if (selectedPersona) {
      const { name, description, titles } = modifiedData;

      // Update the main persona list in the `personas` state
      setPersonas(prevPersonas =>
        prevPersonas.map(p =>
          p.id === selectedPersona.id
            ? { ...p, name, description, titles, expandedTitles: titles, expandedName: name, seniorName: name }
            : p
        )
      );

      const modifiedSelectedPersona: SelectedPersona = {
        id: selectedPersona.id,
        name,
        description
      };

      // Update or add the persona to the selected list
      setSelectedPersonas(prevSelected => {
        const existingIndex = prevSelected.findIndex(p => p.id === selectedPersona.id);

        if (existingIndex > -1) {
          // If it exists, update it
          const newSelected = [...prevSelected];
          newSelected[existingIndex] = modifiedSelectedPersona;
          return newSelected;
        } else {
          // If it doesn't exist, add it
          return [...prevSelected, modifiedSelectedPersona];
        }
      });

      setSelectedPersona(null);
      setIsPersonaModifyMode(false);
      setShowMultiPersonaSelection(true);
    }
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

  // Function to clear modified agents (for testing/debugging)
  const clearModifiedAgents = () => {
    localStorage.removeItem('modifiedAgents');
    console.log('[DEBUG] Modified agents cleared from localStorage');
    // Reload the page to refresh agent data
    window.location.reload();
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
                    name: selectedPersona.name,
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

  if (isLaunchingCampaign) {
    const phaseNumber = Math.floor(loadingStep / 2) + 1;
    return (
      <div className="flex flex-col w-full h-screen">
        {renderWorkflowProgress()}
        <CampaignLaunchScreen 
          agent={selectedAgentConfig?.agent || null}
          loadingMessage={loadingMessage}
          loadingStep={loadingStep}
          phaseLabel={phaseLabel}
          phaseNumber={phaseNumber}
        />
      </div>
    );
  }

  if (currentStep === "find-contacts") {
    return (
      <div className="flex flex-col w-full h-screen">
        {renderWorkflowProgress()}
        <div className="flex flex-1 h-[calc(100vh-76px)]">
          {/* Left Panel: Persona Categories */}
          <div className="w-[40%] border-r border-muted/20 bg-background p-8 overflow-y-auto">
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
                      Configure your persona for targeted outreach at {qualifiedCompanies.length} qualified companies.
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
              ) : (
                <>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">
                      Let's identify the right personas to target at these {qualifiedCompanies.length} qualified companies.
                    </h2>
                    <p className="text-muted-foreground">
                      Choose the marketing roles most likely to have budget and pain points that Segment addresses.
                    </p>
                  </div>
                  <div className="space-y-4">
                    {personaOptions.map((category) => (
                      <ResearchStrategyCard
                        key={category.id}
                        strategy={{
                          id: category.id,
                          icon: category.icon,
                          title: category.title,
                          description: category.description,
                          agents: category.agents
                        }}
                        isSelected={selectedPersonaCategoryId === category.id}
                        onClick={() => handlePersonaCategorySelect(category.id)}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* Right Panel: Personas or Empty State */}
          <div className="w-[60%] bg-muted/10 overflow-y-auto p-8">
            {(() => {
              console.log("🔍 RENDERING DEBUG - Right Panel State:", {
                selectedPersonaCategoryId,
                selectedPersona: selectedPersona?.name || null,
                isTestingPersonas,
                showPersonaTestResults,
                isPersonaModifyMode,
                showMultiPersonaSelection,
                personasCount: selectedPersonaCategoryId ? getPersonasByCategory(selectedPersonaCategoryId).length : 0
              });
              return null;
            })()}
            <AnimatePresence>
              {!selectedPersonaCategoryId ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex items-center justify-center"
                >
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-700">Select a persona category</p>
                    <p className="text-sm text-gray-500">Choose a category from the left to see available personas.</p>
                  </div>
                </motion.div>
              ) : isTestingPersonas || showPersonaTestResults ? (
                <motion.div
                  key="persona-testing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {renderPersonaTestingView()}
                </motion.div>
              ) : isPersonaModifyMode && selectedPersona ? (
                <motion.div
                  key="persona-modify"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <PersonaModificationCard 
                    persona={selectedPersona}
                    onSave={handlePersonaModificationSave}
                    onCancel={handlePersonaModificationCancel}
                  />
                </motion.div>
              ) : showMultiPersonaSelection ? (
                <motion.div
                  key="multi-persona"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <MultiPersonaSelectionCard
                    selectedPersonas={selectedPersonas}
                    availablePersonas={personas}
                    onEditPersona={handleEditPersona}
                    onRemovePersona={handleRemovePersona}
                    onBuildPersona={handlePersonaBuild}
                    onContinueToCampaign={handleContinueToCampaign}
                  />
                </motion.div>
              ) : selectedPersona ? (
                <motion.div
                  key="persona-config"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <PersonaConfigurationCard
                    persona={selectedPersona}
                    onAddThisPersona={handleAddThisPersona}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="personas"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {getPersonasByCategory(selectedPersonaCategoryId).map((persona) => (
                    <PersonaCard
                      key={persona.id}
                      persona={persona}
                      onBuildClick={handlePersonaBuild}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
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
                      onClick={() => {
                        setCurrentStep("researching");
                        setWorkflowStep(2);
                      }}
                      className="h-11"
                    >
                      Choose a different agent
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
                        {autoTestInProgress ? (
                          <>
                            <span className="text-green-600">✨ Auto-testing in progress: We're making sure your agent is ready for action!</span>
                            <p className="text-sm text-gray-700">You skipped manual testing, so we're running a quick check for you.</p>
                          </>
                        ) : (
                          "Sample Testing in Progress"
                        )}
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
                        {autoTestInProgress ? (
                          <>
                            To ensure quality, we always test agents before adding them to your campaign. This helps you get the best results, every time.
                          </>
                        ) : (
                          "We test on a representative sample first to ensure the agent's criteria are relevant before analyzing your full target list. This saves time and helps optimize your campaign strategy."
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : showTestResults ? (
              (() => {
                const allTestedCount = selectedAgentConfig?.testResults?.length || 0;
                const qualifiedCount = (selectedAgentConfig?.testResults || []).filter(r => r.qualified && !r.needsReview).length;
                const needsReviewCount = (selectedAgentConfig?.testResults || []).filter(r => r.needsReview).length;
                let resultsToShow = activeResultsTab === 'all'
                  ? selectedAgentConfig?.testResults || []
                  : activeResultsTab === 'qualified'
                  ? (selectedAgentConfig?.testResults || []).filter(r => r.qualified && !r.needsReview)
                  : (selectedAgentConfig?.testResults || []).filter(r => r.needsReview);
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
                        needsReviewCount={needsReviewCount}
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
                  allAgents={agents}
                  onSave={({ questionType, researchQuestion, selectedSources, responseOptions }) => {
                    const updatedAgent = selectedAgent ? {
                      ...selectedAgent,
                      questionType,
                      researchQuestion,
                      sources: selectedSources,
                      responseOptions: responseOptions,
                      // Preserve the original title - it should stay consistent across question types
                      title: selectedAgent.title
                    } : null;
                    
                    setSelectedAgent(updatedAgent);
                    
                    // Persist agent changes to localStorage
                    if (updatedAgent) {
                      const storedAgents = JSON.parse(localStorage.getItem('modifiedAgents') || '{}');
                      storedAgents[updatedAgent.id] = updatedAgent;
                      localStorage.setItem('modifiedAgents', JSON.stringify(storedAgents));
                      console.log('[DEBUG] Agent changes persisted to localStorage:', updatedAgent);
                    }
                    
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
        personas: selectedPersonas.map(p => p.name)
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
                      onClick={handleContinueToCampaign}
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