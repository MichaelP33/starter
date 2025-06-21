import fs from 'fs';
import path from 'path';

// Define interfaces for the new seed data structure
interface PersonaCategory {
  categoryId: string;
  categoryTitle: string;
  categoryIcon: string;
  categoryDescription: string;
}

interface Persona {
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

interface PersonaData {
  metadata: {
    name: string;
    description: string;
    version: string;
    lastUpdated: string;
    totalPersonas: number;
  };
  personaCategories: Record<string, PersonaCategory>;
  personas: Persona[];
}

// Define interfaces for Company and Agent data structures
interface Company {
  id: string;
  companyName: string;
  website: string;
  industry: string;
  hqCountry: string;
  hqCity: string;
  hqState: string;
  employeeCount: number;
  totalFunding: number;
  estimatedAnnualRevenue: number;
  yearFounded: number;
  companyStage: string;
  description: string;
  linkedinUrl: string;
  tags: string[];
}

interface Agent {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  researchQuestions: string[];
  questionTypes: string[];
  evidenceTemplates: string[];
  resultTypes: string[];
}

interface AgentData {
  metadata: {
    name: string;
    description: string;
    version: string;
    lastUpdated: string;
    totalAgents: number;
  };
  agents: Agent[];
}

// Define interfaces for the old data structure expected by components
interface OldPersona {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface OldPersonaData {
  personas: OldPersona[];
}

// DataManager class to load and provide data
export class DataManager {
  private personaData: PersonaData;
  private companyData: Company[];
  private agentData: AgentData;

  constructor() {
    this.personaData = this.loadPersonaData();
    this.companyData = this.loadCompanyData();
    this.agentData = this.loadAgentData();
  }

  private loadPersonaData(): PersonaData {
    const filePath = path.join(process.cwd(), 'data/seed-datasets/personas/segment-personas.json');
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent) as PersonaData;
    } catch (error) {
      console.error('Error loading persona data:', error);
      return { metadata: { name: '', description: '', version: '', lastUpdated: '', totalPersonas: 0 }, personaCategories: {}, personas: [] };
    }
  }

  private loadCompanyData(): Company[] {
    const filePath = path.join(process.cwd(), 'data/seed-datasets/companies/modern-tech-100.json');
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent).companies as Company[];
    } catch (error) {
      console.error('Error loading company data:', error);
      return [];
    }
  }

  private loadAgentData(): AgentData {
    const filePath = path.join(process.cwd(), 'data/seed-datasets/agents/segment-agents.json');
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent) as AgentData;
    } catch (error) {
      console.error('Error loading agent data:', error);
      return { metadata: { name: '', description: '', version: '', lastUpdated: '', totalAgents: 0 }, agents: [] };
    }
  }

  // Method to get personas in the old format
  getPersonas(): OldPersonaData {
    const oldPersonas: OldPersona[] = this.personaData.personas.map(persona => ({
      id: persona.id,
      icon: persona.icon,
      title: persona.name,
      description: persona.description
    }));

    return { personas: oldPersonas };
  }

  // Method to get all personas in the new format
  getAllPersonas(): Persona[] {
    return this.personaData.personas;
  }

  // Method to get persona categories
  getPersonaCategories(): Record<string, PersonaCategory> {
    return this.personaData.personaCategories;
  }

  // Method to get all companies
  getCompanies(): Company[] {
    return this.companyData;
  }

  // Method to get all agents
  getAgents(): Agent[] {
    return this.agentData.agents;
  }

  // Method to get agents by category
  getAgentsByCategory(categoryId: string): Agent[] {
    return this.agentData.agents.filter(agent => agent.categoryId === categoryId);
  }
}

// Export a singleton instance for easy use throughout the app
export const dataManager = new DataManager(); 