export type Step = 'initial' | 'uploading' | 'customizing' | 'researching' | 'agent-details' | 'find-contacts';

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
  title: string;
  description: string;
  researchQuestion?: string;
  questionType?: string;
  sources?: string[];
}

export interface AgentAction {
  icon: string;
  label: string;
  value: string;
}

export type QuestionType = 'Boolean' | 'Number' | 'Picklist' | 'Percentage' | 'Currency';

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

export interface QualifiedCompanyWithResearch extends Account {
  researchResults: string;
  qualified: boolean;
  assignedPersonas: number;
}

interface FullQualificationResult extends QualificationResult {
  whyQualified?: string;
}

export interface Persona {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface PersonaAction {
  icon: string;
  label: string;
  value: string;
  onClick?: () => void;
}