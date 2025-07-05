import { Company } from '@/hooks/useDataConfig';
import { Agent } from '@/hooks/useDataConfig';
import { AgentResult } from '@/components/chat/types';
import { seedDataManager, type ResultsData, type AgentResults, type MockResult } from '@/utils/seedDataManager';

export class SimplifiedResultsGenerator {
  private companies: Company[];
  private agents: Agent[];
  private resultsData: ResultsData | null = null;

  constructor(companies: Company[], agents: Agent[]) {
    this.companies = companies;
    this.agents = agents;
    this.loadResultsData();
  }

  private async loadResultsData(): Promise<void> {
    try {
      const dataset = await seedDataManager.getActiveDataset();
      this.resultsData = dataset.results;
    } catch (error) {
      console.error('Failed to load results data:', error);
      this.resultsData = null;
    }
  }

  async generateResults(agentId: string, companySample?: Company[]): Promise<AgentResult[]> {
    // Ensure results data is loaded
    if (!this.resultsData) {
      await this.loadResultsData();
    }

    if (!this.resultsData) {
      console.warn(`No results data available for agent ${agentId}, generating default results`);
      return this.generateDefaultResults(agentId);
    }

    const agentResults = this.resultsData.results[agentId];
    if (!agentResults) {
      console.warn(`No mock results found for agent ${agentId}, generating default results`);
      return this.generateDefaultResults(agentId);
    }

    // Use provided sample or select companies for this agent
    const companiesToTest = companySample || this.selectCompaniesForAgent(agentId, agentResults);
    
    return this.createResultsFromMockData(agentId, companiesToTest, agentResults);
  }

  private selectCompaniesForAgent(agentId: string, agentResults: AgentResults): Company[] {
    const selectedCompanies: Company[] = [];
    
    // Add qualified companies
    const qualifiedCompanyIds = agentResults.qualified.companyIds;
    const qualifiedCompanies = this.getCompaniesByIds(qualifiedCompanyIds).slice(0, agentResults.qualified.defaultCount);
    selectedCompanies.push(...qualifiedCompanies);
    
    // Add unqualified companies
    const unqualifiedCompanyIds = agentResults.unqualified.companyIds;
    const unqualifiedCompanies = this.getCompaniesByIds(unqualifiedCompanyIds).slice(0, agentResults.unqualified.defaultCount);
    selectedCompanies.push(...unqualifiedCompanies);
    
    // Add needs review companies
    const needsReviewCompanyIds = agentResults.needsReview.companyIds;
    const needsReviewCompanies = this.getCompaniesByIds(needsReviewCompanyIds).slice(0, agentResults.needsReview.defaultCount);
    selectedCompanies.push(...needsReviewCompanies);
    
    // If we don't have enough companies, add random ones
    if (selectedCompanies.length < 25) {
      const remainingCompanies = this.companies.filter(c => 
        !selectedCompanies.find(sc => sc.id === c.id)
      );
      const additionalCompanies = remainingCompanies
        .sort(() => 0.5 - Math.random())
        .slice(0, 25 - selectedCompanies.length);
      selectedCompanies.push(...additionalCompanies);
    }
    
    return selectedCompanies;
  }

  private getCompaniesByIds(companyIds: string[]): Company[] {
    return companyIds
      .map(id => this.companies.find(c => c.id === id))
      .filter(Boolean) as Company[];
  }

  private createResultsFromMockData(
    agentId: string, 
    companies: Company[], 
    agentResults: AgentResults
  ): AgentResult[] {
    const results: AgentResult[] = [];
    const agent = this.agents.find(a => a.id === agentId);
    
    if (!agent) {
      console.error(`Agent ${agentId} not found`);
      return [];
    }

    companies.forEach((company) => {
      let resultType: 'qualified' | 'unqualified' | 'needsReview' = 'unqualified';
      let mockData: MockResult;
      
      // Determine result type based on company ID
      if (agentResults.qualified.companyIds.includes(company.id)) {
        resultType = 'qualified';
        mockData = this.selectRandomVariation(agentResults.qualified.variations);
      } else if (agentResults.needsReview.companyIds.includes(company.id)) {
        resultType = 'needsReview';
        mockData = this.selectRandomVariation(agentResults.needsReview.variations);
      } else {
        resultType = 'unqualified';
        mockData = this.selectRandomVariation(agentResults.unqualified.variations);
      }

      const result: AgentResult = {
        companyId: company.id,
        companyName: company.companyName,
        industry: company.industry,
        employeeCount: company.employeeCount,
        hqCountry: company.hqCountry,
        hqState: company.hqState,
        hqCity: company.hqCity,
        website: company.website,
        totalFunding: company.totalFunding || '',
        estimatedAnnualRevenue: company.estimatedAnnualRevenue || '',
        yearFounded: company.yearFounded,
        qualified: resultType === 'qualified',
        needsReview: resultType === 'needsReview',
        confidence: this.calculateConfidence(resultType),
        confidenceScore: this.calculateConfidence(resultType),
        whyQualified: mockData.whyQualified,
        evidence: mockData.evidence.map((evidenceText, index) => ({
          type: 'research',
          title: evidenceText.split(' - ')[0] || `Evidence ${index + 1}`,
          description: evidenceText,
          confidence: this.calculateConfidence(resultType),
          source: this.selectRandomSource(agent.sources)
        })),
        researchDate: new Date().toISOString(),
        agentId: agentId,
        agentName: agent.title,
        researchSummary: mockData.researchSummary.replace('[COMPANY]', company.companyName),
        dataSources: agent.sources,
        selectedOptions: mockData.selectedOptions,
        questionType: agent.questionType
      };

      results.push(result);
    });

    return results;
  }

  private selectRandomVariation(variations: MockResult[]): MockResult {
    if (variations.length === 0) {
      return {
        whyQualified: 'No specific information available',
        researchSummary: 'Standard research conducted',
        evidence: ['General research completed']
      };
    }
    
    return variations[Math.floor(Math.random() * variations.length)];
  }

  private selectRandomSource(sources: string[]): string {
    return sources[Math.floor(Math.random() * sources.length)] || 'Company Research';
  }

  private calculateConfidence(resultType: 'qualified' | 'unqualified' | 'needsReview'): number {
    switch (resultType) {
      case 'qualified':
        return 0.85 + Math.random() * 0.1; // 85-95%
      case 'needsReview':
        return 0.5 + Math.random() * 0.3; // 50-80%
      case 'unqualified':
        return 0.7 + Math.random() * 0.2; // 70-90%
      default:
        return 0.75;
    }
  }

  private generateDefaultResults(agentId: string, count: number = 25): AgentResult[] {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) {
      console.error(`Agent ${agentId} not found for default results`);
      return [];
    }

    const sampleCompanies = this.companies
      .sort(() => 0.5 - Math.random())
      .slice(0, count);

    return sampleCompanies.map((company, index) => {
      const qualified = index < count * 0.4; // 40% qualified
      const needsReview = !qualified && index < count * 0.5; // 10% needs review
      
      return {
        companyId: company.id,
        companyName: company.companyName,
        industry: company.industry,
        employeeCount: company.employeeCount,
        hqCountry: company.hqCountry,
        hqState: company.hqState,
        hqCity: company.hqCity,
        website: company.website,
        totalFunding: company.totalFunding || '',
        estimatedAnnualRevenue: company.estimatedAnnualRevenue || '',
        yearFounded: company.yearFounded,
        qualified,
        needsReview,
        confidence: this.calculateConfidence(qualified ? 'qualified' : needsReview ? 'needsReview' : 'unqualified'),
        confidenceScore: this.calculateConfidence(qualified ? 'qualified' : needsReview ? 'needsReview' : 'unqualified'),
        whyQualified: qualified 
          ? `${company.companyName} shows positive indicators for ${agent.title.toLowerCase()}`
          : needsReview
          ? `${company.companyName} has mixed signals that need human review`
          : `${company.companyName} does not show strong indicators for ${agent.title.toLowerCase()}`,
        evidence: [{
          type: 'research',
          title: 'Default Research',
          description: `Standard research conducted for ${company.companyName}`,
          confidence: 0.75,
          source: agent.sources[0] || 'Company Research'
        }],
        researchDate: new Date().toISOString(),
        agentId: agentId,
        agentName: agent.title,
        researchSummary: `Default research summary for ${company.companyName} regarding ${agent.title.toLowerCase()}.`,
        dataSources: agent.sources,
        selectedOptions: [],
        questionType: agent.questionType
      };
    });
  }

  // Method to refresh results data (useful when dataset changes)
  async refreshResultsData(): Promise<void> {
    await this.loadResultsData();
  }
}