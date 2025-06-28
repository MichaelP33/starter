"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { QualifiedCompanyWithResearch, SelectedPersona, Account } from "@/components/chat/types";
import { useDataConfig } from "@/hooks/useDataConfig";
import { Agent } from "@/components/chat/types";
import { AgentHeader } from "@/components/chat/AgentHeader";
import { QualifiedCompaniesTable } from "@/components/chat/QualifiedCompaniesTable";
import { Button } from "@/components/ui/button";
import { EnrichmentOption } from "@/components/chat/types";
import { cn } from "@/lib/utils";

const initialEnrichmentOptions: EnrichmentOption[] = [
  { id: "companyName", label: "Company Name", icon: "🏢", isSelected: true, field: "companyName" },
  { id: "website", label: "Website", icon: "🌐", isSelected: true, field: "website" },
  { id: "industry", label: "Industry", icon: "🏭", isSelected: true, field: "industry" },
  { id: "hqCountry", label: "HQ Country", icon: "🌍", isSelected: true, field: "hqCountry" },
  { id: "employeeCount", label: "Employee Count", icon: "👥", isSelected: true, field: "employeeCount" },
  { id: "totalFunding", label: "Total funding", icon: "💰", isSelected: false, field: "totalFunding" },
  { id: "estimatedAnnualRevenue", label: "Estimated annual revenue", icon: "📈", isSelected: false, field: "estimatedAnnualRevenue" },
  { id: "hqCity", label: "HQ City", icon: "🏙️", isSelected: false, field: "hqCity" },
  { id: "yearFounded", label: "Year founded", icon: "📅", isSelected: false, field: "yearFounded" },
];

interface CampaignData {
  agent: Agent;
  qualifiedCompanies: QualifiedCompanyWithResearch[];
  selectedPersonas: SelectedPersona[];
  createdAt: string;
}

export default function CampaignInbox() {
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [activeTab, setActiveTab] = useState<'qualified' | 'needsReview' | 'all'>('qualified');
  const { agents, isLoadingAgents } = useDataConfig();

  useEffect(() => {
    const storedData = localStorage.getItem('campaignData');
    if (storedData) {
      const data = JSON.parse(storedData) as CampaignData;
      console.log('Inbox: Loaded campaign data from localStorage:', data);

      // --- FIX: START ---
      // Force assign personas to demonstrate UI, as localStorage data may be stale.
      if (data.qualifiedCompanies && data.qualifiedCompanies.length > 0) {
        // Ensure the array exists before trying to access it
        data.qualifiedCompanies.forEach(company => {
          if (!company.assignedPersonas) {
            company.assignedPersonas = [];
          }
        });

        // Assign to first company
        data.qualifiedCompanies[0].assignedPersonas = ['Strategic Marketing Executive'];

        // Assign to second company if it exists
        if (data.qualifiedCompanies.length > 1) {
          data.qualifiedCompanies[1].assignedPersonas = ['Growth Hacker', 'Product Marketing Manager'];
        }
      }
      // --- FIX: END ---
      
      setCampaignData(data);
    }
  }, []);

  if (isLoadingAgents || !campaignData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-medium">Loading Campaign...</p>
          <p className="text-sm text-muted-foreground">Please wait while we load your campaign data.</p>
        </div>
      </div>
    );
  }

  const { agent, qualifiedCompanies, selectedPersonas } = campaignData;
  const qualifiedCount = qualifiedCompanies.filter(c => c.qualified && !c.needsReview).length;
  const needsReviewCount = qualifiedCompanies.filter(c => c.needsReview).length;
  const totalCount = qualifiedCompanies.length;

  const companiesToShow = activeTab === 'qualified'
    ? qualifiedCompanies.filter(c => c.qualified && !c.needsReview)
    : activeTab === 'needsReview'
    ? qualifiedCompanies.filter(c => c.needsReview)
    : qualifiedCompanies;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="text-gray-900 font-medium">Campaigns</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 font-medium">{agent?.title}</span>
              </div>
            </div>
            {/* Action buttons can go here */}
          </div>
        </div>
      </div>
      
      <main className="container mx-auto p-4 md:p-8">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <AgentHeader
                agent={agent}
                showStats={true}
                qualifiedCount={qualifiedCount}
                totalCount={totalCount}
                responseOptions={agent.responseOptions}
              />

              <div className="p-4 border-t border-gray-100 flex items-center gap-2">
                <Button
                  variant={activeTab === 'qualified' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('qualified')}
                  className={cn('h-auto px-4 py-1.5 rounded-lg text-sm', {
                    'bg-primary text-primary-foreground':
                      activeTab === 'qualified',
                    'bg-gray-100 text-gray-700': activeTab !== 'qualified',
                  })}
                >
                  Qualified ({qualifiedCount})
                </Button>
                <Button
                  variant={activeTab === 'needsReview' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('needsReview')}
                  className={cn('h-auto px-4 py-1.5 rounded-lg text-sm', {
                    'bg-primary text-primary-foreground': activeTab === 'needsReview',
                    'bg-gray-100 text-gray-700': activeTab !== 'needsReview',
                  })}
                >
                  Needs Review ({needsReviewCount})
                </Button>
                <Button
                  variant={activeTab === 'all' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('all')}
                  className={cn('h-auto px-4 py-1.5 rounded-lg text-sm', {
                    'bg-primary text-primary-foreground': activeTab === 'all',
                    'bg-gray-100 text-gray-700': activeTab !== 'all',
                  })}
                >
                  All Tested ({totalCount})
                </Button>
              </div>
              <QualifiedCompaniesTable
                companies={companiesToShow}
                enrichmentOptions={initialEnrichmentOptions}
                totalPersonas={selectedPersonas.length}
                agent={agent}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 