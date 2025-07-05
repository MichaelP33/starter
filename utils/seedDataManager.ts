import { Company, Agent, QuestionType } from '@/hooks/useDataConfig';

// New types for the simplified seed data system
export interface SeedDataConfig {
  name: string;
  description: string;
  vertical: string;
  version: string;
  lastUpdated: string;
  author: string;
  companyCount: number;
  agentCount: number;
  personaCount: number;
  tags: string[];
  description_long?: string;
  targetCustomer?: string;
  qualificationFocus?: string[];
}

export interface PersonaCategory {
  categoryId: string;
  categoryTitle: string;
  categoryIcon: string;
  categoryDescription: string;
}

export interface Persona {
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

export interface PersonaData {
  metadata: {
    name: string;
    description: string;
    version: string;
    lastUpdated: string;
    totalPersonas: number;
  };
  personaCategories: {
    [key: string]: PersonaCategory;
  };
  personas: Persona[];
}

export interface MockResult {
  selectedOptions?: string[];
  whyQualified: string;
  researchSummary: string;
  evidence: string[];
}

export interface AgentResults {
  qualified: {
    companyIds: string[];
    defaultCount: number;
    variations: MockResult[];
  };
  unqualified: {
    companyIds: string[];
    defaultCount: number;
    variations: MockResult[];
  };
  needsReview: {
    companyIds: string[];
    defaultCount: number;
    variations: MockResult[];
  };
}

export interface ResultsData {
  metadata: {
    description: string;
    version: string;
    lastUpdated: string;
    totalResults: number;
  };
  results: {
    [agentId: string]: AgentResults;
  };
}

export interface SeedDataset {
  config: SeedDataConfig;
  companies: { companies: Company[] };
  agents: { categories: any[] };
  personas: PersonaData;
  results: ResultsData;
}

class SeedDataManager {
  private activeDataset: string | null = null;
  private datasetCache: Map<string, SeedDataset> = new Map();

  async getActiveDatasetName(): Promise<string> {
    try {
      const activeConfig = await import('@/data/seed-data/active-dataset.json');
      return activeConfig.activeDataset || 'segment-saas';
    } catch (error) {
      console.warn('Could not load active dataset config, defaulting to segment-saas');
      return 'segment-saas';
    }
  }

  async loadDataset(datasetName: string): Promise<SeedDataset> {
    // Check cache first
    if (this.datasetCache.has(datasetName)) {
      return this.datasetCache.get(datasetName)!;
    }

    try {
      // Load all data files for the dataset
      const [config, companies, agents, personas, results] = await Promise.all([
        import(`@/data/seed-data/${datasetName}/config.json`),
        import(`@/data/seed-data/${datasetName}/companies.json`),
        import(`@/data/seed-data/${datasetName}/agents.json`),
        import(`@/data/seed-data/${datasetName}/personas.json`),
        import(`@/data/seed-data/${datasetName}/results.json`)
      ]);

      const dataset: SeedDataset = {
        config: config.default || config,
        companies: companies.default || companies,
        agents: agents.default || agents,
        personas: personas.default || personas,
        results: results.default || results
      };

      // Cache the dataset
      this.datasetCache.set(datasetName, dataset);
      
      return dataset;
    } catch (error) {
      console.error(`Failed to load dataset ${datasetName}:`, error);
      throw new Error(`Dataset ${datasetName} not found or invalid`);
    }
  }

  async getActiveDataset(): Promise<SeedDataset> {
    const datasetName = await this.getActiveDatasetName();
    return this.loadDataset(datasetName);
  }

  async switchDataset(datasetName: string): Promise<boolean> {
    try {
      // Test load the dataset to ensure it's valid
      await this.loadDataset(datasetName);
      
      // Update active dataset (in a real app, this would write to a backend)
      this.activeDataset = datasetName;
      
      console.log(`Switched to dataset: ${datasetName}`);
      return true;
    } catch (error) {
      console.error(`Failed to switch to dataset ${datasetName}:`, error);
      return false;
    }
  }

  // Transform agents for compatibility with existing code
  processAgents(agentsData: any): Agent[] {
    const categories = agentsData.categories || [];
    return categories.flatMap((category: any) => 
      category.agents.map((agent: any) => ({
        ...agent,
        categoryId: category.id,
        questionType: agent.questionType as QuestionType
      }))
    ) as Agent[];
  }

  // Transform personas for compatibility with existing code
  processPersonas(personasData: PersonaData): {
    personas: Persona[];
    categories: PersonaCategory[];
  } {
    return {
      personas: personasData.personas || [],
      categories: Object.values(personasData.personaCategories || {})
    };
  }

  // Get mock results for an agent
  getMockResults(agentId: string, resultsData: ResultsData): AgentResults | null {
    return resultsData.results[agentId] || null;
  }

  // Clear cache (useful for development/testing)
  clearCache(): void {
    this.datasetCache.clear();
  }

  // Get available datasets (scan directory - in real app would be an API call)
  async getAvailableDatasets(): Promise<string[]> {
    // In a real implementation, this would scan the seed-data directory
    // For now, return known datasets
    return ['segment-saas'];
  }

  // Validate dataset structure
  validateDataset(dataset: SeedDataset): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate config
    if (!dataset.config?.name) errors.push('Config missing name');
    if (!dataset.config?.version) errors.push('Config missing version');

    // Validate companies
    if (!dataset.companies?.companies) {
      errors.push('Companies data missing');
    } else if (!Array.isArray(dataset.companies.companies)) {
      errors.push('Companies must be an array');
    }

    // Validate agents
    if (!dataset.agents?.categories) {
      errors.push('Agents data missing');
    } else if (!Array.isArray(dataset.agents.categories)) {
      errors.push('Agent categories must be an array');
    }

    // Validate personas
    if (!dataset.personas?.personas) {
      errors.push('Personas data missing');
    }

    // Validate results
    if (!dataset.results?.results) {
      errors.push('Results data missing');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const seedDataManager = new SeedDataManager();

// Convenience functions for common operations
export async function getActiveDataset(): Promise<SeedDataset> {
  return seedDataManager.getActiveDataset();
}

export async function switchDataset(datasetName: string): Promise<boolean> {
  return seedDataManager.switchDataset(datasetName);
}

export async function validateCurrentDataset(): Promise<{ valid: boolean; errors: string[] }> {
  const dataset = await getActiveDataset();
  return seedDataManager.validateDataset(dataset);
}