import { Company } from '@/hooks/useDataConfig';
import { Persona, Contact } from '@/components/chat/types';

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
      ],
      'Strategic Marketing Executive': [
        'VP of Growth Marketing',
        'Head of Growth',
        'Director of Demand Generation',
        'Senior Marketing Director'
      ],
      'Growth Hacker': [
        'Growth Marketing Manager',
        'Growth Hacker',
        'Digital Marketing Manager',
        'Senior Growth Specialist'
      ],
      'Product Marketing Manager': [
        'Product Marketing Manager',
        'Senior PMM',
        'Head of Product Marketing'
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
    // Generate a match score between 75-98 for more variety
    return Math.floor(Math.random() * (98 - 75 + 1)) + 75;
  }

  public generateContactsForCompany(
    company: Company, 
    assignedPersonas: string[],
    countPerPersona: number = 1,
    companyIndex?: number // Optional: for cycling stories externally
  ): Contact[] {
    const contacts: Contact[] = [];
    // Determine which story to use for this company
    // If companyIndex is not provided, use a random one (for backward compatibility)
    const storyIdx = typeof companyIndex === 'number' ? companyIndex % 3 : Math.floor(Math.random() * 3);

    // Define the three story patterns
    // Story 1: All Not Contacted
    // Story 2: Mix of Awaiting Reply and Not Interested
    // Story 3: Mix of Awaiting Reply, Interested, Demo Booked
    for (let pIdx = 0; pIdx < assignedPersonas.length; pIdx++) {
      const personaName = assignedPersonas[pIdx];
      let personaContacts: Contact[] = [];
      for (let i = 0; i < countPerPersona; i++) {
        const name = this.generateName();
        let status: Contact['status'] = 'Not Contacted';
        let statusDays = 0;
        if (storyIdx === 0) {
          // Story 1: All Not Contacted
          status = 'Not Contacted';
          statusDays = 0;
        } else if (storyIdx === 1) {
          // Story 2: 2/3 Awaiting Reply, 1/3 Not Interested (less frequent)
          if ((pIdx + i) % 3 === 0) {
            status = 'Not Interested';
            statusDays = Math.floor(Math.random() * 4) + 1; // 1-4 days ago
          } else {
            status = 'Awaiting Reply';
            statusDays = Math.floor(Math.random() * 5) + 1; // 1-5 days ago
          }
        } else if (storyIdx === 2) {
          // Story 3: Cycle Awaiting Reply, Interested, Demo Booked
          const mod = (pIdx + i) % 3;
          if (mod === 0) {
            status = 'Awaiting Reply';
            statusDays = Math.floor(Math.random() * 5) + 1;
          } else if (mod === 1) {
            status = 'Interested';
            statusDays = Math.floor(Math.random() * 7) + 1; // 1-7 days ago
          } else {
            status = 'Demo Booked';
            statusDays = Math.floor(Math.random() * 10) + 1; // 1-10 days ago
          }
        }
        const contact: Contact = {
          id: `contact-${Math.random().toString(36).substring(2, 9)}`,
          name,
          title: this.generateTitle(personaName),
          email: this.generateEmail(name, company.companyName),
          linkedin: this.generateLinkedIn(name),
          matchScore: this.calculateMatchScore(),
          status,
          statusDays,
          companyName: company.companyName,
          companyId: company.id,
          personaMatch: personaName,
        };
        personaContacts.push(contact);
      }
      if (personaContacts.length === 0) {
        // Fallback: always at least one contact
        const name = this.generateName();
        personaContacts.push({
          id: `contact-${Math.random().toString(36).substring(2, 9)}`,
          name,
          title: this.generateTitle(personaName),
          email: this.generateEmail(name, company.companyName),
          linkedin: this.generateLinkedIn(name),
          matchScore: this.calculateMatchScore(),
          status: 'Not Contacted',
          statusDays: 0,
          companyName: company.companyName,
          companyId: company.id,
          personaMatch: personaName,
        });
      }
      contacts.push(...personaContacts);
    }
    return contacts;
  }

  public generateContactsForCompanies(companies: Company[], contactsPerCompany: number = 1): Contact[] {
    return companies.flatMap(company => {
      // For this generic method, we can't know the assigned personas.
      // We'll select a few random personas from the available list to generate contacts.
      const personaNames = this.personas.map(p => p.name);
      const contacts = this.generateContactsForCompany(company, personaNames, contactsPerCompany);
      // Guarantee: If for some reason no contacts were generated, fallback to at least one contact for each persona
      if (contacts.length === 0) {
        return personaNames.map(personaName => {
          const name = this.generateName();
          return {
            id: `contact-${Math.random().toString(36).substring(2, 9)}`,
            name,
            title: this.generateTitle(personaName),
            email: this.generateEmail(name, company.companyName),
            linkedin: this.generateLinkedIn(name),
            matchScore: this.calculateMatchScore(),
            status: 'Not Contacted',
            statusDays: 0,
            companyName: company.companyName,
            companyId: company.id,
            personaMatch: personaName,
          };
        });
      }
      return contacts;
    });
  }
} 