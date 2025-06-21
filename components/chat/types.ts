export type Step = 
  | "initial"
  | "uploading"
  | "customizing"
  | "researching"
  | "agent-details"
  | "find-contacts"
  | "campaign"
  | "inbox";

export interface Account {
  companyName: string;
  website: string;
  industry: string;
  hqCountry: string;
  employeeCount: string;
  totalFunding?: string;
  estimatedAnnualRevenue?: string;
  hqCity?: string;
  yearFounded?: string;
}

export interface EnrichmentOption {
  id: string;
  label: string;
  icon: string;
  isSelected: boolean;
  field: keyof Account;
}

export interface ResearchStrategy {
  id: string;
  icon: string;
  title: string;
  description: string;
  agents: Agent[];
}

export interface Agent {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  researchQuestion: string;
  questionType: QuestionType;
  sources: string[];
  responseOptions?: string[];
  sourcesByQuestionType?: {
    Boolean: string[];
    Number: string[];
    Picklist: string[];
  };
  rewriteTemplates?: {
    Boolean: string;
    Number: string;
    Picklist: string;
  };
  availableQuestionTypes?: QuestionType[];
}

export interface AgentAction {
  icon: string;
  label: string;
  value: string;
}

export type QuestionType = 'Boolean' | 'Number' | 'Picklist';

export interface SourceOption {
  id: string;
  label: string;
  isSelected: boolean;
}

export interface QualificationResult {
  companyName: string;
  qualified: boolean;
  website: string;
  industry: string;
  hqCountry: string;
  employeeCount: string;
}

export interface SelectedPersona {
  id: string;
  name: string;
  description: string;
}

export interface AgentResult {
  companyId: string;
  companyName: string;
  industry: string;
  employeeCount: string;
  hqCountry: string;
  hqState: string | null;
  hqCity: string;
  website: string;
  totalFunding: string;
  estimatedAnnualRevenue: string;
  qualified: boolean;
  confidence: number;
  confidenceScore: number;
  whyQualified: string;
  evidence: Array<{
    type: string;
    title: string;
    description: string;
    confidence: number;
    source: string;
  }>;
  researchDate: string;
  agentId: string;
  agentName: string;
  researchSummary: string;
  dataSources: string[];
  yearFounded: number;
  selectedOptions?: string[];
  questionType?: string;
}

export interface QualifiedCompanyWithResearch extends AgentResult {
  researchResults: {
    summary: string;
    sources: string[];
  };
  assignedPersonas: string[];
  hqCity: string;
  yearFounded: number;
  selectedOptions?: string[];
  questionType?: string;
}

export interface PersonaTestResult {
  id: string;
  contactName: string;
  contactTitle: string;
  email: string;
  linkedinProfile: string;
  personaMatch: string;
  matchScore: number;
  companyId: string;
  companyName: string;
}

export interface MultiPersonaSelectionCardProps {
  selectedPersonas: SelectedPersona[];
  availablePersonas: Persona[];
  onEditPersona: (persona: SelectedPersona) => void;
  onRemovePersona: (personaId: string) => void;
  onBuildPersona: (persona: Persona) => void;
  onContinueToCampaign: () => void;
}

interface FullQualificationResult extends QualificationResult {
  whyQualified?: string;
}

export interface Persona {
  id: string;
  categoryId: string;
  icon: string;
  name: string;
  expandedName: string;
  seniorName: string;
  description: string;
  expandedDescription: string;
  titles: string[];
  expandedTitles: string[];
}

export interface PersonaAction {
  icon: string;
  label: string;
  value: string;
  onClick?: () => void;
}

export interface Company {
  id: string;
  companyName: string;
  website: string;
  industry: string;
  employeeCount: string;
  employeeCountNumeric: number;
  hqCountry: string;
  hqCity: string;
  hqState: string | null;
  totalFunding: string;
  estimatedAnnualRevenue: string;
  yearFounded: number;
  tags: string[];
}