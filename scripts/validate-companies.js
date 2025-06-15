const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '../data/seed-datasets/companies/modern-tech-100.json');
const REQUIRED_FIELDS = ['id', 'companyName', 'website', 'industry'];

function validateCompany(company, index) {
  const missing = REQUIRED_FIELDS.filter(field => !company[field]);
  return missing.length > 0 ? { index, missing } : null;
}

function main() {
  let data;
  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    data = JSON.parse(raw);
  } catch (err) {
    console.error('Error parsing JSON:', err.message);
    process.exit(1);
  }

  if (!data || !Array.isArray(data.companies)) {
    console.error('Invalid format: "companies" array missing.');
    process.exit(1);
  }

  const total = data.companies.length;
  console.log(`Total companies: ${total}`);

  // Check a few sample companies (first, middle, last)
  const sampleIndexes = [0, Math.floor(total / 2), total - 1].filter(i => i >= 0 && i < total);
  let issues = [];
  for (const i of sampleIndexes) {
    const result = validateCompany(data.companies[i], i);
    if (result) issues.push(result);
  }

  if (issues.length > 0) {
    console.warn('Issues found in sample companies:');
    for (const issue of issues) {
      console.warn(`  Company at index ${issue.index} is missing fields: ${issue.missing.join(', ')}`);
    }
    process.exit(2);
  }

  console.log('Validation successful: All sample companies have required fields.');
}

main(); 