"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { QualifiedCompanyWithResearch, SelectedPersona, Account, CampaignData } from "@/components/chat/types";
import { useDataConfig } from "@/hooks/useDataConfig";
import { Agent } from "@/components/chat/types";
import { AgentHeader } from "@/components/chat/AgentHeader";
import { QualifiedCompaniesTable } from "@/components/chat/QualifiedCompaniesTable";
import { Button } from "@/components/ui/button";
import { EnrichmentOption } from "@/components/chat/types";
import { cn } from "@/lib/utils";
import { getCampaigns, getActiveCampaign, setActiveCampaign, deleteCampaign, updateCampaign } from "@/utils/campaignManager";
import { CampaignCard } from "@/components/ui/campaign-card-simple";
import { useRouter } from "next/navigation";

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

export default function CampaignInbox() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [activeCampaign, setActiveCampaignState] = useState<CampaignData | null>(null);
  const [activeTab, setActiveTab] = useState<'qualified' | 'needsReview' | 'all'>('qualified');
  const [showCampaignList, setShowCampaignList] = useState(false);
  const { agents, isLoadingAgents } = useDataConfig();

  useEffect(() => {
    const campaignsState = getCampaigns();
    setCampaigns(campaignsState.campaigns);
    
    if (campaignsState.campaigns.length === 0) {
      setShowCampaignList(true);
    } else if (campaignsState.activeCampaignId) {
      const active = campaignsState.campaigns.find(c => c.id === campaignsState.activeCampaignId);
      if (active) {
        setActiveCampaignState(active);
        setShowCampaignList(false);
      } else {
        setActiveCampaignState(campaignsState.campaigns[0]);
        setActiveCampaign(campaignsState.campaigns[0].id);
        setShowCampaignList(false);
      }
    } else {
      setActiveCampaignState(campaignsState.campaigns[0]);
      setActiveCampaign(campaignsState.campaigns[0].id);
      setShowCampaignList(false);
    }
  }, []);

  const handleCampaignSelect = (campaign: CampaignData) => {
    setActiveCampaignState(campaign);
    setActiveCampaign(campaign.id);
    setShowCampaignList(false);
  };

  const handleNewCampaign = () => {
    router.push('/app');
  };

  const handleDeleteCampaign = (campaignId: string) => {
    deleteCampaign(campaignId);
    const updatedCampaigns = getCampaigns();
    setCampaigns(updatedCampaigns.campaigns);
    
    if (updatedCampaigns.campaigns.length === 0) {
      setActiveCampaignState(null);
      setShowCampaignList(true);
    } else if (activeCampaign?.id === campaignId) {
      const newActive = updatedCampaigns.campaigns[0];
      setActiveCampaignState(newActive);
      setActiveCampaign(newActive.id);
    }
  };

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

  // Show campaign list view
  if (showCampaignList || !activeCampaign) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold text-gray-900">Campaigns</h1>
              </div>
              <Button onClick={handleNewCampaign} className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Build New Campaign
              </Button>
            </div>
          </div>
        </div>
        
        <main className="container mx-auto p-4 md:p-8">
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">No campaigns yet</h2>
                <p className="text-gray-600 mb-6">
                  Get started by building your first target account list campaign.
                </p>
                <Button onClick={handleNewCampaign} size="lg" className="bg-primary text-primary-foreground">
                  <Plus className="w-5 h-5 mr-2" />
                  Build Your First Campaign
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  isActive={false}
                  onClick={() => handleCampaignSelect(campaign)}
                  onDelete={() => handleDeleteCampaign(campaign.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  const { agent, qualifiedCompanies, selectedPersonas } = activeCampaign;
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
                <button 
                  onClick={() => setShowCampaignList(true)}
                  className="text-gray-900 font-medium hover:text-primary cursor-pointer"
                >
                  Campaigns
                </button>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 font-medium">{agent?.title}</span>
              </div>
            </div>
            <Button onClick={handleNewCampaign} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Build New Campaign
            </Button>
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