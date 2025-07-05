import { useState, useEffect } from 'react';
import { seedDataManager } from '@/utils/seedDataManager';
import type { 
  Company, 
  Agent, 
  QuestionType
} from '@/hooks/useDataConfig';

// Re-export types for compatibility
export type { Company, Agent, QuestionType };

// Simplified persona interface for backward compatibility
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
}

interface DataState {
  companies: Company[];
  agents: Agent[];
  personas: Persona[];
  personaCategories: PersonaCategoryMetadata[];
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
  datasetInfo: {
    name: string;
    description: string;
    vertical: string;
    version: string;
  };
}

const initialState: DataState = {
  companies: [],
  agents: [],
  personas: [],
  personaCategories: [],
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
  datasetInfo: {
    name: '',
    description: '',
    vertical: '',
    version: ''
  }
};

export function useSimplifiedDataConfig() {
  const [state, setState] = useState<DataState>(initialState);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load the active dataset
        const dataset = await seedDataManager.getActiveDataset();

        // Process companies
        const companies = dataset.companies.companies || [];
        setState(prev => ({
          ...prev,
          companies,
          isLoading: { ...prev.isLoading, companies: false },
          datasetInfo: {
            name: dataset.config.name,
            description: dataset.config.description,
            vertical: dataset.config.vertical,
            version: dataset.config.version
          }
        }));

        // Process agents
        const agents = seedDataManager.processAgents(dataset.agents);
        
        // Load modified agents from localStorage and merge (maintain compatibility)
        const storedModifiedAgents = JSON.parse(localStorage.getItem('modifiedAgents') || '{}');
        const mergedAgents = agents.map(agent => {
          const modifiedAgent = storedModifiedAgents[agent.id];
          if (modifiedAgent) {
            console.log('[DEBUG] Loading modified agent from localStorage:', agent.id, modifiedAgent);
            return {
              ...agent,
              ...modifiedAgent,
              categoryId: agent.categoryId // Preserve original categoryId
            };
          }
          return agent;
        });

        setState(prev => ({
          ...prev,
          agents: mergedAgents,
          isLoading: { ...prev.isLoading, agents: false },
        }));

        // Process personas
        const processedPersonas = seedDataManager.processPersonas(dataset.personas);
        
        setState(prev => ({
          ...prev,
          personas: processedPersonas.personas,
          personaCategories: processedPersonas.categories,
          isLoading: { ...prev.isLoading, personas: false },
        }));

      } catch (error) {
        console.error('Error loading seed data:', error);
        
        // Set error state for all data types
        setState(prev => ({
          ...prev,
          error: {
            companies: error as Error,
            agents: error as Error,
            personas: error as Error,
          },
          isLoading: {
            companies: false,
            agents: false,
            personas: false,
          },
        }));
      }
    };

    loadData();
  }, []);

  // Helper methods (maintain compatibility with existing code)
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

  // Create old format personas for backward compatibility
  const oldFormatPersonas = {
    personas: state.personas.map(persona => ({
      id: persona.id,
      icon: persona.icon,
      title: persona.name,
      description: persona.description,
    })),
  };

  return {
    // Data
    companies: state.companies,
    agents: state.agents,
    personas: state.personas,
    personaCategories: state.personaCategories,
    oldFormatPersonas, // For backward compatibility

    // Loading states
    isLoading,
    isLoadingCompanies: state.isLoading.companies,
    isLoadingAgents: state.isLoading.agents,
    isLoadingPersonas: state.isLoading.personas,

    // Error states
    hasError,
    errors: state.error,

    // Dataset information
    datasetInfo: state.datasetInfo,

    // Helper methods
    getAgentsByCategory,
    getPersonasByCategory,
    getPersonaCategory,

    // Dataset management
    switchDataset: async (datasetName: string) => {
      const success = await seedDataManager.switchDataset(datasetName);
      if (success) {
        // Reload data after switching
        window.location.reload(); // Simple approach - could be optimized
      }
      return success;
    },

    clearCache: () => {
      seedDataManager.clearCache();
    },

    validateDataset: async () => {
      const dataset = await seedDataManager.getActiveDataset();
      return seedDataManager.validateDataset(dataset);
    }
  };
}