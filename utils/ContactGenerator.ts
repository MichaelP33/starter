import { Company } from '@/hooks/useDataConfig';
import { Persona } from '@/components/chat/types';

interface GeneratedContact {
  id: string;
  name: string;
  title: string;
  email: string;
  linkedin: string;
  personaMatch: string;
  matchScore: number;
  companyId: string;
  companyName: string;
}

export class ContactGenerator {
  private companies: Company[];
  private personas: Persona[];
  private firstNamePool: string[];
  private lastNamePool: string[];
  private titleTemplates: Record<string, string[]>;

  constructor(companies: Company[], personas: Persona[]) {
    this.companies = companies;
    this.personas = personas;
    
    // Common first names in tech industry
    this.firstNamePool = [
      'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Quinn',
      'Avery', 'Drew', 'Blake', 'Cameron', 'Dylan', 'Emerson', 'Finley', 'Gray',
      'Harper', 'Indigo', 'Jules', 'Kai', 'Logan', 'Mason', 'Noah', 'Oliver',
      'Parker', 'Quinn', 'Riley', 'Sage', 'Tyler', 'Valentine', 'Winter', 'Xavier'
    ];

    // Common last names in tech industry
    this.lastNamePool = [
      'Anderson', 'Baker', 'Chen', 'Davis', 'Evans', 'Foster', 'Garcia', 'Harris',
      'Ivanov', 'Johnson', 'Kim', 'Lee', 'Martinez', 'Nguyen', 'O\'Brien', 'Patel',
      'Quinn', 'Rodriguez', 'Smith', 'Taylor', 'Upton', 'Vargas', 'Wilson', 'Xu',
      'Young', 'Zhang', 'Adams', 'Brown', 'Clark', 'Edwards', 'Fisher', 'Green'
    ];

    // Title templates by persona type
    this.titleTemplates = {
      'Marketing Leadership': [
        'VP of Marketing',
        'Chief Marketing Officer',
        'Head of Marketing',
        'Marketing Director',
        'Senior Marketing Director'
      ],
      'Marketing Operations': [
        'Marketing Operations Manager',
        'Marketing Technology Director',
        'Marketing Systems Manager',
        'Marketing Automation Lead',
        'Marketing Operations Director'
      ],
      'Growth Marketing': [
        'Growth Marketing Manager',
        'Head of Growth',
        'Growth Marketing Director',
        'Senior Growth Marketing Manager',
        'Growth Marketing Lead'
      ],
      'Data Leadership': [
        'VP of Data',
        'Chief Data Officer',
        'Head of Data',
        'Data Director',
        'Senior Data Director'
      ],
      'Data Engineering': [
        'Data Engineering Manager',
        'Head of Data Engineering',
        'Senior Data Engineer',
        'Data Engineering Lead',
        'Data Platform Manager'
      ],
      'Data Science': [
        'Data Science Manager',
        'Head of Data Science',
        'Senior Data Scientist',
        'Data Science Lead',
        'Machine Learning Manager'
      ]
    };
  }

  private generateName(): string {
    const firstName = this.firstNamePool[Math.floor(Math.random() * this.firstNamePool.length)];
    const lastName = this.lastNamePool[Math.floor(Math.random() * this.lastNamePool.length)];
    return `${firstName} ${lastName}`;
  }

  private generateEmail(name: string, companyName: string): string {
    const [firstName, lastName] = name.toLowerCase().split(' ');
    const companyDomain = companyName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/\s+/g, '');
    
    // Common email patterns
    const patterns = [
      `${firstName}.${lastName}@${companyDomain}.com`,
      `${firstName[0]}${lastName}@${companyDomain}.com`,
      `${firstName}@${companyDomain}.com`,
      `${lastName}.${firstName}@${companyDomain}.com`
    ];
    
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  private generateLinkedIn(name: string): string {
    const [firstName, lastName] = name.toLowerCase().split(' ');
    return `https://linkedin.com/in/${firstName}-${lastName}-${Math.random().toString(36).substring(2, 8)}`;
  }

  private generateTitle(personaName: string): string {
    const templates = this.titleTemplates[personaName] || this.titleTemplates['Marketing Leadership'];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private calculateMatchScore(): number {
    // Generate a match score between 85-95
    return Math.floor(Math.random() * 11) + 85;
  }

  public generateContactsForCompany(company: Company, count: number = 1): GeneratedContact[] {
    const contacts: GeneratedContact[] = [];
    
    // Select random personas for this company
    const selectedPersonas = this.personas
      .sort(() => Math.random() - 0.5)
      .slice(0, count);

    for (const persona of selectedPersonas) {
      const name = this.generateName();
      const contact: GeneratedContact = {
        id: `contact-${Math.random().toString(36).substring(2, 9)}`,
        name,
        title: this.generateTitle(persona.name),
        email: this.generateEmail(name, company.companyName),
        linkedin: this.generateLinkedIn(name),
        personaMatch: persona.name,
        matchScore: this.calculateMatchScore(),
        companyId: company.id,
        companyName: company.companyName
      };
      
      contacts.push(contact);
    }

    return contacts;
  }

  public generateContactsForCompanies(companies: Company[], contactsPerCompany: number = 1): GeneratedContact[] {
    return companies.flatMap(company => 
      this.generateContactsForCompany(company, contactsPerCompany)
    );
  }
} 