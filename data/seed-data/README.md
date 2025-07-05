# Seed Data Management System

## Overview
This directory contains all seed data for the Target Account List Builder application, organized by industry/vertical datasets. Each dataset is completely self-contained and can be easily swapped or updated.

## Directory Structure
```
/data/seed-data/
├── active-dataset.json          # Points to currently active dataset
├── segment-saas/               # Example dataset for SaaS companies
│   ├── config.json            # Dataset metadata and configuration
│   ├── companies.json         # Company data with enrichment fields
│   ├── agents.json           # Research agents and qualification criteria
│   ├── personas.json         # Contact personas and targeting info
│   └── results.json          # Mock qualification results and evidence
├── fintech-companies/          # Example dataset for fintech vertical
│   ├── config.json
│   ├── companies.json
│   ├── agents.json
│   ├── personas.json
│   └── results.json
└── healthcare-tech/           # Example dataset for healthcare vertical
    ├── config.json
    ├── companies.json
    ├── agents.json
    ├── personas.json
    └── results.json
```

## Dataset Configuration (config.json)
Each dataset includes metadata and configuration:
```json
{
  "name": "SaaS Companies - Segment",
  "description": "Target account list for Segment targeting SaaS companies",
  "vertical": "SaaS",
  "version": "1.0.0",
  "lastUpdated": "2024-01-15",
  "author": "Sales Team",
  "companyCount": 100,
  "agentCount": 10,
  "personaCount": 15,
  "tags": ["segment", "saas", "b2b"]
}
```

## Data Format Standards

### Companies (companies.json)
```json
{
  "companies": [
    {
      "id": "stripe",
      "companyName": "Stripe",
      "website": "stripe.com",
      "industry": "FinTech",
      "employeeCount": "1,000-5,000",
      "employeeCountNumeric": 3000,
      "hqCountry": "United States",
      "hqCity": "San Francisco",
      "hqState": "CA",
      "totalFunding": "$2.2B",
      "estimatedAnnualRevenue": "$500M-1B",
      "yearFounded": 2010,
      "tags": ["qualified", "high-priority"]
    }
  ]
}
```

### Agents (agents.json)
```json
{
  "categories": [
    {
      "id": "hiring",
      "title": "Hiring Trend Analysis", 
      "icon": "🏢",
      "description": "Uncover growth signals through hiring patterns",
      "agents": [
        {
          "id": "marketing-hiring",
          "title": "Marketing Team Hiring?",
          "description": "Identify companies expanding marketing teams",
          "researchQuestion": "Is the company hiring for marketing roles?",
          "questionType": "Boolean",
          "sources": ["LinkedIn Jobs", "Company Careers"],
          "availableQuestionTypes": ["Boolean", "Picklist"],
          "responseOptions": ["Leadership", "Operations", "Growth"]
        }
      ]
    }
  ]
}
```

### Results (results.json)
Mock qualification results for testing and demo purposes:
```json
{
  "results": {
    "marketing-hiring": {
      "qualified": {
        "companyIds": ["stripe", "shopify", "webflow"],
        "variations": [
          {
            "whyQualified": "Active hiring for senior marketing roles",
            "evidence": ["LinkedIn: Senior Marketing Manager posting", "Careers: Growth Marketing Lead"]
          }
        ]
      },
      "unqualified": {
        "companyIds": ["company4", "company5"],
        "variations": [...]
      }
    }
  }
}
```

## Usage

### Switching Datasets
Update `active-dataset.json` to point to a different dataset:
```json
{
  "activeDataset": "fintech-companies",
  "lastChanged": "2024-01-15T10:30:00Z"
}
```

### Creating New Datasets
1. Create a new directory with the dataset name
2. Copy the structure from an existing dataset
3. Update all JSON files with your new data
4. Update `active-dataset.json` to switch to the new dataset

### Uploading Data
The application will provide an admin interface to:
- Upload new datasets (ZIP file with all JSON files)
- Switch between existing datasets
- Validate data format before activation
- Export current datasets for backup

## Benefits of This Structure
1. **Easy Vertical Switching**: Change entire dataset with one configuration change
2. **Self-Contained**: Each dataset includes all necessary data
3. **Version Control Friendly**: JSON files are easy to diff and merge
4. **Validation Ready**: Clear schema for automated validation
5. **Backup/Export Simple**: Copy directory to backup entire dataset
6. **Collaboration Friendly**: Teams can maintain separate datasets