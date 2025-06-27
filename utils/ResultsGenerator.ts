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

  // 1. Define multiple template variations for qualified/unqualified results
  private MARKETING_HIRING_QUALIFIED_VARIATIONS = [
    {
      selectedOptions: ["Marketing Leadership", "Growth Marketing", "Digital Marketing"],
      whyQualified: "Yes, multiple senior marketing roles including Marketing Operations Manager and Director of Growth Marketing",
      researchSummary: "[COMPANY] currently has 3 open marketing leadership positions focused on data-driven marketing. Key roles include Marketing Operations Manager responsible for martech stack optimization and lead routing, Director of Growth Marketing overseeing acquisition channels and conversion optimization, and Senior Marketing Technology Manager managing CDP implementation and data integration.",
      evidenceTemplates: [
        "Marketing Operations Manager focusing on martech stack optimization",
        "Director of Growth Marketing managing acquisition channels",
        "Senior Marketing Technology Manager for CDP implementation"
      ]
    },
    {
      selectedOptions: ["Marketing Operations", "Growth Marketing"],
      whyQualified: "Yes, with positions like Senior Performance Marketer, Growth Marketing Lead, and Marketing Analytics Manager",
      researchSummary: "[COMPANY] is expanding their performance marketing team with data-focused roles. They're hiring a Senior Performance Marketer to lead growth efforts and digital marketing strategies, a Growth Marketing Lead for acquisition channel optimization, and a Marketing Analytics Manager to build data-driven marketing measurement capabilities.",
      evidenceTemplates: [
        "Senior Performance Marketer leading growth efforts and digital strategies",
        "Growth Marketing Lead for acquisition channel optimization",
        "Marketing Analytics Manager building data-driven measurement"
      ]
    },
    {
      selectedOptions: ["Marketing Leadership"],
      whyQualified: "Yes, Product Marketing Manager and senior leadership roles focusing on go-to-market strategies",
      researchSummary: "[COMPANY] has open senior marketing positions including Product Marketing Manager for GTM strategy development, Director of Marketing Strategy for cross-functional collaboration, and Head of Customer Marketing for lifecycle management. These roles emphasize strategic planning, market research, and data-driven decision making.",
      evidenceTemplates: [
        "Product Marketing Manager focusing on GTM strategy development",
        "Director of Marketing Strategy for cross-functional collaboration",
        "Head of Customer Marketing for lifecycle management"
      ]
    }
  ];

  private MARKETING_HIRING_UNQUALIFIED_VARIATIONS = [
    {
      selectedOptions: [],
      whyQualified: "No, only brand and creative roles currently posted",
      researchSummary: "[COMPANY]'s current marketing openings focus primarily on brand and creative functions rather than operations or data-driven roles. Available positions include Brand Designer for visual identity work, Content Marketing Specialist for blog content creation, and Creative Marketing Coordinator for campaign asset development.",
      evidenceTemplates: [
        "Brand Designer role focused on visual identity",
        "Content Marketing Specialist for content creation",
        "Creative Marketing Coordinator for campaign assets"
      ]
    },
    {
      selectedOptions: [],
      whyQualified: "No, no marketing leadership or operations positions currently open",
      researchSummary: "[COMPANY] shows no current openings for marketing leadership, operations, or growth marketing roles. Their recent job postings focus on engineering and product roles, with no marketing team expansion evident. The company appears to be in a technical scaling phase rather than marketing operations investment.",
      evidenceTemplates: [
        "No marketing leadership positions in current postings",
        "Recent openings focus on engineering and product roles",
        "No evidence of marketing operations team expansion"
      ]
    },
    {
      selectedOptions: [],
      whyQualified: "No, only junior-level and internship marketing roles available",
      researchSummary: "[COMPANY]'s current marketing positions are primarily entry-level roles that don't indicate senior marketing operations investment. Available roles include Marketing Intern for campaign support, Junior Marketing Associate for administrative tasks, and Marketing Coordinator for event logistics.",
      evidenceTemplates: [
        "Marketing Intern position for campaign support",
        "Junior Marketing Associate for basic operations",
        "Marketing Coordinator for event logistics"
      ]
    }
  ];

  private MARKETING_HIRING_NEEDS_REVIEW_VARIATIONS = [
    {
      selectedOptions: ["Marketing Operations"],
      whyQualified: "Needs Review: Junior marketing roles found, seniority unclear",
      researchSummary: "As of June 18, 2025, [COMPANY] has entry-level marketing roles including Marketing Intern, Junior Marketing Associate, and Marketing Coordinator, which don't indicate senior operations or leadership investment.",
      evidenceTemplates: [
        "Marketing Intern - campaign support",
        "Junior Marketing Associate - administrative tasks",
        "Marketing Coordinator - basic coordination"
      ]
    },
    {
      selectedOptions: ["Growth Marketing"],
      whyQualified: "Needs Review: Marketing roles found, but may not be senior enough",
      researchSummary: "As of June 18, 2025, [COMPANY] is hiring for Marketing Specialist and Digital Marketing roles, but the seniority level and scope of responsibilities need review to determine if they match senior operations criteria.",
      evidenceTemplates: [
        "Marketing Specialist - general marketing support",
        "Digital Marketing - entry to mid-level role",
        "Marketing Associate - junior position"
      ]
    }
  ];

  private DATA_HIRING_QUALIFIED_VARIATIONS = [
    {
      selectedOptions: ["Data Engineering", "Data Science", "Analytics"],
      whyQualified: "Yes, hiring for Staff Data Engineer, Principal Data Scientist, and Senior Analytics Engineer roles as part of a major data team expansion.",
      researchSummary: "[COMPANY] is scaling their data team with multiple senior-level openings. The company is investing in a new data platform, advanced analytics, and machine learning initiatives.",
      evidenceTemplates: [
        "Staff Data Engineer - building distributed data pipelines for real-time analytics and reporting.",
        "Principal Data Scientist - leading machine learning projects to drive product innovation.",
        "Senior Analytics Engineer - developing BI solutions and self-serve dashboards for business teams.",
        "Data Team Expansion - 4 new roles posted in the last 30 days, signaling rapid growth."
      ]
    },
    {
      selectedOptions: ["Data Engineering", "Data Leadership"],
      whyQualified: "Yes, hiring for VP of Data and Lead Data Engineer to drive data strategy and infrastructure modernization.",
      researchSummary: "[COMPANY] is investing in data leadership and engineering. Recent postings include VP of Data and Lead Data Engineer, with a focus on cloud migration and data governance.",
      evidenceTemplates: [
        "VP of Data - overseeing company-wide data strategy and governance initiatives.",
        "Lead Data Engineer - leading cloud data migration and platform modernization.",
        "Data Platform Architect - designing scalable systems for analytics and AI workloads."
      ]
    },
    {
      selectedOptions: ["Analytics"],
      whyQualified: "Yes, hiring for Analytics Manager, BI Developer, and Data Visualization Specialist to support company-wide analytics.",
      researchSummary: "[COMPANY] is expanding analytics capabilities with new roles focused on business intelligence and data visualization.",
      evidenceTemplates: [
        "Analytics Manager - building a centralized analytics function for all business units.",
        "BI Developer - creating dashboards and automated reporting pipelines.",
        "Data Visualization Specialist - delivering advanced reporting and executive insights."
      ]
    }
  ];

  private DATA_HIRING_UNQUALIFIED_VARIATIONS = [
    {
      selectedOptions: [],
      whyQualified: "No data team hiring: all open roles are in sales, marketing, or support.",
      researchSummary: "[COMPANY] has no open positions for data engineering, science, or analytics. Current job postings are focused on other departments.",
      evidenceTemplates: [
        "Sales Development Rep - expanding sales team to drive new business.",
        "Customer Support Specialist - focus on customer retention and support.",
        "No data roles found in the last 60 days across all job boards."
      ]
    },
    {
      selectedOptions: [],
      whyQualified: "Only hiring in IT and operations, no data team expansion evident.",
      researchSummary: "[COMPANY]'s current openings are for IT support and general operations, with no data team growth.",
      evidenceTemplates: [
        "IT Support Analyst - maintaining internal systems and help desk operations.",
        "Operations Coordinator - supporting logistics and office management.",
        "No data engineering or analytics postings in recent hiring cycles."
      ]
    },
    {
      selectedOptions: [],
      whyQualified: "Data team appears stable and fully staffed, no new hiring activity.",
      researchSummary: "[COMPANY] has a stable data team with no current hiring for data roles. Recent blog posts highlight existing team members only.",
      evidenceTemplates: [
        "No new data team positions posted in the last quarter.",
        "Stable data org - highlighting current team in company updates.",
        "Employee spotlight: existing data team members featured in blog."
      ]
    },
    {
      selectedOptions: [],
      whyQualified: "Hiring only in engineering, but not for data roles.",
      researchSummary: "[COMPANY] is hiring for backend and frontend engineers, but no data-specific positions are open.",
      evidenceTemplates: [
        "Backend Engineer - building product features and APIs.",
        "Frontend Developer - focusing on UI/UX improvements.",
        "No data engineering or analytics jobs in current hiring round."
      ]
    },
    {
      selectedOptions: [],
      whyQualified: "Focus on other technical areas, not data.",
      researchSummary: "[COMPANY] is investing in DevOps and cloud infrastructure, but no data team hiring is evident.",
      evidenceTemplates: [
        "DevOps Engineer - automating cloud infrastructure and deployments.",
        "Cloud Architect - leading AWS/GCP migration projects.",
        "No data roles in current hiring or company announcements."
      ]
    }
  ];

  private DATA_HIRING_NEEDS_REVIEW_VARIATIONS = [
    {
      selectedOptions: ["Analytics"],
      whyQualified: "Needs Review: Hiring for junior analytics roles, unclear if expanding senior team.",
      researchSummary: "[COMPANY] is hiring for Junior Data Analyst and Analytics Assistant, but no senior data roles are posted. Some evidence suggests possible future expansion.",
      evidenceTemplates: [
        "Junior Data Analyst - supporting ad hoc reporting and data entry.",
        "Analytics Assistant - assisting with basic dashboard updates.",
        "Recent blog post hints at future data hiring and analytics investment."
      ]
    },
    {
      selectedOptions: ["Data Science"],
      whyQualified: "Needs Review: Data science roles found, but may not be core team; mixed signals in evidence.",
      researchSummary: "[COMPANY] is hiring for Data Science Intern and Research Assistant, but also has open roles in marketing and product. Human review needed to determine if data team is expanding.",
      evidenceTemplates: [
        "Data Science Intern - working on short-term research projects.",
        "Research Assistant - supporting temporary data initiatives.",
        "Product Marketing Specialist - non-data role, but listed alongside data positions."
      ]
    }
  ];

  // --- LEADERSHIP CHANGES AGENT VARIATIONS ---
  private LEADERSHIP_CHANGES_QUALIFIED_VARIATIONS = [
    {
      selectedOptions: ["CTO/VP Engineering", "CDO/VP Data"],
      whyQualified: "Recent CTO or CDO hire signals strategic shift toward data and technology modernization.",
      researchSummary: "[COMPANY] announced a new CTO and CDO in the last 6 months, with a mandate to modernize data infrastructure and drive innovation.",
      evidenceTemplates: [
        "LinkedIn: New CTO joins from leading SaaS company.",
        "Press release: Appointment of Chief Data Officer to lead analytics strategy.",
        "Company blog: Leadership team expands to accelerate digital transformation."
      ]
    },
    {
      selectedOptions: ["VP Product", "CMO/VP Marketing"],
      whyQualified: "VP Product and CMO hires indicate focus on product-led growth and marketing innovation.",
      researchSummary: "[COMPANY] hired a new VP Product and CMO to drive product expansion and go-to-market strategy.",
      evidenceTemplates: [
        "Press release: VP Product joins to lead new product initiatives.",
        "LinkedIn: CMO brings experience from top tech brands.",
        "Company blog: Leadership changes to support growth."
      ]
    },
    {
      selectedOptions: ["CTO/VP Engineering"],
      whyQualified: "CTO transition suggests evaluation of current tech stack and vendor relationships.",
      researchSummary: "[COMPANY] recently transitioned CTOs, with a focus on reviewing technology partners and infrastructure.",
      evidenceTemplates: [
        "LinkedIn: CTO transition post highlights new priorities.",
        "Press release: Outgoing CTO to remain as advisor.",
        "Company blog: Technology review underway."
      ]
    }
  ];

  private LEADERSHIP_CHANGES_UNQUALIFIED_VARIATIONS = [
    {
      selectedOptions: [],
      whyQualified: "No recent leadership changes in technology or data roles.",
      researchSummary: "[COMPANY] has had a stable leadership team for the past 2 years, with no new executive hires.",
      evidenceTemplates: [
        "No press releases or LinkedIn updates on leadership changes.",
        "Company blog focuses on existing team achievements.",
        "No new executive roles listed in company announcements."
      ]
    },
    {
      selectedOptions: [],
      whyQualified: "Recent hires in non-technical roles only.",
      researchSummary: "[COMPANY] recently hired in HR and finance, but no changes in product, engineering, or data leadership.",
      evidenceTemplates: [
        "Press release: New CFO joins the company.",
        "LinkedIn: HR Director announced, no tech leadership changes.",
        "Company blog: Focus on operational excellence."
      ]
    }
  ];

  private LEADERSHIP_CHANGES_NEEDS_REVIEW_VARIATIONS = [
    {
      selectedOptions: ["VP Product"],
      whyQualified: "VP Product role filled, but unclear impact on technology direction.",
      researchSummary: "[COMPANY] hired a VP Product, but public materials do not specify changes to tech stack or data strategy.",
      evidenceTemplates: [
        "Press release: VP Product joins, no mention of technology initiatives.",
        "LinkedIn: New product leadership, unclear mandate.",
        "Company blog: Product roadmap under review."
      ]
    },
    {
      selectedOptions: ["CMO/VP Marketing"],
      whyQualified: "CMO hire announced, but no details on marketing technology plans.",
      researchSummary: "[COMPANY] announced a new CMO, but has not shared plans for martech or analytics investments.",
      evidenceTemplates: [
        "Press release: CMO joins, focus on brand strategy.",
        "LinkedIn: Marketing leadership update, no tech details.",
        "Company blog: Brand refresh in progress."
      ]
    }
  ];

  // --- NEWS MA AGENT VARIATIONS ---
  private NEWS_MA_QUALIFIED_VARIATIONS = [
    {
      selectedOptions: ["Acquiring Company", "Merger"],
      whyQualified: "Company is actively acquiring or merging, creating integration and data consolidation needs.",
      researchSummary: "[COMPANY] recently acquired a competitor and announced a merger, requiring unified data infrastructure and analytics.",
      evidenceTemplates: [
        "Business news: [COMPANY] acquires major competitor.",
        "SEC filing: Merger agreement details integration plans.",
        "Press release: Company to consolidate platforms post-merger."
      ]
    },
    {
      selectedOptions: ["Acquisition Target"],
      whyQualified: "Company identified as an acquisition target, likely to undergo technology integration.",
      researchSummary: "[COMPANY] is rumored to be an acquisition target, with analysts predicting significant system integration work ahead.",
      evidenceTemplates: [
        "Business news: [COMPANY] in talks for acquisition.",
        "Analyst report: Integration challenges expected.",
        "Company blog: Preparing for transition."
      ]
    },
    {
      selectedOptions: ["Strategic Partnership"],
      whyQualified: "Announced strategic partnership, opening new data sharing and integration opportunities.",
      researchSummary: "[COMPANY] formed a strategic partnership with a leading SaaS provider, focusing on joint data initiatives.",
      evidenceTemplates: [
        "Press release: Strategic partnership for data collaboration.",
        "Industry publication: Partnership to drive integration.",
        "Company blog: Joint product roadmap announced."
      ]
    }
  ];

  private NEWS_MA_UNQUALIFIED_VARIATIONS = [
    {
      selectedOptions: [],
      whyQualified: "No recent M&A activity or partnership announcements.",
      researchSummary: "[COMPANY] has not participated in any mergers, acquisitions, or strategic partnerships in the last 24 months.",
      evidenceTemplates: [
        "No business news or SEC filings on M&A activity.",
        "Company blog focuses on organic growth.",
        "No press releases on partnerships or acquisitions."
      ]
    },
    {
      selectedOptions: [],
      whyQualified: "Recent M&A activity unrelated to technology or data integration.",
      researchSummary: "[COMPANY] completed a minor acquisition in a non-core business area, with no impact on technology stack.",
      evidenceTemplates: [
        "Press release: Acquisition of small services firm.",
        "Business news: Deal focused on market expansion, not tech.",
        "No mention of data or platform integration."
      ]
    }
  ];

  private NEWS_MA_NEEDS_REVIEW_VARIATIONS = [
    {
      selectedOptions: ["Merger"],
      whyQualified: "Merger announced, but unclear integration plans or technology roadmap.",
      researchSummary: "[COMPANY] announced a merger, but public materials do not specify how systems or data will be unified.",
      evidenceTemplates: [
        "SEC filing: Merger agreement, no tech details.",
        "Press release: Merger to drive growth, integration TBD.",
        "Industry news: Analysts question integration strategy."
      ]
    },
    {
      selectedOptions: ["Acquisition Target"],
      whyQualified: "Rumored acquisition, but no confirmation or integration plans shared.",
      researchSummary: "[COMPANY] is rumored to be an acquisition target, but no official statements or plans have been released.",
      evidenceTemplates: [
        "Business news: Acquisition rumors circulate.",
        "No press releases or SEC filings confirming deal.",
        "Company blog: No comment on M&A activity."
      ]
    }
  ];

  // --- NEWS EXPANSION AGENT VARIATIONS ---
  private NEWS_EXPANSION_QUALIFIED_VARIATIONS = [
    {
      selectedOptions: ["Geographic Expansion", "Market Expansion"],
      whyQualified: "Announced new offices and market entry, signaling growth and new data needs.",
      researchSummary: "[COMPANY] opened offices in two new countries and entered a new market segment, requiring expanded data infrastructure.",
      evidenceTemplates: [
        "Press release: New office openings in Europe and APAC.",
        "Job postings: Hiring for regional sales and engineering roles.",
        "Company update: Market entry strategy for 2025."
      ]
    },
    {
      selectedOptions: ["Product Expansion"],
      whyQualified: "Launched new product lines, increasing data complexity and integration needs.",
      researchSummary: "[COMPANY] expanded its product portfolio, launching two new SaaS offerings in the last year.",
      evidenceTemplates: [
        "Product blog: Announcing new SaaS products.",
        "Press release: Product expansion to serve new verticals.",
        "Industry news: Company diversifies product suite."
      ]
    },
    {
      selectedOptions: ["Team Expansion"],
      whyQualified: "Significant team growth, especially in engineering and data roles.",
      researchSummary: "[COMPANY] doubled its engineering team and added new data science roles to support growth.",
      evidenceTemplates: [
        "Job postings: Multiple openings for engineers and data scientists.",
        "Company blog: Team milestones and new hires.",
        "Press release: Team expansion to support product roadmap."
      ]
    }
  ];

  private NEWS_EXPANSION_UNQUALIFIED_VARIATIONS = [
    {
      selectedOptions: [],
      whyQualified: "No recent expansion activity or new market entry.",
      researchSummary: "[COMPANY] has not announced any new offices, products, or market entries in the last 18 months.",
      evidenceTemplates: [
        "No press releases on expansion or new markets.",
        "Job postings focus on backfills, not growth.",
        "Company blog: Focus on existing operations."
      ]
    },
    {
      selectedOptions: [],
      whyQualified: "Expansion limited to minor operational changes.",
      researchSummary: "[COMPANY] made minor operational changes, but no significant expansion or growth initiatives.",
      evidenceTemplates: [
        "Press release: Office renovation, not new location.",
        "No new product or market announcements.",
        "Industry news: Company maintains current footprint."
      ]
    }
  ];

  private NEWS_EXPANSION_NEEDS_REVIEW_VARIATIONS = [
    {
      selectedOptions: ["Market Expansion"],
      whyQualified: "Market expansion announced, but unclear impact on technology or data needs.",
      researchSummary: "[COMPANY] entered a new market, but public materials do not specify changes to data infrastructure.",
      evidenceTemplates: [
        "Press release: Market entry, no tech details.",
        "Company blog: New market, but no mention of data.",
        "Industry news: Analysts question readiness for expansion."
      ]
    },
    {
      selectedOptions: ["Product Expansion"],
      whyQualified: "Product expansion underway, but integration and data plans not disclosed.",
      researchSummary: "[COMPANY] launched new products, but has not shared details on supporting technology or data integration.",
      evidenceTemplates: [
        "Product blog: New product launch, no tech info.",
        "Press release: Product expansion, integration TBD.",
        "Company update: Awaiting details on data plans."
      ]
    }
  ];

  // --- NEWS ANNOUNCEMENTS AGENT VARIATIONS ---
  private NEWS_ANNOUNCEMENTS_QUALIFIED_VARIATIONS = [
    {
      selectedOptions: ["Product Launch", "Strategic Initiative"],
      whyQualified: "Announced major product launch and strategic initiative, indicating innovation and investment.",
      researchSummary: "[COMPANY] launched a new flagship product and announced a strategic initiative to drive growth.",
      evidenceTemplates: [
        "Company blog: Major product launch recap.",
        "Press release: Strategic initiative for 2025.",
        "Industry publication: Company recognized for innovation."
      ]
    },
    {
      selectedOptions: ["Partnership"],
      whyQualified: "Formed new partnership with leading technology provider.",
      researchSummary: "[COMPANY] announced a partnership with a top cloud provider to accelerate digital transformation.",
      evidenceTemplates: [
        "Press release: Partnership with cloud leader.",
        "Industry news: Collaboration to drive technology adoption.",
        "Company blog: Partnership goals and roadmap."
      ]
    },
    {
      selectedOptions: ["Technology Investment"],
      whyQualified: "Invested in new technology platforms and infrastructure.",
      researchSummary: "[COMPANY] made significant investments in technology, upgrading platforms and expanding R&D.",
      evidenceTemplates: [
        "Press release: $20M investment in technology.",
        "Company blog: R&D expansion and new hires.",
        "Industry publication: Company leads in tech adoption."
      ]
    }
  ];

  private NEWS_ANNOUNCEMENTS_UNQUALIFIED_VARIATIONS = [
    {
      selectedOptions: [],
      whyQualified: "No major announcements or strategic initiatives in the last year.",
      researchSummary: "[COMPANY] has not made any significant product launches, partnerships, or investments recently.",
      evidenceTemplates: [
        "No press releases on new products or initiatives.",
        "Company blog: Focus on ongoing operations.",
        "Industry news: No recent coverage of company activities."
      ]
    },
    {
      selectedOptions: [],
      whyQualified: "Recent announcements unrelated to technology or growth.",
      researchSummary: "[COMPANY] made minor announcements about community events, with no impact on technology or business strategy.",
      evidenceTemplates: [
        "Press release: Community event sponsorship.",
        "Company blog: Local charity partnership.",
        "Industry news: No mention of product or tech."
      ]
    }
  ];

  private NEWS_ANNOUNCEMENTS_NEEDS_REVIEW_VARIATIONS = [
    {
      selectedOptions: ["Strategic Initiative"],
      whyQualified: "Strategic initiative announced, but unclear scope or investment level.",
      researchSummary: "[COMPANY] announced a new strategic initiative, but public materials do not specify budget or technology plans.",
      evidenceTemplates: [
        "Press release: Initiative launch, no budget details.",
        "Company blog: Initiative goals, tech plans TBD.",
        "Industry news: Analysts await more information."
      ]
    },
    {
      selectedOptions: ["Product Launch"],
      whyQualified: "Product launch announced, but no details on supporting technology or integration.",
      researchSummary: "[COMPANY] launched a new product, but has not shared information on technology stack or data integration.",
      evidenceTemplates: [
        "Company blog: Product launch, no tech info.",
        "Press release: Launch announcement, integration TBD.",
        "Industry publication: Awaiting details on product roadmap."
      ]
    }
  ];

  // --- TECH PRODUCT AGENT VARIATIONS ---
  private TECH_PRODUCT_QUALIFIED_VARIATIONS = [
    {
      selectedOptions: ["New Product Line", "Platform Launch"],
      whyQualified: "Launched new product line and platform, increasing data and integration needs.",
      researchSummary: "[COMPANY] introduced a new product line and launched a platform for developers, expanding integration complexity.",
      evidenceTemplates: [
        "Product blog: Announcing new product line for 2025.",
        "Release notes: Platform launch with API integrations.",
        "Customer communication: New features available to all users."
      ]
    },
    {
      selectedOptions: ["Major Feature Release"],
      whyQualified: "Released major new features, signaling ongoing product investment.",
      researchSummary: "[COMPANY] rolled out a major feature release, adding analytics and automation capabilities.",
      evidenceTemplates: [
        "Release notes: Major feature update for analytics.",
        "Product blog: Automation features now live.",
        "Customer email: Feature highlights and onboarding."
      ]
    },
    {
      selectedOptions: ["API/Integration"],
      whyQualified: "Launched new API and integration options for partners and customers.",
      researchSummary: "[COMPANY] released new API endpoints and integration guides to support partners and developers.",
      evidenceTemplates: [
        "Developer blog: API launch and documentation.",
        "Release notes: Integration support for new platforms.",
        "Customer communication: API access now available."
      ]
    }
  ];

  private TECH_PRODUCT_UNQUALIFIED_VARIATIONS = [
    {
      selectedOptions: [],
      whyQualified: "No recent product launches or major feature releases.",
      researchSummary: "[COMPANY] has not launched any new products or features in the last 12 months.",
      evidenceTemplates: [
        "No product blog updates on new launches.",
        "Release notes: Minor bug fixes only.",
        "Customer communication: No new features announced."
      ]
    },
    {
      selectedOptions: [],
      whyQualified: "Recent product updates limited to maintenance and minor improvements.",
      researchSummary: "[COMPANY] focused on maintenance releases, with no major product or platform changes.",
      evidenceTemplates: [
        "Release notes: Maintenance update.",
        "Product blog: Focus on stability and reliability.",
        "Customer email: No new features this quarter."
      ]
    }
  ];

  private TECH_PRODUCT_NEEDS_REVIEW_VARIATIONS = [
    {
      selectedOptions: ["Platform Launch"],
      whyQualified: "Platform launch announced, but unclear integration or customer adoption.",
      researchSummary: "[COMPANY] launched a new platform, but public materials do not specify integration partners or customer uptake.",
      evidenceTemplates: [
        "Product blog: Platform launch, integration details TBD.",
        "Release notes: Platform available, adoption unclear.",
        "Industry news: Analysts await customer feedback."
      ]
    },
    {
      selectedOptions: ["Major Feature Release"],
      whyQualified: "Major feature release announced, but no details on impact or usage.",
      researchSummary: "[COMPANY] released a major feature, but has not shared adoption metrics or customer stories.",
      evidenceTemplates: [
        "Release notes: Feature release, no usage data.",
        "Product blog: Feature highlights, impact TBD.",
        "Customer communication: Awaiting feedback."
      ]
    }
  ];

  // --- TECH MIGRATION AGENT VARIATIONS ---
  private TECH_MIGRATION_QUALIFIED_VARIATIONS = [
    {
      selectedOptions: ["Cloud Migration", "Data Platform"],
      whyQualified: "Company is migrating to the cloud and modernizing data platforms.",
      researchSummary: "[COMPANY] is undergoing a cloud migration and upgrading its data platform to support analytics and growth.",
      evidenceTemplates: [
        "Engineering blog: Cloud migration project kickoff.",
        "Job posting: Data platform engineer for migration.",
        "Tech conference talk: Lessons learned from cloud migration."
      ]
    },
    {
      selectedOptions: ["Analytics Tools"],
      whyQualified: "Adopting new analytics tools as part of infrastructure modernization.",
      researchSummary: "[COMPANY] implemented new analytics tools to improve reporting and data-driven decision making.",
      evidenceTemplates: [
        "Job posting: Analytics engineer for tool rollout.",
        "Engineering blog: Analytics stack modernization.",
        "Conference talk: Analytics tool adoption case study."
      ]
    },
    {
      selectedOptions: ["Infrastructure Modernization"],
      whyQualified: "Investing in infrastructure modernization to support scalability and performance.",
      researchSummary: "[COMPANY] is modernizing its infrastructure, focusing on scalability, reliability, and integration.",
      evidenceTemplates: [
        "Engineering blog: Infrastructure modernization journey.",
        "Job posting: DevOps engineer for modernization projects.",
        "Tech conference: Company presents on modernization best practices."
      ]
    }
  ];

  private TECH_MIGRATION_UNQUALIFIED_VARIATIONS = [
    {
      selectedOptions: [],
      whyQualified: "No recent migration or modernization projects announced.",
      researchSummary: "[COMPANY] has not announced any cloud migration, data platform, or analytics tool adoption in the last 18 months.",
      evidenceTemplates: [
        "No engineering blog posts on migration.",
        "Job postings focus on maintenance roles.",
        "No conference talks or case studies on modernization."
      ]
    },
    {
      selectedOptions: [],
      whyQualified: "Recent infrastructure changes limited to minor upgrades.",
      researchSummary: "[COMPANY] made minor infrastructure upgrades, but no major migration or analytics tool adoption.",
      evidenceTemplates: [
        "Engineering blog: Minor upgrade announcement.",
        "Job posting: Maintenance engineer role.",
        "No mention of cloud or analytics in public materials."
      ]
    }
  ];

  private TECH_MIGRATION_NEEDS_REVIEW_VARIATIONS = [
    {
      selectedOptions: ["Cloud Migration"],
      whyQualified: "Cloud migration project underway, but unclear scope or timeline.",
      researchSummary: "[COMPANY] started a cloud migration, but public materials do not specify project scope or expected outcomes.",
      evidenceTemplates: [
        "Engineering blog: Migration kickoff, details TBD.",
        "Job posting: Cloud migration engineer, contract role.",
        "Conference talk: Migration challenges discussed, no timeline shared."
      ]
    },
    {
      selectedOptions: ["Analytics Tools"],
      whyQualified: "Analytics tool adoption mentioned, but no details on integration or impact.",
      researchSummary: "[COMPANY] referenced new analytics tools, but has not shared integration plans or results.",
      evidenceTemplates: [
        "Engineering blog: Analytics tool mention, no follow-up.",
        "Job posting: Analytics engineer, project details unclear.",
        "Conference talk: Tool adoption, impact TBD."
      ]
    }
  ];

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
      const agent = this.agents.find(a => a.id === agentId);
      const isPicklist = agent?.questionType === 'Picklist';
      
      console.log('🔍 [DEBUG] ResultsGenerator agent lookup:', {
        agentId,
        foundAgent: !!agent,
        agentQuestionType: agent?.questionType,
        isPicklist,
        allAgentIds: this.agents.map(a => ({ id: a.id, questionType: a.questionType }))
      });
      
      // Declare these ONCE
      const baseCompanies = companySample && companySample.length >= 10 ? companySample : [...this.companies];
      const shuffled = [...baseCompanies].sort(() => 0.5 - Math.random());
      const sample = shuffled.slice(0, 10);
      const qualifiedCompanies = sample.slice(0, 3);
      const qualifiedIds = new Set(qualifiedCompanies.map(c => c.id));
      const needsReviewCompanies = sample.filter(c => !qualifiedIds.has(c.id)).slice(0, 2);
      const needsReviewIds = new Set([...Array.from(qualifiedIds), ...needsReviewCompanies.map(c => c.id)]);
      const unqualifiedCompanies = sample.filter(c => !needsReviewIds.has(c.id)).slice(0, 5);
      if (isPicklist) {
        // Picklist qualified variations
        const picklistQualifiedVariations = this.MARKETING_HIRING_QUALIFIED_VARIATIONS;
        const picklistUnqualifiedVariations = this.MARKETING_HIRING_UNQUALIFIED_VARIATIONS;
        const picklistNeedsReviewVariations = this.MARKETING_HIRING_NEEDS_REVIEW_VARIATIONS;
        // Assign qualified variations in order, cycling if needed
        const qualifiedResults = qualifiedCompanies.map((company, idx) => {
          const template = picklistQualifiedVariations[idx % picklistQualifiedVariations.length];
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
            whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
            confidence: 0.92,
            confidenceScore: 92,
            researchDate: new Date().toISOString(),
            agentId,
            agentName: agent?.title || '',
            industry: company.industry,
            employeeCount: company.employeeCount,
            hqCountry: company.hqCountry,
            hqState: company.hqState,
            hqCity: company.hqCity,
            website: company.website,
            totalFunding: company.totalFunding,
            estimatedAnnualRevenue: company.estimatedAnnualRevenue,
            yearFounded: company.yearFounded,
            dataSources: ['LinkedIn Jobs', 'Company Website'],
            selectedOptions: template.selectedOptions,
            questionType: 'Picklist',
            researchResults: {
              summary: template.researchSummary.replace('[COMPANY]', company.companyName),
              sources: ['LinkedIn Jobs', 'Company Website']
            },
            assignedPersonas: []
          };
        });
        // Assign needsReview variations in order, cycling if needed
        const needsReviewResults = needsReviewCompanies.map((company, idx) => {
          const template = picklistNeedsReviewVariations[idx % picklistNeedsReviewVariations.length];
          const evidence = template.evidenceTemplates.map(et => ({
            type: 'job_posting',
            title: et,
            description: et,
            confidence: 0.8,
            source: 'LinkedIn Jobs'
          }));
          return {
            companyId: company.id,
            companyName: company.companyName,
            qualified: false,
            needsReview: true,
            evidence,
            researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
            whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
            confidence: 0.8,
            confidenceScore: 80,
            researchDate: new Date().toISOString(),
            agentId,
            agentName: agent?.title || '',
            industry: company.industry,
            employeeCount: company.employeeCount,
            hqCountry: company.hqCountry,
            hqState: company.hqState,
            hqCity: company.hqCity,
            website: company.website,
            totalFunding: company.totalFunding,
            estimatedAnnualRevenue: company.estimatedAnnualRevenue,
            yearFounded: company.yearFounded,
            dataSources: ['LinkedIn Jobs', 'Company Website'],
            selectedOptions: template.selectedOptions,
            questionType: 'Picklist',
            researchResults: {
              summary: template.researchSummary.replace('[COMPANY]', company.companyName),
              sources: ['LinkedIn Jobs', 'Company Website']
            },
            assignedPersonas: []
          };
        });
        // Assign unqualified variations in order, cycling if needed
        const unqualifiedResults = unqualifiedCompanies.map((company, idx) => {
          const template = picklistUnqualifiedVariations[idx % picklistUnqualifiedVariations.length];
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
            whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
            confidence: 0.7,
            confidenceScore: 70,
            researchDate: new Date().toISOString(),
            agentId,
            agentName: agent?.title || '',
            industry: company.industry,
            employeeCount: company.employeeCount,
            hqCountry: company.hqCountry,
            hqState: company.hqState,
            hqCity: company.hqCity,
            website: company.website,
            totalFunding: company.totalFunding,
            estimatedAnnualRevenue: company.estimatedAnnualRevenue,
            yearFounded: company.yearFounded,
            dataSources: ['Company Website'],
            selectedOptions: template.selectedOptions,
            questionType: 'Picklist',
            researchResults: {
              summary: template.researchSummary.replace('[COMPANY]', company.companyName),
              sources: ['Company Website']
            },
            assignedPersonas: []
          };
        });
        return [...qualifiedResults, ...needsReviewResults, ...unqualifiedResults];
      }
      // Boolean logic for marketing-hiring
      console.log('🔍 [DEBUG] Using marketing-hiring BOOLEAN template logic');
      
      // Build qualified results
      const qualifiedResults = qualifiedCompanies.map(company => {
        const template = this.MARKETING_HIRING_QUALIFIED_VARIATIONS[Math.floor(Math.random() * this.MARKETING_HIRING_QUALIFIED_VARIATIONS.length)];
        const evidence = template.evidenceTemplates.map(et => ({ type: 'job_posting', title: et, description: et, confidence: 0.92, source: 'LinkedIn Jobs' }));
        return {
          companyId: company.id,
          companyName: company.companyName,
          qualified: true,
          needsReview: false,
          evidence,
          researchSummary: template.researchSummary.replace(/\[COMPANY\]/g, company.companyName),
          whyQualified: template.whyQualified.replace(/\[COMPANY\]/g, company.companyName),
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
          dataSources: ['LinkedIn Jobs', 'Company Website'],
          questionType: agent?.questionType || 'Boolean',
          researchResults: {
            summary: template.researchSummary.replace(/\[COMPANY\]/g, company.companyName),
            sources: ['LinkedIn Jobs', 'Company Website']
          },
          assignedPersonas: []
        };
      });

      // Build needsReview results
      const needsReviewResults = needsReviewCompanies.map(company => {
        const template = this.MARKETING_HIRING_NEEDS_REVIEW_VARIATIONS[Math.floor(Math.random() * this.MARKETING_HIRING_NEEDS_REVIEW_VARIATIONS.length)];
        const evidence = template.evidenceTemplates.map(et => ({
          type: 'job_posting',
          title: et,
          description: et,
          confidence: 0.8,
          source: 'LinkedIn Jobs'
        }));
        return {
          companyId: company.id,
          companyName: company.companyName,
          qualified: false,
          needsReview: true,
          evidence,
          researchSummary: template.researchSummary.replace(/\[COMPANY\]/g, company.companyName),
          whyQualified: template.whyQualified.replace(/\[COMPANY\]/g, company.companyName),
          confidence: 0.8,
          confidenceScore: 80,
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
          dataSources: ['LinkedIn Jobs', 'Company Website'],
          questionType: agent?.questionType || 'Boolean',
          researchResults: {
            summary: template.researchSummary.replace(/\[COMPANY\]/g, company.companyName),
            sources: ['LinkedIn Jobs', 'Company Website']
          },
          assignedPersonas: []
        };
      });

      // Build unqualified results
      const unqualifiedResults = unqualifiedCompanies.map(company => {
        const template = this.MARKETING_HIRING_UNQUALIFIED_VARIATIONS[Math.floor(Math.random() * this.MARKETING_HIRING_UNQUALIFIED_VARIATIONS.length)];
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
          needsReview: false,
          evidence,
          researchSummary: template.researchSummary.replace(/\[COMPANY\]/g, company.companyName),
          whyQualified: template.whyQualified.replace(/\[COMPANY\]/g, company.companyName),
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
          dataSources: ['Company Website'],
          questionType: agent?.questionType || 'Boolean',
          researchResults: {
            summary: template.researchSummary.replace(/\[COMPANY\]/g, company.companyName),
            sources: ['Company Website']
          },
          assignedPersonas: []
        };
      });

      // Debug: log all results
      console.log('🔍 [DEBUG] Final marketing-hiring results:', [...qualifiedResults, ...needsReviewResults, ...unqualifiedResults].map(r => ({ id: r.companyId, qualified: r.qualified, needsReview: r.needsReview, whyQualified: r.whyQualified })));
      
      // Return all results (3 qualified + 2 needsReview + 5 unqualified)
      return [...qualifiedResults, ...needsReviewResults, ...unqualifiedResults];
    }

    // --- DATA HIRING AGENT LOGIC ---
    if (agentId === 'data-hiring') {
      const agent = this.agents.find(a => a.id === agentId);
      const isPicklist = agent?.questionType === 'Picklist';
      const isBoolean = agent?.questionType === 'Boolean';
      console.log('[DATA-HIRING] Block entered. agent:', agent, 'isPicklist:', isPicklist, 'isBoolean:', isBoolean);
      const baseCompanies = companySample && companySample.length >= 10 ? companySample : [...this.companies];
      const shuffled = [...baseCompanies].sort(() => 0.5 - Math.random());
      const sample = shuffled.slice(0, 10);
      const qualifiedCompanies = sample.slice(0, 3);
      const qualifiedIds = new Set(qualifiedCompanies.map(c => c.id));
      const needsReviewCompanies = sample.filter(c => !qualifiedIds.has(c.id)).slice(0, 2);
      const needsReviewIds = new Set([...Array.from(qualifiedIds), ...needsReviewCompanies.map(c => c.id)]);
      const unqualifiedCompanies = sample.filter(c => !needsReviewIds.has(c.id)).slice(0, 5);
      if (isPicklist || isBoolean) {
        const qualifiedVariations = this.DATA_HIRING_QUALIFIED_VARIATIONS;
        const unqualifiedVariations = this.DATA_HIRING_UNQUALIFIED_VARIATIONS;
        const needsReviewVariations = this.DATA_HIRING_NEEDS_REVIEW_VARIATIONS;
        console.log('[DATA-HIRING] Using variations for Picklist/Boolean:', {
          qualifiedVariations,
          unqualifiedVariations,
          needsReviewVariations
        });
        const qualifiedResults = qualifiedCompanies.map((company, idx) => {
          const template = qualifiedVariations[idx % qualifiedVariations.length];
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
            whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
            confidence: 0.92,
            confidenceScore: 92,
            researchDate: new Date().toISOString(),
            agentId,
            agentName: agent?.title || '',
            industry: company.industry,
            employeeCount: company.employeeCount,
            hqCountry: company.hqCountry,
            hqState: company.hqState,
            hqCity: company.hqCity,
            website: company.website,
            totalFunding: company.totalFunding,
            estimatedAnnualRevenue: company.estimatedAnnualRevenue,
            yearFounded: company.yearFounded,
            dataSources: ['LinkedIn Jobs', 'Company Website'],
            selectedOptions: template.selectedOptions,
            questionType: agent?.questionType || 'Picklist',
            researchResults: {
              summary: template.researchSummary.replace('[COMPANY]', company.companyName),
              sources: ['LinkedIn Jobs', 'Company Website']
            },
            assignedPersonas: []
          };
        });
        const needsReviewResults = needsReviewCompanies.map((company, idx) => {
          const template = needsReviewVariations[idx % needsReviewVariations.length];
          const evidence = template.evidenceTemplates.map(et => ({
            type: 'job_posting',
            title: et,
            description: et,
            confidence: 0.8,
            source: 'LinkedIn Jobs'
          }));
          return {
            companyId: company.id,
            companyName: company.companyName,
            qualified: false,
            needsReview: true,
            evidence,
            researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
            whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
            confidence: 0.8,
            confidenceScore: 80,
            researchDate: new Date().toISOString(),
            agentId,
            agentName: agent?.title || '',
            industry: company.industry,
            employeeCount: company.employeeCount,
            hqCountry: company.hqCountry,
            hqState: company.hqState,
            hqCity: company.hqCity,
            website: company.website,
            totalFunding: company.totalFunding,
            estimatedAnnualRevenue: company.estimatedAnnualRevenue,
            yearFounded: company.yearFounded,
            dataSources: ['LinkedIn Jobs', 'Company Website'],
            selectedOptions: template.selectedOptions,
            questionType: agent?.questionType || 'Picklist',
            researchResults: {
              summary: template.researchSummary.replace('[COMPANY]', company.companyName),
              sources: ['LinkedIn Jobs', 'Company Website']
            },
            assignedPersonas: []
          };
        });
        const unqualifiedResults = unqualifiedCompanies.map((company, idx) => {
          const template = unqualifiedVariations[idx % unqualifiedVariations.length];
          const evidence = template.evidenceTemplates.map(et => ({
            type: 'job_posting',
            title: et,
            description: et,
            confidence: 0.7,
            source: 'LinkedIn Jobs'
          }));
          return {
            companyId: company.id,
            companyName: company.companyName,
            qualified: false,
            evidence,
            researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
            whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
            confidence: 0.7,
            confidenceScore: 70,
            researchDate: new Date().toISOString(),
            agentId,
            agentName: agent?.title || '',
            industry: company.industry,
            employeeCount: company.employeeCount,
            hqCountry: company.hqCountry,
            hqState: company.hqState,
            hqCity: company.hqCity,
            website: company.website,
            totalFunding: company.totalFunding,
            estimatedAnnualRevenue: company.estimatedAnnualRevenue,
            yearFounded: company.yearFounded,
            dataSources: ['LinkedIn Jobs', 'Company Website'],
            selectedOptions: template.selectedOptions,
            questionType: agent?.questionType || 'Picklist',
            researchResults: {
              summary: template.researchSummary.replace('[COMPANY]', company.companyName),
              sources: ['LinkedIn Jobs', 'Company Website']
            },
            assignedPersonas: []
          };
        });
        return [...qualifiedResults, ...needsReviewResults, ...unqualifiedResults];
      }
    }

    // --- TECH STACK AGENT LOGIC ---
    if (agentId === 'tech-stack') {
      const agent = this.agents.find(a => a.id === agentId);
      const isPicklist = agent?.questionType === 'Picklist';
      const baseCompanies = companySample && companySample.length >= 10 ? companySample : [...this.companies];
      const shuffled = [...baseCompanies].sort(() => 0.5 - Math.random());
      const sample = shuffled.slice(0, 10);
      const qualifiedCompanies = sample.slice(0, 3);
      const qualifiedIds = new Set(qualifiedCompanies.map(c => c.id));
      const needsReviewCompanies = sample.filter(c => !qualifiedIds.has(c.id)).slice(0, 2);
      const needsReviewIds = new Set([...Array.from(qualifiedIds), ...needsReviewCompanies.map(c => c.id)]);
      const unqualifiedCompanies = sample.filter(c => !needsReviewIds.has(c.id)).slice(0, 5);
      const qualifiedResults = qualifiedCompanies.map((company, idx) => {
        const template = this.TECH_STACK_QUALIFIED_VARIATIONS[idx % this.TECH_STACK_QUALIFIED_VARIATIONS.length];
        const evidence = template.evidenceTemplates.map(et => ({
          type: 'job_posting',
          title: et,
          description: et,
          confidence: 0.92,
          source: 'Job Posting'
        }));
        return {
          companyId: company.id,
          companyName: company.companyName,
          qualified: true,
          evidence,
          researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
          whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
          confidence: 0.92,
          confidenceScore: 92,
          researchDate: new Date().toISOString(),
          agentId,
          agentName: agent?.title || '',
          industry: company.industry,
          employeeCount: company.employeeCount,
          hqCountry: company.hqCountry,
          hqState: company.hqState,
          hqCity: company.hqCity,
          website: company.website,
          totalFunding: company.totalFunding,
          estimatedAnnualRevenue: company.estimatedAnnualRevenue,
          yearFounded: company.yearFounded,
          dataSources: ['Job Posting', 'Company Blog'],
          selectedOptions: template.selectedOptions,
          questionType: agent?.questionType || 'Picklist',
          researchResults: {
            summary: template.researchSummary.replace('[COMPANY]', company.companyName),
            sources: ['Job Posting', 'Company Blog']
          },
          assignedPersonas: []
        };
      });
      const needsReviewResults = needsReviewCompanies.map((company, idx) => {
        const template = this.TECH_STACK_NEEDS_REVIEW_VARIATIONS[idx % this.TECH_STACK_NEEDS_REVIEW_VARIATIONS.length];
        const evidence = template.evidenceTemplates.map(et => ({
          type: 'job_posting',
          title: et,
          description: et,
          confidence: 0.8,
          source: 'Job Posting'
        }));
        return {
          companyId: company.id,
          companyName: company.companyName,
          qualified: false,
          needsReview: true,
          evidence,
          researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
          whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
          confidence: 0.8,
          confidenceScore: 80,
          researchDate: new Date().toISOString(),
          agentId,
          agentName: agent?.title || '',
          industry: company.industry,
          employeeCount: company.employeeCount,
          hqCountry: company.hqCountry,
          hqState: company.hqState,
          hqCity: company.hqCity,
          website: company.website,
          totalFunding: company.totalFunding,
          estimatedAnnualRevenue: company.estimatedAnnualRevenue,
          yearFounded: company.yearFounded,
          dataSources: ['Job Posting', 'Company Blog'],
          selectedOptions: template.selectedOptions,
          questionType: agent?.questionType || 'Picklist',
          researchResults: {
            summary: template.researchSummary.replace('[COMPANY]', company.companyName),
            sources: ['Job Posting', 'Company Blog']
          },
          assignedPersonas: []
        };
      });
      const unqualifiedResults = unqualifiedCompanies.map((company, idx) => {
        const template = this.TECH_STACK_UNQUALIFIED_VARIATIONS[idx % this.TECH_STACK_UNQUALIFIED_VARIATIONS.length];
        const evidence = template.evidenceTemplates.map(et => ({
          type: 'job_posting',
          title: et,
          description: et,
          confidence: 0.7,
          source: 'Job Posting'
        }));
        return {
          companyId: company.id,
          companyName: company.companyName,
          qualified: false,
          evidence,
          researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
          whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
          confidence: 0.7,
          confidenceScore: 70,
          researchDate: new Date().toISOString(),
          agentId,
          agentName: agent?.title || '',
          industry: company.industry,
          employeeCount: company.employeeCount,
          hqCountry: company.hqCountry,
          hqState: company.hqState,
          hqCity: company.hqCity,
          website: company.website,
          totalFunding: company.totalFunding,
          estimatedAnnualRevenue: company.estimatedAnnualRevenue,
          yearFounded: company.yearFounded,
          dataSources: ['Job Posting', 'Company Blog'],
          selectedOptions: template.selectedOptions,
          questionType: agent?.questionType || 'Picklist',
          researchResults: {
            summary: template.researchSummary.replace('[COMPANY]', company.companyName),
            sources: ['Job Posting', 'Company Blog']
          },
          assignedPersonas: []
        };
      });
      return [...qualifiedResults, ...needsReviewResults, ...unqualifiedResults];
    }

    // --- NEWS FUNDING AGENT LOGIC ---
    if (agentId === 'news-funding') {
      const agent = this.agents.find(a => a.id === agentId);
      const isPicklist = agent?.questionType === 'Picklist';
      const isBoolean = agent?.questionType === 'Boolean';
      const baseCompanies = companySample && companySample.length >= 10 ? companySample : [...this.companies];
      const shuffled = [...baseCompanies].sort(() => 0.5 - Math.random());
      const sample = shuffled.slice(0, 10);
      const qualifiedCompanies = sample.slice(0, 3);
      const qualifiedIds = new Set(qualifiedCompanies.map(c => c.id));
      const needsReviewCompanies = sample.filter(c => !qualifiedIds.has(c.id)).slice(0, 2);
      const needsReviewIds = new Set([...Array.from(qualifiedIds), ...needsReviewCompanies.map(c => c.id)]);
      const unqualifiedCompanies = sample.filter(c => !needsReviewIds.has(c.id)).slice(0, 5);
      if (isPicklist || isBoolean) {
        const qualifiedVariations = this.NEWS_FUNDING_QUALIFIED_VARIATIONS;
        const unqualifiedVariations = this.NEWS_FUNDING_UNQUALIFIED_VARIATIONS;
        const needsReviewVariations = this.NEWS_FUNDING_NEEDS_REVIEW_VARIATIONS;
        const qualifiedResults = qualifiedCompanies.map((company, idx) => {
          const template = qualifiedVariations[idx % qualifiedVariations.length];
          const evidence = template.evidenceTemplates.map(et => ({
            type: 'news',
            title: et,
            description: et,
            confidence: 0.92,
            source: 'Press Release'
          }));
          return {
            companyId: company.id,
            companyName: company.companyName,
            qualified: true,
            evidence,
            researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
            whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
            confidence: 0.92,
            confidenceScore: 92,
            researchDate: new Date().toISOString(),
            agentId,
            agentName: agent?.title || '',
            industry: company.industry,
            employeeCount: company.employeeCount,
            hqCountry: company.hqCountry,
            hqState: company.hqState,
            hqCity: company.hqCity,
            website: company.website,
            totalFunding: company.totalFunding,
            estimatedAnnualRevenue: company.estimatedAnnualRevenue,
            yearFounded: company.yearFounded,
            dataSources: ['Press Release', 'TechCrunch', 'Investor Relations'],
            selectedOptions: template.selectedOptions,
            questionType: agent?.questionType || 'Picklist',
            researchResults: {
              summary: template.researchSummary.replace('[COMPANY]', company.companyName),
              sources: ['Press Release', 'TechCrunch', 'Investor Relations']
            },
            assignedPersonas: []
          };
        });
        const needsReviewResults = needsReviewCompanies.map((company, idx) => {
          const template = needsReviewVariations[idx % needsReviewVariations.length];
          const evidence = template.evidenceTemplates.map(et => ({
            type: 'news',
            title: et,
            description: et,
            confidence: 0.8,
            source: 'Press Release'
          }));
          return {
            companyId: company.id,
            companyName: company.companyName,
            qualified: false,
            needsReview: true,
            evidence,
            researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
            whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
            confidence: 0.8,
            confidenceScore: 80,
            researchDate: new Date().toISOString(),
            agentId,
            agentName: agent?.title || '',
            industry: company.industry,
            employeeCount: company.employeeCount,
            hqCountry: company.hqCountry,
            hqState: company.hqState,
            hqCity: company.hqCity,
            website: company.website,
            totalFunding: company.totalFunding,
            estimatedAnnualRevenue: company.estimatedAnnualRevenue,
            yearFounded: company.yearFounded,
            dataSources: ['Press Release', 'TechCrunch', 'Investor Relations'],
            selectedOptions: template.selectedOptions,
            questionType: agent?.questionType || 'Picklist',
            researchResults: {
              summary: template.researchSummary.replace('[COMPANY]', company.companyName),
              sources: ['Press Release', 'TechCrunch', 'Investor Relations']
            },
            assignedPersonas: []
          };
        });
        const unqualifiedResults = unqualifiedCompanies.map((company, idx) => {
          const template = unqualifiedVariations[idx % unqualifiedVariations.length];
          const evidence = template.evidenceTemplates.map(et => ({
            type: 'news',
            title: et,
            description: et,
            confidence: 0.7,
            source: 'Press Release'
          }));
          return {
            companyId: company.id,
            companyName: company.companyName,
            qualified: false,
            evidence,
            researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
            whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
            confidence: 0.7,
            confidenceScore: 70,
            researchDate: new Date().toISOString(),
            agentId,
            agentName: agent?.title || '',
            industry: company.industry,
            employeeCount: company.employeeCount,
            hqCountry: company.hqCountry,
            hqState: company.hqState,
            hqCity: company.hqCity,
            website: company.website,
            totalFunding: company.totalFunding,
            estimatedAnnualRevenue: company.estimatedAnnualRevenue,
            yearFounded: company.yearFounded,
            dataSources: ['Press Release', 'TechCrunch', 'Investor Relations'],
            selectedOptions: template.selectedOptions,
            questionType: agent?.questionType || 'Picklist',
            researchResults: {
              summary: template.researchSummary.replace('[COMPANY]', company.companyName),
              sources: ['Press Release', 'TechCrunch', 'Investor Relations']
            },
            assignedPersonas: []
          };
        });
        return [...qualifiedResults, ...needsReviewResults, ...unqualifiedResults];
      }
    }

    // --- NEWS MA AGENT LOGIC ---
    if (agentId === 'news-ma') {
      const agent = this.agents.find(a => a.id === agentId);
      const isPicklist = agent?.questionType === 'Picklist';
      const isBoolean = agent?.questionType === 'Boolean';
      const baseCompanies = companySample && companySample.length >= 10 ? companySample : [...this.companies];
      const shuffled = [...baseCompanies].sort(() => 0.5 - Math.random());
      const sample = shuffled.slice(0, 10);
      const qualifiedCompanies = sample.slice(0, 3);
      const qualifiedIds = new Set(qualifiedCompanies.map(c => c.id));
      const needsReviewCompanies = sample.filter(c => !qualifiedIds.has(c.id)).slice(0, 2);
      const needsReviewIds = new Set([...Array.from(qualifiedIds), ...needsReviewCompanies.map(c => c.id)]);
      const unqualifiedCompanies = sample.filter(c => !needsReviewIds.has(c.id)).slice(0, 5);
      if (isPicklist || isBoolean) {
        const qualifiedVariations = this.NEWS_MA_QUALIFIED_VARIATIONS;
        const unqualifiedVariations = this.NEWS_MA_UNQUALIFIED_VARIATIONS;
        const needsReviewVariations = this.NEWS_MA_NEEDS_REVIEW_VARIATIONS;
        const qualifiedResults = qualifiedCompanies.map((company, idx) => {
          const template = qualifiedVariations[idx % qualifiedVariations.length];
          const evidence = template.evidenceTemplates.map(et => ({
            type: 'news',
            title: et,
            description: et,
            confidence: 0.92,
            source: 'Press Release'
          }));
          return {
            companyId: company.id,
            companyName: company.companyName,
            qualified: true,
            evidence,
            researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
            whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
            confidence: 0.92,
            confidenceScore: 92,
            researchDate: new Date().toISOString(),
            agentId,
            agentName: agent?.title || '',
            industry: company.industry,
            employeeCount: company.employeeCount,
            hqCountry: company.hqCountry,
            hqState: company.hqState,
            hqCity: company.hqCity,
            website: company.website,
            totalFunding: company.totalFunding,
            estimatedAnnualRevenue: company.estimatedAnnualRevenue,
            yearFounded: company.yearFounded,
            dataSources: ['Press Release', 'Business News', 'SEC Filing'],
            selectedOptions: template.selectedOptions,
            questionType: agent?.questionType || 'Picklist',
            researchResults: {
              summary: template.researchSummary.replace('[COMPANY]', company.companyName),
              sources: ['Press Release', 'Business News', 'SEC Filing']
            },
            assignedPersonas: []
          };
        });
        const needsReviewResults = needsReviewCompanies.map((company, idx) => {
          const template = needsReviewVariations[idx % needsReviewVariations.length];
          const evidence = template.evidenceTemplates.map(et => ({
            type: 'news',
            title: et,
            description: et,
            confidence: 0.8,
            source: 'Press Release'
          }));
          return {
            companyId: company.id,
            companyName: company.companyName,
            qualified: false,
            needsReview: true,
            evidence,
            researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
            whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
            confidence: 0.8,
            confidenceScore: 80,
            researchDate: new Date().toISOString(),
            agentId,
            agentName: agent?.title || '',
            industry: company.industry,
            employeeCount: company.employeeCount,
            hqCountry: company.hqCountry,
            hqState: company.hqState,
            hqCity: company.hqCity,
            website: company.website,
            totalFunding: company.totalFunding,
            estimatedAnnualRevenue: company.estimatedAnnualRevenue,
            yearFounded: company.yearFounded,
            dataSources: ['Press Release', 'Business News', 'SEC Filing'],
            selectedOptions: template.selectedOptions,
            questionType: agent?.questionType || 'Picklist',
            researchResults: {
              summary: template.researchSummary.replace('[COMPANY]', company.companyName),
              sources: ['Press Release', 'Business News', 'SEC Filing']
            },
            assignedPersonas: []
          };
        });
        const unqualifiedResults = unqualifiedCompanies.map((company, idx) => {
          const template = unqualifiedVariations[idx % unqualifiedVariations.length];
          const evidence = template.evidenceTemplates.map(et => ({
            type: 'news',
            title: et,
            description: et,
            confidence: 0.7,
            source: 'Press Release'
          }));
          return {
            companyId: company.id,
            companyName: company.companyName,
            qualified: false,
            evidence,
            researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
            whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
            confidence: 0.7,
            confidenceScore: 70,
            researchDate: new Date().toISOString(),
            agentId,
            agentName: agent?.title || '',
            industry: company.industry,
            employeeCount: company.employeeCount,
            hqCountry: company.hqCountry,
            hqState: company.hqState,
            hqCity: company.hqCity,
            website: company.website,
            totalFunding: company.totalFunding,
            estimatedAnnualRevenue: company.estimatedAnnualRevenue,
            yearFounded: company.yearFounded,
            dataSources: ['Press Release', 'Business News', 'SEC Filing'],
            selectedOptions: template.selectedOptions,
            questionType: agent?.questionType || 'Picklist',
            researchResults: {
              summary: template.researchSummary.replace('[COMPANY]', company.companyName),
              sources: ['Press Release', 'Business News', 'SEC Filing']
            },
            assignedPersonas: []
          };
        });
        return [...qualifiedResults, ...needsReviewResults, ...unqualifiedResults];
      }
    }

    // --- NEWS EXPANSION AGENT LOGIC ---
    if (agentId === 'news-expansion') {
      const agent = this.agents.find(a => a.id === agentId);
      const isPicklist = agent?.questionType === 'Picklist';
      const isBoolean = agent?.questionType === 'Boolean';
      const baseCompanies = companySample && companySample.length >= 10 ? companySample : [...this.companies];
      const shuffled = [...baseCompanies].sort(() => 0.5 - Math.random());
      const sample = shuffled.slice(0, 10);
      const qualifiedCompanies = sample.slice(0, 3);
      const qualifiedIds = new Set(qualifiedCompanies.map(c => c.id));
      const needsReviewCompanies = sample.filter(c => !qualifiedIds.has(c.id)).slice(0, 2);
      const needsReviewIds = new Set([...Array.from(qualifiedIds), ...needsReviewCompanies.map(c => c.id)]);
      const unqualifiedCompanies = sample.filter(c => !needsReviewIds.has(c.id)).slice(0, 5);
      if (isPicklist || isBoolean) {
        const qualifiedVariations = this.NEWS_EXPANSION_QUALIFIED_VARIATIONS;
        const unqualifiedVariations = this.NEWS_EXPANSION_UNQUALIFIED_VARIATIONS;
        const needsReviewVariations = this.NEWS_EXPANSION_NEEDS_REVIEW_VARIATIONS;
        const qualifiedResults = qualifiedCompanies.map((company, idx) => {
          const template = qualifiedVariations[idx % qualifiedVariations.length];
          const evidence = template.evidenceTemplates.map(et => ({
            type: 'news',
            title: et,
            description: et,
            confidence: 0.92,
            source: 'Press Release'
          }));
          return {
            companyId: company.id,
            companyName: company.companyName,
            qualified: true,
            evidence,
            researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
            whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
            confidence: 0.92,
            confidenceScore: 92,
            researchDate: new Date().toISOString(),
            agentId,
            agentName: agent?.title || '',
            industry: company.industry,
            employeeCount: company.employeeCount,
            hqCountry: company.hqCountry,
            hqState: company.hqState,
            hqCity: company.hqCity,
            website: company.website,
            totalFunding: company.totalFunding,
            estimatedAnnualRevenue: company.estimatedAnnualRevenue,
            yearFounded: company.yearFounded,
            dataSources: ['Press Release', 'Job Posting', 'Company Update'],
            selectedOptions: template.selectedOptions,
            questionType: agent?.questionType || 'Picklist',
            researchResults: {
              summary: template.researchSummary.replace('[COMPANY]', company.companyName),
              sources: ['Press Release', 'Job Posting', 'Company Update']
            },
            assignedPersonas: []
          };
        });
        const needsReviewResults = needsReviewCompanies.map((company, idx) => {
          const template = needsReviewVariations[idx % needsReviewVariations.length];
          const evidence = template.evidenceTemplates.map(et => ({
            type: 'news',
            title: et,
            description: et,
            confidence: 0.8,
            source: 'Press Release'
          }));
          return {
            companyId: company.id,
            companyName: company.companyName,
            qualified: false,
            needsReview: true,
            evidence,
            researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
            whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
            confidence: 0.8,
            confidenceScore: 80,
            researchDate: new Date().toISOString(),
            agentId,
            agentName: agent?.title || '',
            industry: company.industry,
            employeeCount: company.employeeCount,
            hqCountry: company.hqCountry,
            hqState: company.hqState,
            hqCity: company.hqCity,
            website: company.website,
            totalFunding: company.totalFunding,
            estimatedAnnualRevenue: company.estimatedAnnualRevenue,
            yearFounded: company.yearFounded,
            dataSources: ['Press Release', 'Job Posting', 'Company Update'],
            selectedOptions: template.selectedOptions,
            questionType: agent?.questionType || 'Picklist',
            researchResults: {
              summary: template.researchSummary.replace('[COMPANY]', company.companyName),
              sources: ['Press Release', 'Job Posting', 'Company Update']
            },
            assignedPersonas: []
          };
        });
        const unqualifiedResults = unqualifiedCompanies.map((company, idx) => {
          const template = unqualifiedVariations[idx % unqualifiedVariations.length];
          const evidence = template.evidenceTemplates.map(et => ({
            type: 'news',
            title: et,
            description: et,
            confidence: 0.7,
            source: 'Press Release'
          }));
          return {
            companyId: company.id,
            companyName: company.companyName,
            qualified: false,
            evidence,
            researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
            whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
            confidence: 0.7,
            confidenceScore: 70,
            researchDate: new Date().toISOString(),
            agentId,
            agentName: agent?.title || '',
            industry: company.industry,
            employeeCount: company.employeeCount,
            hqCountry: company.hqCountry,
            hqState: company.hqState,
            hqCity: company.hqCity,
            website: company.website,
            totalFunding: company.totalFunding,
            estimatedAnnualRevenue: company.estimatedAnnualRevenue,
            yearFounded: company.yearFounded,
            dataSources: ['Press Release', 'Job Posting', 'Company Update'],
            selectedOptions: template.selectedOptions,
            questionType: agent?.questionType || 'Picklist',
            researchResults: {
              summary: template.researchSummary.replace('[COMPANY]', company.companyName),
              sources: ['Press Release', 'Job Posting', 'Company Update']
            },
            assignedPersonas: []
          };
        });
        return [...qualifiedResults, ...needsReviewResults, ...unqualifiedResults];
      }
    }

    // --- NEWS ANNOUNCEMENTS AGENT LOGIC ---
    if (agentId === 'news-announcements') {
      const agent = this.agents.find(a => a.id === agentId);
      const isPicklist = agent?.questionType === 'Picklist';
      const isBoolean = agent?.questionType === 'Boolean';
      const baseCompanies = companySample && companySample.length >= 10 ? companySample : [...this.companies];
      const shuffled = [...baseCompanies].sort(() => 0.5 - Math.random());
      const sample = shuffled.slice(0, 10);
      const qualifiedCompanies = sample.slice(0, 3);
      const qualifiedIds = new Set(qualifiedCompanies.map(c => c.id));
      const needsReviewCompanies = sample.filter(c => !qualifiedIds.has(c.id)).slice(0, 2);
      const needsReviewIds = new Set([...Array.from(qualifiedIds), ...needsReviewCompanies.map(c => c.id)]);
      const unqualifiedCompanies = sample.filter(c => !needsReviewIds.has(c.id)).slice(0, 5);
      if (isPicklist || isBoolean) {
        const qualifiedVariations = this.NEWS_ANNOUNCEMENTS_QUALIFIED_VARIATIONS;
        const unqualifiedVariations = this.NEWS_ANNOUNCEMENTS_UNQUALIFIED_VARIATIONS;
        const needsReviewVariations = this.NEWS_ANNOUNCEMENTS_NEEDS_REVIEW_VARIATIONS;
        const qualifiedResults = qualifiedCompanies.map((company, idx) => {
          const template = qualifiedVariations[idx % qualifiedVariations.length];
          const evidence = template.evidenceTemplates.map(et => ({
            type: 'news',
            title: et,
            description: et,
            confidence: 0.92,
            source: 'Press Release'
          }));
          return {
            companyId: company.id,
            companyName: company.companyName,
            qualified: true,
            evidence,
            researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
            whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
            confidence: 0.92,
            confidenceScore: 92,
            researchDate: new Date().toISOString(),
            agentId,
            agentName: agent?.title || '',
            industry: company.industry,
            employeeCount: company.employeeCount,
            hqCountry: company.hqCountry,
            hqState: company.hqState,
            hqCity: company.hqCity,
            website: company.website,
            totalFunding: company.totalFunding,
            estimatedAnnualRevenue: company.estimatedAnnualRevenue,
            yearFounded: company.yearFounded,
            dataSources: ['Press Release', 'Company Blog', 'Industry Publication'],
            selectedOptions: template.selectedOptions,
            questionType: agent?.questionType || 'Picklist',
            researchResults: {
              summary: template.researchSummary.replace('[COMPANY]', company.companyName),
              sources: ['Press Release', 'Company Blog', 'Industry Publication']
            },
            assignedPersonas: []
          };
        });
        const needsReviewResults = needsReviewCompanies.map((company, idx) => {
          const template = needsReviewVariations[idx % needsReviewVariations.length];
          const evidence = template.evidenceTemplates.map(et => ({
            type: 'news',
            title: et,
            description: et,
            confidence: 0.8,
            source: 'Press Release'
          }));
          return {
            companyId: company.id,
            companyName: company.companyName,
            qualified: false,
            needsReview: true,
            evidence,
            researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
            whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
            confidence: 0.8,
            confidenceScore: 80,
            researchDate: new Date().toISOString(),
            agentId,
            agentName: agent?.title || '',
            industry: company.industry,
            employeeCount: company.employeeCount,
            hqCountry: company.hqCountry,
            hqState: company.hqState,
            hqCity: company.hqCity,
            website: company.website,
            totalFunding: company.totalFunding,
            estimatedAnnualRevenue: company.estimatedAnnualRevenue,
            yearFounded: company.yearFounded,
            dataSources: ['Press Release', 'Company Blog', 'Industry Publication'],
            selectedOptions: template.selectedOptions,
            questionType: agent?.questionType || 'Picklist',
            researchResults: {
              summary: template.researchSummary.replace('[COMPANY]', company.companyName),
              sources: ['Press Release', 'Company Blog', 'Industry Publication']
            },
            assignedPersonas: []
          };
        });
        const unqualifiedResults = unqualifiedCompanies.map((company, idx) => {
          const template = unqualifiedVariations[idx % unqualifiedVariations.length];
          const evidence = template.evidenceTemplates.map(et => ({
            type: 'news',
            title: et,
            description: et,
            confidence: 0.7,
            source: 'Press Release'
          }));
          return {
            companyId: company.id,
            companyName: company.companyName,
            qualified: false,
            evidence,
            researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
            whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
            confidence: 0.7,
            confidenceScore: 70,
            researchDate: new Date().toISOString(),
            agentId,
            agentName: agent?.title || '',
            industry: company.industry,
            employeeCount: company.employeeCount,
            hqCountry: company.hqCountry,
            hqState: company.hqState,
            hqCity: company.hqCity,
            website: company.website,
            totalFunding: company.totalFunding,
            estimatedAnnualRevenue: company.estimatedAnnualRevenue,
            yearFounded: company.yearFounded,
            dataSources: ['Press Release', 'Company Blog', 'Industry Publication'],
            selectedOptions: template.selectedOptions,
            questionType: agent?.questionType || 'Picklist',
            researchResults: {
              summary: template.researchSummary.replace('[COMPANY]', company.companyName),
              sources: ['Press Release', 'Company Blog', 'Industry Publication']
            },
            assignedPersonas: []
          };
        });
        return [...qualifiedResults, ...needsReviewResults, ...unqualifiedResults];
      }
    }

    // --- TECH PRODUCT AGENT LOGIC ---
    if (agentId === 'tech-product') {
      const agent = this.agents.find(a => a.id === agentId);
      const isPicklist = agent?.questionType === 'Picklist';
      const isBoolean = agent?.questionType === 'Boolean';
      const baseCompanies = companySample && companySample.length >= 10 ? companySample : [...this.companies];
      const shuffled = [...baseCompanies].sort(() => 0.5 - Math.random());
      const sample = shuffled.slice(0, 10);
      const qualifiedCompanies = sample.slice(0, 3);
      const qualifiedIds = new Set(qualifiedCompanies.map(c => c.id));
      const needsReviewCompanies = sample.filter(c => !qualifiedIds.has(c.id)).slice(0, 2);
      const needsReviewIds = new Set([...Array.from(qualifiedIds), ...needsReviewCompanies.map(c => c.id)]);
      const unqualifiedCompanies = sample.filter(c => !needsReviewIds.has(c.id)).slice(0, 5);
      if (isPicklist || isBoolean) {
        const qualifiedVariations = this.TECH_PRODUCT_QUALIFIED_VARIATIONS;
        const unqualifiedVariations = this.TECH_PRODUCT_UNQUALIFIED_VARIATIONS;
        const needsReviewVariations = this.TECH_PRODUCT_NEEDS_REVIEW_VARIATIONS;
        const qualifiedResults = qualifiedCompanies.map((company, idx) => {
          const template = qualifiedVariations[idx % qualifiedVariations.length];
          const evidence = template.evidenceTemplates.map(et => ({
            type: 'news',
            title: et,
            description: et,
            confidence: 0.92,
            source: 'Press Release'
          }));
          return {
            companyId: company.id,
            companyName: company.companyName,
            qualified: true,
            evidence,
            researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
            whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
            confidence: 0.92,
            confidenceScore: 92,
            researchDate: new Date().toISOString(),
            agentId,
            agentName: agent?.title || '',
            industry: company.industry,
            employeeCount: company.employeeCount,
            hqCountry: company.hqCountry,
            hqState: company.hqState,
            hqCity: company.hqCity,
            website: company.website,
            totalFunding: company.totalFunding,
            estimatedAnnualRevenue: company.estimatedAnnualRevenue,
            yearFounded: company.yearFounded,
            dataSources: ['Press Release', 'Product Blog', 'Release Notes'],
            selectedOptions: template.selectedOptions,
            questionType: agent?.questionType || 'Picklist',
            researchResults: {
              summary: template.researchSummary.replace('[COMPANY]', company.companyName),
              sources: ['Press Release', 'Product Blog', 'Release Notes']
            },
            assignedPersonas: []
          };
        });
        const needsReviewResults = needsReviewCompanies.map((company, idx) => {
          const template = needsReviewVariations[idx % needsReviewVariations.length];
          const evidence = template.evidenceTemplates.map(et => ({
            type: 'news',
            title: et,
            description: et,
            confidence: 0.8,
            source: 'Press Release'
          }));
          return {
            companyId: company.id,
            companyName: company.companyName,
            qualified: false,
            needsReview: true,
            evidence,
            researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
            whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
            confidence: 0.8,
            confidenceScore: 80,
            researchDate: new Date().toISOString(),
            agentId,
            agentName: agent?.title || '',
            industry: company.industry,
            employeeCount: company.employeeCount,
            hqCountry: company.hqCountry,
            hqState: company.hqState,
            hqCity: company.hqCity,
            website: company.website,
            totalFunding: company.totalFunding,
            estimatedAnnualRevenue: company.estimatedAnnualRevenue,
            yearFounded: company.yearFounded,
            dataSources: ['Press Release', 'Product Blog', 'Release Notes'],
            selectedOptions: template.selectedOptions,
            questionType: agent?.questionType || 'Picklist',
            researchResults: {
              summary: template.researchSummary.replace('[COMPANY]', company.companyName),
              sources: ['Press Release', 'Product Blog', 'Release Notes']
            },
            assignedPersonas: []
          };
        });
        const unqualifiedResults = unqualifiedCompanies.map((company, idx) => {
          const template = unqualifiedVariations[idx % unqualifiedVariations.length];
          const evidence = template.evidenceTemplates.map(et => ({
            type: 'news',
            title: et,
            description: et,
            confidence: 0.7,
            source: 'Press Release'
          }));
          return {
            companyId: company.id,
            companyName: company.companyName,
            qualified: false,
            evidence,
            researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
            whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
            confidence: 0.7,
            confidenceScore: 70,
            researchDate: new Date().toISOString(),
            agentId,
            agentName: agent?.title || '',
            industry: company.industry,
            employeeCount: company.employeeCount,
            hqCountry: company.hqCountry,
            hqState: company.hqState,
            hqCity: company.hqCity,
            website: company.website,
            totalFunding: company.totalFunding,
            estimatedAnnualRevenue: company.estimatedAnnualRevenue,
            yearFounded: company.yearFounded,
            dataSources: ['Press Release', 'Product Blog', 'Release Notes'],
            selectedOptions: template.selectedOptions,
            questionType: agent?.questionType || 'Picklist',
            researchResults: {
              summary: template.researchSummary.replace('[COMPANY]', company.companyName),
              sources: ['Press Release', 'Product Blog', 'Release Notes']
            },
            assignedPersonas: []
          };
        });
        return [...qualifiedResults, ...needsReviewResults, ...unqualifiedResults];
      }
    }

    // --- TECH MIGRATION AGENT LOGIC ---
    if (agentId === 'tech-migration') {
      const agent = this.agents.find(a => a.id === agentId);
      const isPicklist = agent?.questionType === 'Picklist';
      const isBoolean = agent?.questionType === 'Boolean';
      const baseCompanies = companySample && companySample.length >= 10 ? companySample : [...this.companies];
      const shuffled = [...baseCompanies].sort(() => 0.5 - Math.random());
      const sample = shuffled.slice(0, 10);
      const qualifiedCompanies = sample.slice(0, 3);
      const qualifiedIds = new Set(qualifiedCompanies.map(c => c.id));
      const needsReviewCompanies = sample.filter(c => !qualifiedIds.has(c.id)).slice(0, 2);
      const needsReviewIds = new Set([...Array.from(qualifiedIds), ...needsReviewCompanies.map(c => c.id)]);
      const unqualifiedCompanies = sample.filter(c => !needsReviewIds.has(c.id)).slice(0, 5);
      if (isPicklist || isBoolean) {
        const qualifiedVariations = this.TECH_MIGRATION_QUALIFIED_VARIATIONS;
        const unqualifiedVariations = this.TECH_MIGRATION_UNQUALIFIED_VARIATIONS;
        const needsReviewVariations = this.TECH_MIGRATION_NEEDS_REVIEW_VARIATIONS;
        const qualifiedResults = qualifiedCompanies.map((company, idx) => {
          const template = qualifiedVariations[idx % qualifiedVariations.length];
          const evidence = template.evidenceTemplates.map(et => ({
            type: 'news',
            title: et,
            description: et,
            confidence: 0.92,
            source: 'Press Release'
          }));
          return {
            companyId: company.id,
            companyName: company.companyName,
            qualified: true,
            evidence,
            researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
            whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
            confidence: 0.92,
            confidenceScore: 92,
            researchDate: new Date().toISOString(),
            agentId,
            agentName: agent?.title || '',
            industry: company.industry,
            employeeCount: company.employeeCount,
            hqCountry: company.hqCountry,
            hqState: company.hqState,
            hqCity: company.hqCity,
            website: company.website,
            totalFunding: company.totalFunding,
            estimatedAnnualRevenue: company.estimatedAnnualRevenue,
            yearFounded: company.yearFounded,
            dataSources: ['Press Release', 'Engineering Blog', 'Conference Talk'],
            selectedOptions: template.selectedOptions,
            questionType: agent?.questionType || 'Picklist',
            researchResults: {
              summary: template.researchSummary.replace('[COMPANY]', company.companyName),
              sources: ['Press Release', 'Engineering Blog', 'Conference Talk']
            },
            assignedPersonas: []
          };
        });
        const needsReviewResults = needsReviewCompanies.map((company, idx) => {
          const template = needsReviewVariations[idx % needsReviewVariations.length];
          const evidence = template.evidenceTemplates.map(et => ({
            type: 'news',
            title: et,
            description: et,
            confidence: 0.8,
            source: 'Press Release'
          }));
          return {
            companyId: company.id,
            companyName: company.companyName,
            qualified: false,
            needsReview: true,
            evidence,
            researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
            whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
            confidence: 0.8,
            confidenceScore: 80,
            researchDate: new Date().toISOString(),
            agentId,
            agentName: agent?.title || '',
            industry: company.industry,
            employeeCount: company.employeeCount,
            hqCountry: company.hqCountry,
            hqState: company.hqState,
            hqCity: company.hqCity,
            website: company.website,
            totalFunding: company.totalFunding,
            estimatedAnnualRevenue: company.estimatedAnnualRevenue,
            yearFounded: company.yearFounded,
            dataSources: ['Press Release', 'Engineering Blog', 'Conference Talk'],
            selectedOptions: template.selectedOptions,
            questionType: agent?.questionType || 'Picklist',
            researchResults: {
              summary: template.researchSummary.replace('[COMPANY]', company.companyName),
              sources: ['Press Release', 'Engineering Blog', 'Conference Talk']
            },
            assignedPersonas: []
          };
        });
        const unqualifiedResults = unqualifiedCompanies.map((company, idx) => {
          const template = unqualifiedVariations[idx % unqualifiedVariations.length];
          const evidence = template.evidenceTemplates.map(et => ({
            type: 'news',
            title: et,
            description: et,
            confidence: 0.7,
            source: 'Press Release'
          }));
          return {
            companyId: company.id,
            companyName: company.companyName,
            qualified: false,
            evidence,
            researchSummary: template.researchSummary.replace('[COMPANY]', company.companyName),
            whyQualified: template.whyQualified.replace('[COMPANY]', company.companyName),
            confidence: 0.7,
            confidenceScore: 70,
            researchDate: new Date().toISOString(),
            agentId,
            agentName: agent?.title || '',
            industry: company.industry,
            employeeCount: company.employeeCount,
            hqCountry: company.hqCountry,
            hqState: company.hqState,
            hqCity: company.hqCity,
            website: company.website,
            totalFunding: company.totalFunding,
            estimatedAnnualRevenue: company.estimatedAnnualRevenue,
            yearFounded: company.yearFounded,
            dataSources: ['Press Release', 'Engineering Blog', 'Conference Talk'],
            selectedOptions: template.selectedOptions,
            questionType: agent?.questionType || 'Picklist',
            researchResults: {
              summary: template.researchSummary.replace('[COMPANY]', company.companyName),
              sources: ['Press Release', 'Engineering Blog', 'Conference Talk']
            },
            assignedPersonas: []
          };
        });
        return [...qualifiedResults, ...needsReviewResults, ...unqualifiedResults];
      }
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
        dataSources: ['LinkedIn Jobs', 'Company Website'],
        questionType: this.agents.find(a => a.id === agentId)?.questionType || 'Boolean'
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
        dataSources: ['LinkedIn Jobs', 'Company Website'],
        questionType: this.agents.find(a => a.id === agentId)?.questionType || 'Boolean'
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
        'New product launch',
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