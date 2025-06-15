import { dataManager } from '../lib/data/DataManager.js';

// Test loading companies
try {
  const companies = dataManager.getCompanies();
  console.log('Companies loaded successfully:', companies.length);
} catch (error) {
  console.error('Error loading companies:', error);
}

// Test loading agents
try {
  const agents = dataManager.getAgents();
  console.log('Agents loaded successfully:', agents.length);
} catch (error) {
  console.error('Error loading agents:', error);
}

// Test loading personas in old format
try {
  const oldPersonas = dataManager.getPersonas();
  console.log('Personas in old format loaded successfully:', oldPersonas.personas.length);
} catch (error) {
  console.error('Error loading personas in old format:', error);
}

// Test loading personas in new format
try {
  const allPersonas = dataManager.getAllPersonas();
  console.log('Personas in new format loaded successfully:', allPersonas.length);
} catch (error) {
  console.error('Error loading personas in new format:', error);
} 