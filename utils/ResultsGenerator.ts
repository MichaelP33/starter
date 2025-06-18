import { Company } from '@/hooks/useDataConfig';
import { Agent } from '@/hooks/useDataConfig';
import { AgentResult } from '@/components/chat/types';

export class ResultsGenerator {
  private companies: Company[];
  private agents: Agent[];

  constructor(companies: Company[], agents: Agent[]) {
    this.companies = companies;
    this.agents = agents;
  }

  private companySets: Record<string, string[]> = {
    'leadership-changes': ['stripe', 'fly', 'deno'],
    'market-expansion': ['revolut', 'klarna', 'spotify'],
    'company-news': ['webflow', 'airtable', 'calendly'],
    'news-funding': ['stripe', 'fly', 'deno'],
    'news-ma': ['shopify', 'canva', 'atlassian'],
    'news-expansion': ['revolut', 'klarna', 'spotify'],
    'news-announcements': ['webflow', 'airtable', 'calendly'],
    'tech-product': ['framer', 'spline', 'raycast'],
    'tech-migration': ['postman', 'sentry', 'miro'],
    'tech-stack': ['docker', 'gitlab', 'typeform']
  };

  private evidenceTemplates = {
    'marketing-hiring': [
      {
        type: 'job_posting',
        title: 'Senior Marketing Operations Manager',
        description: 'Looking for experienced marketing operations professional to manage our martech stack and data integration',
        source: 'LinkedIn Jobs',
        confidence: 0.92
      },
      {
        type: 'job_posting',
        title: 'Growth Marketing Lead',
        description: 'Seeking growth marketer to drive acquisition and optimize conversion funnels',
        source: 'Company Careers Page',
        confidence: 0.88
      }
    ],
    'data-hiring': [
      {
        type: 'job_posting',
        title: 'Senior Data Engineer',
        description: 'Building and maintaining our data infrastructure and ETL pipelines',
        source: 'LinkedIn Jobs',
        confidence: 0.95
      },
      {
        type: 'job_posting',
        title: 'Data Scientist',
        description: 'Developing machine learning models and analytics solutions',
        source: 'Company Careers Page',
        confidence: 0.90
      }
    ],
    'leadership-changes': [
      {
        type: 'news',
        title: 'New CTO Appointment',
        description: 'Company appoints new CTO with focus on data infrastructure modernization',
        source: 'Company Blog',
        confidence: 0.93
      },
      {
        type: 'news',
        title: 'VP Engineering Change',
        description: 'New VP Engineering joins to lead technical transformation',
        source: 'TechCrunch',
        confidence: 0.89
      }
    ],
    'news-funding': [
      {
        type: 'news',
        title: 'Series B Funding',
        description: 'Company raises $50M in Series B funding to accelerate growth',
        source: 'TechCrunch',
        confidence: 0.94
      },
      {
        type: 'news',
        title: 'Growth Investment',
        description: 'New funding round to fuel product development and market expansion',
        source: 'Company Blog',
        confidence: 0.91
      }
    ],
    'news-ma': [
      {
        type: 'news',
        title: 'Strategic Acquisition',
        description: 'Company acquires complementary technology startup to enhance capabilities',
        source: 'Business Insider',
        confidence: 0.92
      },
      {
        type: 'news',
        title: 'Merger Announcement',
        description: 'Major merger to create combined platform and expand market reach',
        source: 'Company Press Release',
        confidence: 0.88
      }
    ],
    'news-expansion': [
      {
        type: 'news',
        title: 'European Expansion',
        description: 'Company opens new office in London to serve European market',
        source: 'Company Blog',
        confidence: 0.90
      },
      {
        type: 'news',
        title: 'APAC Growth',
        description: 'Expanding operations in Singapore and Tokyo to serve Asian markets',
        source: 'TechCrunch',
        confidence: 0.87
      }
    ],
    'news-announcements': [
      {
        type: 'news',
        title: 'Product Innovation',
        description: 'Company announces major product update with enhanced data capabilities',
        source: 'Product Hunt',
        confidence: 0.92
      },
      {
        type: 'news',
        title: 'Strategic Initiative',
        description: 'New company initiative focused on data-driven customer experience',
        source: 'Company Blog',
        confidence: 0.89
      }
    ],
    'tech-product': [
      {
        type: 'news',
        title: 'New Product Launch',
        description: 'Company launches new analytics platform with advanced data features',
        source: 'Product Hunt',
        confidence: 0.92
      },
      {
        type: 'blog',
        title: 'Product Update',
        description: 'Major feature release with enhanced data capabilities and integration',
        source: 'Company Blog',
        confidence: 0.90
      }
    ],
    'tech-migration': [
      {
        type: 'news',
        title: 'Data Warehouse Migration',
        description: 'Company announces migration to Snowflake data warehouse',
        source: 'Company Blog',
        confidence: 0.93
      },
      {
        type: 'job_posting',
        title: 'Data Platform Engineer',
        description: 'Building new data platform and migration tools',
        source: 'LinkedIn Jobs',
        confidence: 0.91
      }
    ],
    'tech-stack': [
      {
        type: 'job_posting',
        title: 'Senior Backend Engineer',
        description: 'Experience with modern data stack: Snowflake, dbt, Looker',
        source: 'Company Careers Page',
        confidence: 0.94
      },
      {
        type: 'blog',
        title: 'Engineering Blog',
        description: 'Detailed post about our data infrastructure and tools',
        source: 'Company Blog',
        confidence: 0.89
      }
    ]
  };

  private researchSummaries = {
    'marketing-hiring': (companyName: string) => 
      `${companyName} is actively expanding their marketing team with multiple senior roles focused on operations and growth. Recent job postings indicate a need for marketing technology expertise and data-driven campaign management.`,
    'data-hiring': (companyName: string) =>
      `${companyName} is building out their data team with multiple open positions for data engineers and scientists. The roles suggest a focus on building robust data infrastructure and analytics capabilities.`,
    'leadership-changes': (companyName: string) =>
      `${companyName} has recently made significant leadership changes in their technical organization. The new leadership team brings experience with modern data infrastructure and analytics platforms.`,
    'news-funding': (companyName: string) =>
      `${companyName} recently raised a significant Series B funding round, indicating strong growth trajectory and budget availability for new technology investments. This presents an ideal opportunity for Segment evaluation.`,
    'news-ma': (companyName: string) =>
      `${companyName} has completed a strategic acquisition, creating immediate need for customer data consolidation and integration across the combined entities. This presents a perfect timing for Segment implementation.`,
    'news-expansion': (companyName: string) =>
      `${companyName} is expanding into multiple new markets, creating complex customer data needs across different regions. The company requires robust data infrastructure to support their global operations.`,
    'news-announcements': (companyName: string) =>
      `${companyName} has made significant product announcements, indicating innovation focus and budget allocation for technology infrastructure. This suggests readiness for advanced customer data solutions.`,
    'tech-product': (companyName: string) =>
      `${companyName} has launched several major features this quarter, increasing their data complexity and creating new customer touchpoints. This presents an ideal opportunity for Segment implementation.`,
    'tech-migration': (companyName: string) =>
      `${companyName} is currently undergoing a data infrastructure migration, evaluating modern data warehouse solutions and CDP platforms. This presents perfect timing for Segment evaluation.`,
    'tech-stack': (companyName: string) =>
      `${companyName} mentions modern data tools and technologies in their engineering blog and job postings, indicating a sophisticated data stack that would benefit from Segment's integration capabilities.`
  };

  private whyQualifiedMap = {
    'marketing-hiring': 'Active hiring for marketing operations and growth roles indicates need for better data infrastructure',
    'data-hiring': 'Building data team suggests investment in data infrastructure and analytics',
    'leadership-changes': 'New technical leadership likely evaluating data infrastructure improvements',
    'news-funding': 'Raised Series B funding in last 12 months, indicating growth budget',
    'news-ma': 'Completed strategic acquisition, creating data integration needs',
    'news-expansion': 'Expanded to 3 new markets in 2024, increasing operational complexity',
    'news-announcements': 'Major product announcement indicates innovation focus and budget',
    'tech-product': 'Launched 2 major features this quarter, increasing data complexity',
    'tech-migration': 'Migrating to modern data warehouse, evaluating CDP solutions',
    'tech-stack': 'Modern tech stack indicates readiness for advanced data integration'
  };

  // 1. Define generic templates for qualified/unqualified results
  private MARKETING_HIRING_QUALIFIED_TEMPLATE = {
    whyQualified: "Yes, multiple senior marketing roles including Marketing Operations Manager and Director of Growth Marketing",
    researchSummary: "[COMPANY] currently has 3 open marketing leadership positions focused on data-driven marketing. Key roles include Marketing Operations Manager responsible for martech stack optimization and lead routing, Director of Growth Marketing overseeing acquisition channels and conversion optimization, and Senior Marketing Technology Manager managing CDP implementation and data integration. All roles require experience with marketing automation platforms and customer data management.",
    evidenceTemplates: [
      "Marketing Operations Manager focusing on martech stack and lead routing optimization",
      "Director of Growth Marketing position managing acquisition channels and conversion funnels",
      "Senior Marketing Technology Manager role for CDP implementation and data integration"
    ]
  };

  private MARKETING_HIRING_UNQUALIFIED_TEMPLATE = {
    whyQualified: "No, only brand and creative roles currently posted",
    researchSummary: "[COMPANY]'s current marketing openings focus primarily on brand and creative functions rather than operations or data-driven roles. Available positions include Brand Designer for visual identity work, Content Marketing Specialist for blog content creation, and Creative Marketing Coordinator for campaign asset development. None of these roles indicate investment in marketing operations, data infrastructure, or growth marketing capabilities.",
    evidenceTemplates: [
      "Brand Designer role focused on visual identity and creative assets",
      "Content Marketing Specialist for blog and content creation",
      "Creative Marketing Coordinator position for campaign asset development"
    ]
  };

  generateResults(agentId: string, companySample?: Company[]): AgentResult[] {
    console.log('🔍 AGENT TEST DEBUG:');
    console.log('Agent ID requested:', agentId);
    console.log('Available mockResults keys:', Object.keys(this.mockResults || {}));
    console.log('Agent found in mockResults?', !!this.mockResults?.[agentId]);
    console.log('Company set for agent:', this.mockResults?.[agentId]?.companySets);
    
    const targetCompanies = this.companies.filter(company => 
      this.mockResults?.[agentId]?.companySets?.includes(company.id)
    );
    
    console.log('Number of companies found:', targetCompanies.length);
    console.log('Found companies:', targetCompanies.map(c => ({ id: c.id, name: c.companyName })));

    // Special logic for marketing-hiring agent: use generic templates and random assignment
    if (agentId === 'marketing-hiring') {
      // Debug: confirm marketing-hiring template logic is being used
      console.log('🔍 [DEBUG] Using ONLY marketing-hiring template logic for all 10 results');
      // Use provided sample or default to all companies
      const baseCompanies = companySample && companySample.length >= 10 ? companySample : [...this.companies];
      // Shuffle and pick 10 companies for this test
      const shuffled = [...baseCompanies].sort(() => 0.5 - Math.random());
      const sample = shuffled.slice(0, 10);
      // Pick 3 for qualified
      const qualifiedCompanies = sample.slice(0, 3);
      // Pick 7 for unqualified (no overlap)
      const qualifiedIds = new Set(qualifiedCompanies.map(c => c.id));
      const unqualifiedCompanies = sample.filter(c => !qualifiedIds.has(c.id)).slice(0, 7);
      // Build qualified results
      const qualifiedResults = qualifiedCompanies.map(company => {
        const template = this.MARKETING_HIRING_QUALIFIED_TEMPLATE;
        const evidence = template.evidenceTemplates.map(et => ({
          type: 'job_posting',
          title: et,
          description: et,
          confidence: 0.92,
          source: 'LinkedIn Jobs'
        }));
        return {
          companyId: company.id,
          companyName: company.companyName,
          qualified: true,
          evidence,
          researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
          whyQualified: template.whyQualified,
          confidence: 0.92,
          confidenceScore: 92,
          researchDate: new Date().toISOString(),
          agentId,
          agentName: this.agents.find(a => a.id === agentId)?.title || '',
          industry: company.industry,
          employeeCount: company.employeeCount,
          hqCountry: company.hqCountry,
          hqState: company.hqState,
          hqCity: company.hqCity,
          website: company.website,
          totalFunding: company.totalFunding,
          estimatedAnnualRevenue: company.estimatedAnnualRevenue,
          yearFounded: company.yearFounded,
          dataSources: ['LinkedIn Jobs', 'Company Website']
        };
      });
      // Build unqualified results
      const unqualifiedResults = unqualifiedCompanies.map(company => {
        const template = this.MARKETING_HIRING_UNQUALIFIED_TEMPLATE;
        const evidence = template.evidenceTemplates.map(et => ({
          type: 'job_posting',
          title: et,
          description: et,
          confidence: 0.7,
          source: 'Company Careers Page'
        }));
        return {
          companyId: company.id,
          companyName: company.companyName,
          qualified: false,
          evidence,
          researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
          whyQualified: template.whyQualified,
          confidence: 0.7,
          confidenceScore: 70,
          researchDate: new Date().toISOString(),
          agentId,
          agentName: this.agents.find(a => a.id === agentId)?.title || '',
          industry: company.industry,
          employeeCount: company.employeeCount,
          hqCountry: company.hqCountry,
          hqState: company.hqState,
          hqCity: company.hqCity,
          website: company.website,
          totalFunding: company.totalFunding,
          estimatedAnnualRevenue: company.estimatedAnnualRevenue,
          yearFounded: company.yearFounded,
          dataSources: ['Company Website']
        };
      });
      // Debug: log all results
      console.log('🔍 [DEBUG] Final marketing-hiring results:', [...qualifiedResults, ...unqualifiedResults].map(r => ({ id: r.companyId, qualified: r.qualified, whyQualified: r.whyQualified })));
      // Return all results (3 qualified + 7 unqualified)
      return [...qualifiedResults, ...unqualifiedResults];
    }

    return targetCompanies.map(company => {
      const evidence = this.mockResults?.[agentId]?.evidenceTemplates?.map(template => ({
        type: 'news',
        title: template,
        description: template,
        confidence: 0.92,
        source: 'Company Website'
      })) || [];
      
      const researchSummary = this.mockResults?.[agentId]?.researchSummary?.replace(
        '[COMPANY]', 
        company.companyName
      ) || '';
      
      const whyQualified = this.mockResults?.[agentId]?.whyQualified?.replace(
        '[COMPANY]', 
        company.companyName
      ) || '';

      return {
        companyId: company.id,
        companyName: company.companyName,
        qualified: true,
        evidence,
        researchSummary,
        whyQualified,
        confidence: 0.92,
        confidenceScore: 92,
        researchDate: new Date().toISOString(),
        agentId,
        agentName: this.agents.find(a => a.id === agentId)?.title || '',
        industry: company.industry,
        employeeCount: company.employeeCount,
        hqCountry: company.hqCountry,
        hqState: company.hqState,
        hqCity: company.hqCity,
        website: company.website,
        totalFunding: company.totalFunding,
        estimatedAnnualRevenue: company.estimatedAnnualRevenue,
        yearFounded: company.yearFounded,
        dataSources: ['LinkedIn Jobs', 'Company Website', 'Tech News']
      };
    });
  }

  generateDefaultResults(agentId: string, count: number = 3): AgentResult[] {
    console.log('🔍 GENERATING DEFAULT RESULTS:');
    console.log('Agent ID:', agentId);
    console.log('Requested count:', count);

    // Get the company set for this agent
    const companySet = this.mockResults?.[agentId]?.companySets || [];
    console.log('Available company set:', companySet);

    // Take the first N companies from the set
    const targetCompanyIds = companySet.slice(0, count);
    console.log('Selected company IDs:', targetCompanyIds);

    // Get the full company data for these IDs
    const targetCompanies = this.companies.filter(company => 
      targetCompanyIds.includes(company.id)
    );
    console.log('Found companies:', targetCompanies.map(c => ({ id: c.id, name: c.companyName })));

    // Generate results using the same logic as generateResults but without delay
    return targetCompanies.map(company => {
      const evidence = this.mockResults?.[agentId]?.evidenceTemplates?.map(template => ({
        type: 'news',
        title: template.replace('[COMPANY]', company.companyName),
        description: template.replace('[COMPANY]', company.companyName),
        confidence: 0.92,
        source: 'Company Website'
      })) || [];

      const researchSummary = this.mockResults?.[agentId]?.researchSummary?.replace(
        '[COMPANY]', 
        company.companyName
      ) || '';

      const whyQualified = this.mockResults?.[agentId]?.whyQualified?.replace(
        '[COMPANY]', 
        company.companyName
      ) || '';

      return {
        companyId: company.id,
        companyName: company.companyName,
        qualified: true,
        evidence,
        researchSummary,
        whyQualified,
        confidence: 0.92,
        confidenceScore: 92,
        researchDate: new Date().toISOString(),
        agentId,
        agentName: this.agents.find(a => a.id === agentId)?.title || '',
        industry: company.industry,
        employeeCount: company.employeeCount,
        hqCountry: company.hqCountry,
        hqState: company.hqState,
        hqCity: company.hqCity || '',
        website: company.website,
        totalFunding: company.totalFunding,
        estimatedAnnualRevenue: company.estimatedAnnualRevenue,
        yearFounded: company.yearFounded,
        dataSources: ['LinkedIn Jobs', 'Company Website', 'Tech News']
      };
    });
  }

  private mockResults: Record<string, {
    companySets: string[];
    evidenceTemplates: string[];
    researchSummary: string;
    whyQualified: string;
  }> = {
    'marketing-hiring': {
      companySets: ['stripe', 'fly', 'deno'],
      evidenceTemplates: [
        'New Marketing Operations Manager role posted',
        'Senior Growth Marketing position opened',
        'Marketing Technology Specialist job listing'
      ],
      researchSummary: '[COMPANY] is actively expanding their marketing team with multiple new roles focused on data-driven marketing and technology.',
      whyQualified: 'Multiple marketing roles indicate investment in data-driven marketing capabilities'
    },
    'data-hiring': {
      companySets: ['stripe', 'fly', 'deno'],
      evidenceTemplates: [
        'Data Engineer position opened',
        'Senior Analytics Engineer role posted',
        'Data Platform Engineer job listing'
      ],
      researchSummary: '[COMPANY] is building out their data team with multiple engineering and analytics roles.',
      whyQualified: 'Multiple data engineering roles indicate investment in data infrastructure'
    },
    'leadership-changes': {
      companySets: ['stripe', 'fly', 'deno'],
      evidenceTemplates: [
        'New CTO appointed',
        'VP of Engineering role opened',
        'Head of Product position posted'
      ],
      researchSummary: '[COMPANY] has recent leadership changes in technical roles.',
      whyQualified: 'New technical leadership indicates potential for infrastructure changes'
    },
    'news-funding': {
      companySets: ['stripe', 'fly', 'deno'],
      evidenceTemplates: [
        'Series B funding announcement',
        'New funding round closed',
        'Investment news release'
      ],
      researchSummary: '[COMPANY] recently raised significant funding.',
      whyQualified: 'Recent funding indicates growth budget and potential for new initiatives'
    },
    'news-ma': {
      companySets: ['stripe', 'fly', 'deno'],
      evidenceTemplates: [
        'Strategic acquisition announced',
        'Merger news release',
        'Company combination press release'
      ],
      researchSummary: '[COMPANY] has been involved in recent M&A activity.',
      whyQualified: 'M&A activity creates data integration needs'
    },
    'news-expansion': {
      companySets: ['stripe', 'fly', 'deno'],
      evidenceTemplates: [
        'European market expansion',
        'New office opening',
        'International growth announcement'
      ],
      researchSummary: '[COMPANY] is expanding into new markets.',
      whyQualified: 'Market expansion increases operational complexity'
    },
    'news-announcements': {
      companySets: ['stripe', 'fly', 'deno'],
      evidenceTemplates: [
        'Major product launch',
        'Platform update announcement',
        'New feature release'
      ],
      researchSummary: '[COMPANY] has made significant product announcements.',
      whyQualified: 'Product announcements indicate innovation focus'
    },
    'tech-product': {
      companySets: ['framer', 'spline', 'raycast'],
      evidenceTemplates: [
        'New feature launch',
        'Product update announcement',
        'Platform enhancement release'
      ],
      researchSummary: '[COMPANY] has launched new product features.',
      whyQualified: 'New features increase data complexity'
    },
    'tech-migration': {
      companySets: ['postman', 'sentry', 'miro'],
      evidenceTemplates: [
        'Data warehouse migration',
        'Infrastructure upgrade',
        'Platform modernization'
      ],
      researchSummary: '[COMPANY] is undergoing technical infrastructure changes.',
      whyQualified: 'Infrastructure changes create CDP evaluation opportunity'
    },
    'tech-stack': {
      companySets: ['docker', 'gitlab', 'typeform'],
      evidenceTemplates: [
        'Modern data stack adoption',
        'Technical blog post about infrastructure',
        'Engineering team update'
      ],
      researchSummary: '[COMPANY] uses modern technical infrastructure.',
      whyQualified: 'Modern stack indicates technical sophistication'
    }
  };
} 