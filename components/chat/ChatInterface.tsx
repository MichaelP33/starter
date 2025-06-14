"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { ChatInput } from "./ChatInput";
import { SuggestionChip } from "./SuggestionChip";
import { CsvUploadArea } from "./CsvUploadArea";
import { CustomizationPanel } from "./CustomizationPanel";
import { AccountTable } from "./AccountTable";
import { QualifiedCompaniesTable } from "./QualifiedCompaniesTable";
import { ResearchStrategyCard } from "./ResearchStrategyCard";
import { AgentCard } from "./AgentCard";
import { AgentDetails } from "./AgentDetails";
import { KoalaLoadingIndicator } from "./KoalaLoadingIndicator";
import { QualificationResultsTable } from "./QualificationResultsTable";
import { PersonaCard } from "./PersonaCard";
import { PersonaConfigurationModal } from "./PersonaConfigurationModal";
import { PersonaConfigurationCard } from "./PersonaConfigurationCard";
import { PersonaModificationCard } from "./PersonaModificationCard";
import { PersonaTestResultsTable, mockPersonaResults } from "./PersonaTestResultsTable";
import { MultiPersonaSelectionCard } from "./MultiPersonaSelectionCard";
import { motion } from "framer-motion";
import { Step, Account, EnrichmentOption, ResearchStrategy, Agent, AgentAction, QualificationResult, QualifiedCompanyWithResearch, Persona, PersonaAction } from "./types";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface Suggestion {
  icon: string;
  label: string;
  value: string;
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

const researchStrategies: ResearchStrategy[] = [
  {
    id: "hiring",
    icon: "🏢",
    title: "Hiring Trend Analysis",
    description: "Uncover growth signals and organizational changes through hiring patterns",
    agents: [
      {
        id: "marketing-hiring",
        title: "Marketing Personas Hiring?",
        description: "Identify companies actively expanding their marketing teams, particularly in leadership and specialized roles",
        researchQuestion: "Does the company currently have any open job positions specifically for Marketing Leadership, Operations, Growth Marketing, or Digital Marketing roles posted on their official careers page or LinkedIn?",
        questionType: "Boolean",
        sources: ["Company Career Page"]
      },
      {
        id: "data-hiring",
        title: "Data Team Hiring?",
        description: "Identify companies building or expanding their data teams"
      },
      {
        id: "leadership-changes",
        title: "High Impact Leadership Changes",
        description: "Identify companies with recent leadership changes that suggest data infrastructure evaluation timing"
      }
    ]
  },
  {
    id: "news",
    icon: "📰",
    title: "Company News & Events",
    description: "Track major announcements, leadership changes, and strategic initiatives",
    agents: []
  },
  {
    id: "tech",
    icon: "🔧",
    title: "Tech & Product Insights",
    description: "Analyze technical infrastructure and integration complexity",
    agents: []
  }
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
    icon: "🚀",
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

// Detailed persona options for the grid
const detailedPersonas: Persona[] = [
  {
    id: "strategic-marketing-executive",
    icon: "👔",
    title: "Strategic Marketing Executive",
    description: "Senior marketing executive responsible for overall marketing strategy, brand positioning, and executive-level decision making across the organization."
  },
  {
    id: "growth-marketing-leader",
    icon: "🚀",
    title: "Growth Marketing Leader",
    description: "Revenue-focused marketing leader responsible for customer acquisition, growth experiments, and scaling marketing programs to drive measurable business impact."
  },
  {
    id: "demand-generation-manager",
    icon: "📊",
    title: "Demand Generation Manager",
    description: "Marketing specialist focused on creating qualified leads and building pipeline through targeted campaigns across digital channels and events."
  },
  {
    id: "customer-lifecycle-manager",
    icon: "🔄",
    title: "Customer Lifecycle Marketing Manager",
    description: "Marketing professional focused on customer retention, lifecycle automation, and post-purchase experience optimization to maximize customer value."
  },
  {
    id: "marketing-operations-manager",
    icon: "⚙️",
    title: "Marketing Operations Manager",
    description: "Operations specialist responsible for marketing processes, campaign execution workflows, and performance measurement across marketing functions."
  },
  {
    id: "marketing-technology-manager",
    icon: "🛠️",
    title: "Marketing Technology Manager",
    description: "Technology specialist responsible for marketing tech stack management, system integrations, and data analytics infrastructure across marketing tools."
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

// Mock qualification results - exactly 3 qualified, 5 not qualified
const mockQualificationResults: QualificationResult[] = [
  {
    companyName: "Stripe",
    qualified: true,
    website: "stripe.com",
    industry: "FinTech",
    hqCountry: "United States",
    employeeCount: "5000+"
  },
  {
    companyName: "Notion",
    qualified: true,
    website: "notion.so",
    industry: "Productivity Software",
    hqCountry: "United States",
    employeeCount: "1000+"
  },
  {
    companyName: "Figma",
    qualified: false,
    website: "figma.com",
    industry: "Design Software",
    hqCountry: "United States",
    employeeCount: "1000+"
  },
  {
    companyName: "Vercel",
    qualified: false,
    website: "vercel.com",
    industry: "Developer Tools",
    hqCountry: "United States",
    employeeCount: "500+"
  },
  {
    companyName: "Linear",
    qualified: false,
    website: "linear.app",
    industry: "Project Management",
    hqCountry: "United States",
    employeeCount: "100+"
  },
  {
    companyName: "Supabase",
    qualified: true,
    website: "supabase.com",
    industry: "Database",
    hqCountry: "United States",
    employeeCount: "100+"
  },
  {
    companyName: "Loom",
    qualified: false,
    website: "loom.com",
    industry: "Video Software",
    hqCountry: "United States",
    employeeCount: "500+"
  },
  {
    companyName: "Retool",
    qualified: false,
    website: "retool.com",
    industry: "Low-Code Platform",
    hqCountry: "United States",
    employeeCount: "500+"
  }
];

// Mock qualified companies with research results
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
    researchResults: "Currently hiring Marketing Operations Manager and Senior Growth Marketing roles"
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
    researchResults: "3 open marketing leadership positions including VP Marketing"
  },
  {
    companyName: "Supabase",
    website: "supabase.com",
    industry: "Database",
    hqCountry: "United States",
    employeeCount: "100+",
    totalFunding: "$116M",
    estimatedAnnualRevenue: "$50M",
    hqCity: "San Francisco",
    yearFounded: "2020",
    researchResults: "Actively recruiting Marketing Operations and Digital Marketing specialists"
  }
];

interface SelectedPersona {
  id: string;
  title: string;
  description: string;
}

export function ChatInterface() {
  const router = useRouter();
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
  const [activeTab, setActiveTab] = useState<'qualified' | 'full'>('qualified');
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isTestingPersonas, setIsTestingPersonas] = useState(false);
  const [showPersonaTestResults, setShowPersonaTestResults] = useState(false);
  const [isPersonaModifyMode, setIsPersonaModifyMode] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadedAccounts, setUploadedAccounts] = useState<Account[]>([]);
  const [enrichmentOptions, setEnrichmentOptions] = useState<EnrichmentOption[]>(initialEnrichmentOptions);

  const suggestions: Suggestion[] = [
    {
      icon: "📤",
      label: "Upload CSV of target accounts",
      value: "I'd like to upload a CSV of my target accounts.",
    },
    {
      icon: "👥",
      label: "Create lookalike list from existing customers",
      value: "I want to create a lookalike list from my existing customers.",
    },
    {
      icon: "🎯",
      label: "Describe my ideal customer profile",
      value: "I want to describe my ideal customer profile.",
    },
  ];

  const handleSend = (message: string) => {
    setMessage(message);
    console.log("Sending message:", message);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.label === "Upload CSV of target accounts") {
      setCurrentStep("uploading");
    } else {
      handleSend(suggestion.value);
    }
  };

  const handleUploadSuccess = (accounts: Account[]) => {
    setUploadedAccounts(accounts);
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
    setSelectedAgent(agent);
    setIsAgentEditMode(false);
    setShowTestResults(false);
    setShowFullResults(false);
    setCurrentStep("agent-details");
  };

  const handleAgentAction = (action: AgentAction) => {
    if (action.value === "modify") {
      setIsAgentEditMode(true);
      setShowTestResults(false);
      setShowFullResults(false);
    } else if (action.value === "test") {
      setIsTestingAgent(true);
      setIsAgentEditMode(false);
      setShowTestResults(false);
      setShowFullResults(false);
      // Simulate testing for exactly 4 seconds
      setTimeout(() => {
        setIsTestingAgent(false);
        setShowTestResults(true);
      }, 4000);
    } else if (action.value === "add") {
      // Transition to Find contacts step
      setWorkflowStep(3);
      setCurrentStep("find-contacts");
      setActiveTab('qualified');
      // Reset persona states to show category selection first
      setSelectedPersona(null);
      setSelectedPersonaCategoryId(null);
      setShowMultiPersonaSelection(false);
    }
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
    setSelectedPersona(persona);
    setIsPersonaModifyMode(false);
    setShowPersonaTestResults(false);
    setIsTestingPersonas(false);
    setShowMultiPersonaSelection(false);
    console.log("Build persona:", persona);
  };

  const handleAddThisPersona = () => {
    if (selectedPersona) {
      const newSelectedPersona: SelectedPersona = {
        id: selectedPersona.id,
        title: selectedPersona.title,
        description: selectedPersona.description
      };
      
      setSelectedPersonas([...selectedPersonas, newSelectedPersona]);
      setShowMultiPersonaSelection(true);
      setSelectedPersona(null);
    }
  };

  const handleEditPersona = (persona: SelectedPersona) => {
    // Convert back to Persona type for editing
    const personaToEdit: Persona = {
      id: persona.id,
      icon: detailedPersonas.find(p => p.id === persona.id)?.icon || "👔",
      title: persona.title,
      description: persona.description
    };
    setSelectedPersona(personaToEdit);
    setIsPersonaModifyMode(true);
    setShowMultiPersonaSelection(false);
  };

  const handleRemovePersona = (personaId: string) => {
    setSelectedPersonas(prev => prev.filter(p => p.id !== personaId));
  };

  const handleTestAllPersonas = () => {
    setIsTestingPersonas(true);
    setShowPersonaTestResults(false);
    setShowMultiPersonaSelection(false);
    // Simulate testing for exactly 3-4 seconds
    setTimeout(() => {
      setIsTestingPersonas(false);
      setShowPersonaTestResults(true);
    }, 3500);
  };

  const handleContinueToCampaign = () => {
    console.log('handleContinueToCampaign called');
    console.log("Continue to campaign with personas:", selectedPersonas);
    router.push('/inbox');
  };

  const handlePersonaAction = (action: PersonaAction) => {
    console.log('handlePersonaAction called with:', action);
    console.log('Action value:', action.value);
    
    if (action.value === "launch") {
      console.log('Launch case triggered');
      alert('Launch action working!');
    }
    
    if (action.value === "modify") {
      setIsPersonaModifyMode(true);
      setShowPersonaTestResults(false);
      setIsTestingPersonas(false);
      setShowMultiPersonaSelection(false);
    } else if (action.value === "test") {
      setIsTestingPersonas(true);
      setIsPersonaModifyMode(false);
      setShowPersonaTestResults(false);
      setShowMultiPersonaSelection(false);
      // Simulate testing for exactly 3-4 seconds
      setTimeout(() => {
        setIsTestingPersonas(false);
        setShowPersonaTestResults(true);
      }, 3500);
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
              Excellent! Your target account list is ready with {uploadedAccounts.length} companies.
            </p>
            <p className="text-muted-foreground">
              Ready for step 2 of 3?
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

    return (
      <Button
        key={action.value}
        onClick={() => handleAgentAction(action)}
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
    const baseActions = [
      { icon: "🧪", label: "Test Personas", value: "test" },
      { icon: "✏️", label: "Modify Personas", value: "modify" }
    ];

    // Add Launch Campaign action when in multi-persona selection mode
    if (showMultiPersonaSelection && selectedPersonas.length > 0) {
      baseActions.push({
        icon: "🚀",
        label: "Launch Campaign",
        value: "launch"
      });
    }
    
    console.log('Available persona actions:', baseActions);
    console.log('Each action:', baseActions.map(action => ({ value: action.value, label: action.label })));
    
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
            console.log('Correct Launch Campaign clicked');
            alert('This is the right Launch Campaign button!');
            // Eventually: router.push('/inbox');
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

  if (currentStep === "find-contacts") {
    const qualifiedCount = mockQualifiedCompanies.length;
    const totalCount = mockQualificationResults.length;
    
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
                // Show multi-persona selection controls
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
                    <button
                      onClick={() => {
                        // Scroll to the "Add another persona type" section
                        const addPersonaSection = document.querySelector('[data-section="add-persona"]');
                        if (addPersonaSection) {
                          addPersonaSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                    >
                      ➕ Add More Personas
                    </button>
                    <button
                      onClick={handleContinueToCampaign}
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                    >
                      🚀 Launch Campaign
                    </button>
                  </div>

                  <div className="pt-4">
                    <ChatInput
                      onSend={handleSend}
                      placeholder="Ask about persona targeting or next steps..."
                    />
                  </div>
                </>
              ) : selectedPersona ? (
                // Show persona action buttons after a persona is built
                <>
                  <div className="space-y-3">
                    <h2 className="text-lg font-medium text-primary">
                      Great! Now let's configure your selected personas for targeted outreach at qualified companies.
                    </h2>
                    <p className="text-muted-foreground">
                      Step 3 of 3: Configure personas and targeting
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
                // Show initial persona selection message after category is selected
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
                // Show persona category selection
                <>
                  <div className="space-y-3">
                    <p className="text-lg font-medium text-primary">
                      Let's identify the right personas to target at these companies.
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
            {isTestingPersonas ? (
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center space-y-6">
                  <KoalaLoadingIndicator />
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-800 max-w-md">
                      Testing Strategic Marketing Executive persona on a sample of your target list...
                    </p>
                    <p className="text-sm text-gray-600 max-w-md">
                      Finding contacts that match your persona criteria
                    </p>
                  </div>
                </div>
              </div>
            ) : showPersonaTestResults ? (
              <div className="p-8">
                <PersonaTestResultsTable results={mockPersonaResults} />
              </div>
            ) : isPersonaModifyMode && selectedPersona ? (
              <PersonaModificationCard 
                persona={selectedPersona}
                onSave={handlePersonaModificationSave}
                onCancel={handlePersonaModificationCancel}
              />
            ) : showMultiPersonaSelection ? (
              <MultiPersonaSelectionCard
                selectedPersonas={selectedPersonas}
                availablePersonas={detailedPersonas}
                onEditPersona={handleEditPersona}
                onRemovePersona={handleRemovePersona}
                onBuildPersona={handlePersonaBuild}
                onTestAllPersonas={handleTestAllPersonas}
                onContinueToCampaign={handleContinueToCampaign}
              />
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
                    {detailedPersonas.map((persona) => (
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

                    {/* Results Table */}
                    <div>
                      {activeTab === 'qualified' ? (
                        <QualifiedCompaniesTable
                          companies={mockQualifiedCompanies}
                          enrichmentOptions={enrichmentOptions}
                        />
                      ) : (
                        <AccountTable
                          accounts={uploadedAccounts}
                          enrichmentOptions={enrichmentOptions}
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
              <div className="space-y-3">
                <p className="text-lg font-medium text-primary">
                  Let's explore the Marketing Personas Hiring agent. You can test it on your companies or modify the approach before adding it to your campaign.
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
            </motion.div>
          </div>
          <div className="w-[60%] bg-muted/10 overflow-y-auto">
            {isTestingAgent ? (
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center space-y-6">
                  <KoalaLoadingIndicator />
                  <p className="text-lg font-medium text-gray-800 max-w-md">
                    Testing the Marketing Personas Hiring agent across a sample of companies from your target list...
                  </p>
                </div>
              </div>
            ) : showTestResults ? (
              <div className="p-8">
                <QualificationResultsTable 
                  results={showFullResults ? mockQualificationResults : mockQualificationResults.filter(r => r.qualified)} 
                  onViewAllResults={!showFullResults ? handleViewAllResults : undefined}
                />
              </div>
            ) : (
              selectedAgent && <AgentDetails agent={selectedAgent} isEditMode={isAgentEditMode} />
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
                {researchStrategies.map((strategy) => (
                  <ResearchStrategyCard
                    key={strategy.id}
                    strategy={strategy}
                    isSelected={selectedResearchStrategyId === strategy.id}
                    onClick={() => setSelectedResearchStrategyId(strategy.id)}
                  />
                ))}
              </div>
            </motion.div>
          </div>
          <div className="w-[60%] p-8 bg-muted/10 overflow-y-auto">
            {selectedResearchStrategyId ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-lg font-medium">Available Research Agents</h2>
                <div className="grid grid-cols-1 gap-4">
                  {researchStrategies
                    .find((s) => s.id === selectedResearchStrategyId)
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
                Select a research strategy to see suggested agents
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "customizing") {
    return (
      <div className="flex flex-col w-full h-screen">
        {renderWorkflowProgress()}
        <div className="flex flex-1 h-[calc(100vh-76px)]">
          <div className="w-[35%] border-r border-muted/20 bg-background">
            {renderCustomizationContent()}
          </div>
          <div className="w-[65%] p-8 bg-muted/10">
            <AccountTable
              accounts={uploadedAccounts}
              enrichmentOptions={enrichmentOptions}
            />
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
                <motion.div key={index} variants={itemVariants}>
                  <SuggestionChip
                    icon={suggestion.icon}
                    label={suggestion.label}
                    onClick={() => handleSuggestionClick(suggestion)}
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