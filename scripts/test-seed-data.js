const fs = require('fs');
const path = require('path');

// Define paths to the JSON files
const companiesPath = path.join(process.cwd(), 'data/seed-datasets/companies/modern-tech-100.json');
const agentsPath = path.join(process.cwd(), 'data/seed-datasets/agents/segment-agents.json');
const personasPath = path.join(process.cwd(), 'data/seed-datasets/personas/segment-personas.json');

// Function to read and parse JSON files
function readJsonFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// Read and parse the JSON files
const companiesData = readJsonFile(companiesPath);
const agentsData = readJsonFile(agentsPath);
const personasData = readJsonFile(personasPath);

// Validate and report findings
if (companiesData) {
  console.log('Companies Data:');
  console.log('Number of companies:', companiesData.companies.length);
  console.log('Structure:', JSON.stringify(companiesData, null, 2));
}

if (agentsData) {
  console.log('Agents Data:');
  console.log('Number of agents:', agentsData.agents.length);
  console.log('Structure:', JSON.stringify(agentsData, null, 2));
}

if (personasData) {
  console.log('Personas Data:');
  console.log('Number of personas:', personasData.personas.length);
  console.log('Structure:', JSON.stringify(personasData, null, 2));
} 