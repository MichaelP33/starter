import { useState, useEffect } from 'react';

// TypeScript interfaces for data structures
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

export interface AgentResultType {
  Boolean?: {
    trueLabel: string;
    falseLabel: string;
    confidenceRequired: boolean;
  };
  Picklist?: {
    options: string[];
    confidenceRequired: boolean;
  };
  Number?: {
    min: number;
    max: number;
    confidenceRequired: boolean;
  };
}

export interface AgentEvidenceTemplates {
  maturityEvidence?: string[];
  trueEvidence?: string[];
  falseEvidence?: string[];
  fundingEvidence?: string[];
  noFundingEvidence?: string[];
  expansionEvidence?: string[];
  noExpansionEvidence?: string[];
  complexityEvidence?: string[];
}

export interface Agent {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  researchQuestion: string;
  questionType: QuestionType;
  sources: string[];
  segmentRelevance?: string;
  estimatedQualified?: string;
  resultTypes?: AgentResultType;
  evidenceTemplates?: AgentEvidenceTemplates;
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
  responseOptions?: string[];
}

export type QuestionType = 'Boolean' | 'Number' | 'Picklist';

interface Persona {
  id: string;
  categoryId: string;
  description: string;
  icon: string;
  name: string;
  expandedName: string;
  seniorName: string;
  expandedDescription: string;
  titles: string[];
  expandedTitles: string[];
}

interface PersonaCategoryMetadata {
  categoryId: string;
  categoryTitle: string;
  categoryIcon: string;
  categoryDescription: string;
  personas?: Persona[];
}

interface PersonaData {
  metadata: {
    name: string;
    description: string;
    version: string;
    lastUpdated: string;
    totalPersonas: number;
  };
  personaCategories: {
    [key: string]: PersonaCategoryMetadata;
  };
  personas: Persona[];
}

// Old format interfaces for backward compatibility
interface OldPersona {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface OldPersonaData {
  personas: OldPersona[];
}

interface DataState {
  companies: Company[];
  agents: Agent[];
  personas: Persona[];
  personaCategories: PersonaCategoryMetadata[];
  oldFormatPersonas: OldPersonaData;
  isLoading: {
    companies: boolean;
    agents: boolean;
    personas: boolean;
  };
  error: {
    companies: Error | null;
    agents: Error | null;
    personas: Error | null;
  };
}

const initialState: DataState = {
  companies: [],
  agents: [],
  personas: [],
  personaCategories: [],
  oldFormatPersonas: { personas: [] },
  isLoading: {
    companies: true,
    agents: true,
    personas: true,
  },
  error: {
    companies: null,
    agents: null,
    personas: null,
  },
};

export function useDataConfig() {
  const [state, setState] = useState<DataState>(initialState);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load companies data
        try {
          const companiesModule = await import('@/data/seed-datasets/companies/modern-tech-100.json');
          const companies = companiesModule.companies as Company[];
          setState(prev => ({
            ...prev,
            companies,
            isLoading: { ...prev.isLoading, companies: false },
          }));
        } catch (error) {
          setState(prev => ({
            ...prev,
            error: { ...prev.error, companies: error as Error },
            isLoading: { ...prev.isLoading, companies: false },
          }));
        }

        // Load agents data
        try {
          const agentsModule = await import('@/data/agents.json');
          // Extract all agents from categories
          const allAgents = agentsModule.categories.flatMap(category => 
            category.agents.map(agent => ({
              ...agent,
              categoryId: category.id,
              questionType: agent.questionType as QuestionType
            }))
          ) as Agent[];
          
          // Debug logging for data-hiring agent
          const dataHiringAgent = allAgents.find(agent => agent.id === 'data-hiring');
          if (dataHiringAgent) {
            console.log('Raw data-hiring agent from agents.json:', dataHiringAgent);
            console.log('Available question types:', dataHiringAgent.availableQuestionTypes);
            console.log('Response options:', dataHiringAgent.responseOptions);
          } else {
            console.log('data-hiring agent not found in agents.json');
          }
          
          // Load modified agents from localStorage and merge with original data
          const storedModifiedAgents = JSON.parse(localStorage.getItem('modifiedAgents') || '{}');
          const mergedAgents = allAgents.map(agent => {
            const modifiedAgent = storedModifiedAgents[agent.id];
            if (modifiedAgent) {
              console.log('[DEBUG] Loading modified agent from localStorage:', agent.id, modifiedAgent);
              return {
                ...agent,
                ...modifiedAgent,
                // Ensure categoryId is preserved from original agent
                categoryId: agent.categoryId
              };
            }
            return agent;
          });
          
          setState(prev => ({
            ...prev,
            agents: mergedAgents,
            isLoading: { ...prev.isLoading, agents: false },
          }));
        } catch (error) {
          setState(prev => ({
            ...prev,
            error: { ...prev.error, agents: error as Error },
            isLoading: { ...prev.isLoading, agents: false },
          }));
        }

        // Load personas data
        try {
          const personasModule = await import('@/data/seed-datasets/personas/segment-personas.json');
          const personaData = personasModule.default as unknown as PersonaData;
          const categories = Object.values(personaData.personaCategories);
          
          // Create personas array from the data
          const processedPersonas = personaData.personas.map((persona: any) => ({
            id: persona.id,
            categoryId: persona.categoryId,
            description: persona.description,
            icon: persona.icon,
            name: persona.name,
            expandedName: persona.expandedName,
            seniorName: persona.seniorName,
            expandedDescription: persona.expandedDescription,
            titles: persona.titles,
            expandedTitles: persona.expandedTitles,
          }));

          // Convert to old format for backward compatibility
          const oldFormatPersonas = {
            personas: processedPersonas.map(persona => ({
              id: persona.id,
              icon: '👔', // Default icon
              title: persona.name,
              description: persona.description,
            })),
          };

          setState(prev => ({
            ...prev,
            personas: processedPersonas,
            personaCategories: categories,
            oldFormatPersonas,
            isLoading: { ...prev.isLoading, personas: false },
          }));
        } catch (error) {
          setState(prev => ({
            ...prev,
            error: { ...prev.error, personas: error as Error },
            isLoading: { ...prev.isLoading, personas: false },
          }));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Helper methods
  const getAgentsByCategory = (categoryId: string): Agent[] => {
    return state.agents.filter(agent => agent.categoryId === categoryId);
  };

  const getPersonasByCategory = (categoryId: string): Persona[] => {
    return state.personas.filter(persona => persona.categoryId === categoryId);
  };

  const getPersonaCategory = (categoryId: string): PersonaCategoryMetadata | undefined => {
    return state.personaCategories.find(category => category.categoryId === categoryId);
  };

  // Check if any data is still loading
  const isLoading = Object.values(state.isLoading).some(loading => loading);

  // Check if any errors occurred
  const hasError = Object.values(state.error).some(error => error !== null);

  return {
    // Data
    companies: state.companies,
    agents: state.agents,
    personas: state.personas,
    personaCategories: state.personaCategories,
    oldFormatPersonas: state.oldFormatPersonas, // For backward compatibility

    // Loading states
    isLoading,
    isLoadingCompanies: state.isLoading.companies,
    isLoadingAgents: state.isLoading.agents,
    isLoadingPersonas: state.isLoading.personas,

    // Error states
    hasError,
    errors: state.error,

    // Helper methods
    getAgentsByCategory,
    getPersonasByCategory,
    getPersonaCategory,
  };
}

// Export interfaces for use in other files
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

export interface Agent {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  researchQuestion: string;
  questionType: QuestionType;
  sources: string[];
  segmentRelevance?: string;
  estimatedQualified?: string;
  resultTypes?: AgentResultType;
  evidenceTemplates?: AgentEvidenceTemplates;
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
  responseOptions?: string[];
} 