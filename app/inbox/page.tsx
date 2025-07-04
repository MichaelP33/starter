"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Plus, ChevronDown } from "lucide-react";
import { QualifiedCompanyWithResearch, SelectedPersona, Account } from "@/components/chat/types";
import { useDataConfig } from "@/hooks/useDataConfig";
import { Agent } from "@/components/chat/types";
import { AgentHeader } from "@/components/chat/AgentHeader";
import { QualifiedCompaniesTable } from "@/components/chat/QualifiedCompaniesTable";
import { Button } from "@/components/ui/button";
import { EnrichmentOption } from "@/components/chat/types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  id: string;
  agent: Agent;
  qualifiedCompanies: QualifiedCompanyWithResearch[];
  selectedPersonas: SelectedPersona[];
  createdAt: string;
  name?: string;
}

const saveCampaigns = (campaigns: CampaignData[]) => {
  localStorage.setItem('campaigns', JSON.stringify(campaigns));
};

const loadCampaigns = (): CampaignData[] => {
  try {
    const stored = localStorage.getItem('campaigns');
    if (stored) {
      return JSON.parse(stored) as CampaignData[];
    }
    
    const oldCampaign = localStorage.getItem('campaignData');
    if (oldCampaign) {
      const legacyCampaign = JSON.parse(oldCampaign) as Omit<CampaignData, 'id'>;
      const migratedCampaign: CampaignData = {
        ...legacyCampaign,
        id: `legacy-${Date.now()}`,
        name: `${legacyCampaign.agent?.title || 'Untitled'} Campaign`
      };
      
      saveCampaigns([migratedCampaign]);
      localStorage.removeItem('campaignData');
      console.log('Migrated legacy campaign to new format:', migratedCampaign);
      
      return [migratedCampaign];
    }
    
    return [];
  } catch (error) {
    console.error('Error loading campaigns:', error);
    return [];
  }
};

export default function CampaignInbox() {
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'qualified' | 'needsReview' | 'all'>('qualified');
  const { agents, isLoadingAgents } = useDataConfig();
  const router = useRouter();

  useEffect(() => {
    const loadedCampaigns = loadCampaigns();
    setCampaigns(loadedCampaigns);
    
    if (loadedCampaigns.length > 0 && !selectedCampaignId) {
      setSelectedCampaignId(loadedCampaigns[0].id);
    }
    
    console.log('Inbox: Loaded campaigns from localStorage:', loadedCampaigns);
  }, [selectedCampaignId]);

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  if (isLoadingAgents) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-medium">Loading...</p>
          <p className="text-sm text-muted-foreground">Please wait while we load your data.</p>
        </div>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium">No Campaigns Found</p>
          <p className="text-sm text-muted-foreground">Create your first campaign to get started.</p>
          <Button 
            onClick={() => router.push('/')} 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Build Your First Campaign
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedCampaign) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-medium">Campaign Not Found</p>
          <p className="text-sm text-muted-foreground">The selected campaign could not be loaded.</p>
        </div>
      </div>
    );
  }

  const { agent, qualifiedCompanies, selectedPersonas } = selectedCampaign;

  // Apply persona assignment fix for demo purposes (same as original)
  if (qualifiedCompanies && qualifiedCompanies.length > 0) {
    qualifiedCompanies.forEach(company => {
      if (!company.assignedPersonas) {
        company.assignedPersonas = [];
      }
    });

    if (qualifiedCompanies[0]) {
      qualifiedCompanies[0].assignedPersonas = ['Strategic Marketing Executive'];
    }
    if (qualifiedCompanies[1]) {
      qualifiedCompanies[1].assignedPersonas = ['Growth Hacker', 'Product Marketing Manager'];
    }
  }

  const qualifiedCount = qualifiedCompanies.filter((c: QualifiedCompanyWithResearch) => c.qualified && !c.needsReview).length;
  const needsReviewCount = qualifiedCompanies.filter((c: QualifiedCompanyWithResearch) => c.needsReview).length;
  const totalCount = qualifiedCompanies.length;

  const companiesToShow = activeTab === 'qualified'
    ? qualifiedCompanies.filter((c: QualifiedCompanyWithResearch) => c.qualified && !c.needsReview)
    : activeTab === 'needsReview'
    ? qualifiedCompanies.filter((c: QualifiedCompanyWithResearch) => c.needsReview)
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
                
                {/* Campaign Selection Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="text-gray-900 font-medium hover:bg-gray-100 h-auto p-1 flex items-center gap-1"
                    >
                      {agent?.title || 'Select Campaign'}
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    {campaigns.map((campaign) => (
                      <DropdownMenuItem
                        key={campaign.id}
                        onClick={() => setSelectedCampaignId(campaign.id)}
                        className={cn(
                          "flex flex-col items-start p-3 cursor-pointer",
                          selectedCampaignId === campaign.id && "bg-accent"
                        )}
                      >
                        <div className="font-medium text-sm">
                          {campaign.name || campaign.agent?.title || 'Untitled Campaign'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {campaign.qualifiedCompanies.length} companies • 
                          Created {new Date(campaign.createdAt).toLocaleDateString()}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Campaign Count */}
              <span className="text-sm text-gray-500">
                {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
              </span>
              {/* Build New Campaign Button */}
              <Button 
                onClick={() => router.push('/')}
                variant="outline"
                size="sm"
                className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Build New Campaign
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto p-4 md:p-8">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Campaign Overview Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedCampaign.name || selectedCampaign.agent.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Created {new Date(selectedCampaign.createdAt).toLocaleDateString()} • 
                    {selectedPersonas.length} persona{selectedPersonas.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Edit Campaign
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    Delete
                  </Button>
                </div>
              </div>
              
              {/* Campaign Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
                  <div className="text-sm text-gray-500">Total Companies</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{qualifiedCount}</div>
                  <div className="text-sm text-gray-500">Qualified</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{needsReviewCount}</div>
                  <div className="text-sm text-gray-500">Needs Review</div>
                </div>
              </div>
            </div>

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