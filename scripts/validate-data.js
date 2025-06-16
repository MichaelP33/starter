const fs = require('fs');
const path = require('path');

const COMPANIES_FILE_PATH = path.join(__dirname, '../data/seed-datasets/companies/modern-tech-100.json');
const AGENTS_FILE_PATH = path.join(__dirname, '../data/seed-datasets/agents/segment-agents.json');
const REQUIRED_FIELDS = ['id', 'companyName', 'website', 'industry'];

function validateCompany(company, index) {
  const missing = REQUIRED_FIELDS.filter(field => !company[field]);
  return missing.length > 0 ? { index, missing } : null;
}

function validateAgents(data) {
  if (!data || !data.agents || !Array.isArray(data.agents)) {
    console.error('Invalid format: "agents" array missing in agent data.');
    return false;
  }

  const totalAgents = data.agents.length;
  if (totalAgents !== 10) {
    console.error(`Expected 10 agents, found ${totalAgents}.`);
    return false;
  }

  const categories = new Set(data.agents.map(agent => agent.categoryId));
  if (categories.size !== 3) {
    console.error(`Expected 3 categories, found ${categories.size}.`);
    return false;
  }

  return true;
}

function main() {
  // Validate companies data
  let companiesData;
  try {
    const raw = fs.readFileSync(COMPANIES_FILE_PATH, 'utf-8');
    companiesData = JSON.parse(raw);
  } catch (err) {
    console.error('Error parsing companies JSON:', err.message);
    process.exit(1);
  }

  if (!companiesData || !Array.isArray(companiesData.companies)) {
    console.error('Invalid format: "companies" array missing in companies data.');
    process.exit(1);
  }

  const totalCompanies = companiesData.companies.length;
  console.log(`Total companies: ${totalCompanies}`);

  // Check a few sample companies (first, middle, last)
  const sampleIndexes = [0, Math.floor(totalCompanies / 2), totalCompanies - 1].filter(i => i >= 0 && i < totalCompanies);
  let issues = [];
  for (const i of sampleIndexes) {
    const result = validateCompany(companiesData.companies[i], i);
    if (result) issues.push(result);
  }

  if (issues.length > 0) {
    console.warn('Issues found in sample companies:');
    for (const issue of issues) {
      console.warn(`  Company at index ${issue.index} is missing fields: ${issue.missing.join(', ')}`);
    }
    process.exit(2);
  }

  console.log('Companies validation successful: All sample companies have required fields.');

  // Validate agents data
  let agentsData;
  try {
    const raw = fs.readFileSync(AGENTS_FILE_PATH, 'utf-8');
    agentsData = JSON.parse(raw);
  } catch (err) {
    console.error('Error parsing agents JSON:', err.message);
    process.exit(1);
  }

  if (!validateAgents(agentsData)) {
    process.exit(2);
  }

  console.log('Agents validation successful: 10 agents found across 3 categories.');
}

main(); 