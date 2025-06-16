const { DataManager } = require('../lib/data/DataManager');

// Create an instance of DataManager
const dataManager = new DataManager();

try {
  // Load data
  const oldPersonas = dataManager.getPersonas();
  const allPersonas = dataManager.getAllPersonas();
  const personaCategories = dataManager.getPersonaCategories();

  // Log counts
  console.log('Number of personas in old format:', oldPersonas.personas.length);
  console.log('Number of personas in new format:', allPersonas.length);
  console.log('Number of persona categories:', Object.keys(personaCategories).length);

  // Validate data structure
  console.log('Old Personas Structure:', JSON.stringify(oldPersonas, null, 2));
  console.log('New Personas Structure:', JSON.stringify(allPersonas, null, 2));
  console.log('Persona Categories Structure:', JSON.stringify(personaCategories, null, 2));

} catch (error) {
  console.error('Error loading data:', error);
} 