import { CampaignData, CampaignsState, Agent, QualifiedCompanyWithResearch, SelectedPersona } from '@/components/chat/types';

const CAMPAIGNS_STORAGE_KEY = 'campaigns';
const LEGACY_CAMPAIGN_KEY = 'campaignData';

// Initialize campaigns state with migration from legacy single campaign
function initializeCampaigns(): CampaignsState {
  try {
    // Check for existing campaigns
    const existingCampaigns = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
    if (existingCampaigns) {
      return JSON.parse(existingCampaigns);
    }

    // Migrate legacy single campaign if it exists
    const legacyCampaign = localStorage.getItem(LEGACY_CAMPAIGN_KEY);
    if (legacyCampaign) {
      const legacyData = JSON.parse(legacyCampaign);
      const migratedCampaign: CampaignData = {
        id: generateCampaignId(),
        name: legacyData.agent?.title || 'Campaign',
        agent: legacyData.agent,
        qualifiedCompanies: legacyData.qualifiedCompanies || [],
        selectedPersonas: legacyData.selectedPersonas || [],
        createdAt: legacyData.createdAt || new Date().toISOString(),
        lastModified: new Date().toISOString(),
        status: 'active'
      };

      const campaignsState: CampaignsState = {
        campaigns: [migratedCampaign],
        activeCampaignId: migratedCampaign.id
      };

      saveCampaigns(campaignsState);
      
      // Remove legacy data
      localStorage.removeItem(LEGACY_CAMPAIGN_KEY);
      
      return campaignsState;
    }

    // No existing data
    return {
      campaigns: [],
      activeCampaignId: null
    };
  } catch (error) {
    console.error('Error initializing campaigns:', error);
    return {
      campaigns: [],
      activeCampaignId: null
    };
  }
}

function generateCampaignId(): string {
  return `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function saveCampaigns(campaignsState: CampaignsState): void {
  try {
    localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaignsState));
  } catch (error) {
    console.error('Error saving campaigns:', error);
  }
}

export function getCampaigns(): CampaignsState {
  return initializeCampaigns();
}

export function saveCampaign(
  agent: Agent,
  qualifiedCompanies: QualifiedCompanyWithResearch[],
  selectedPersonas: SelectedPersona[]
): CampaignData {
  const campaignsState = getCampaigns();
  
  const newCampaign: CampaignData = {
    id: generateCampaignId(),
    name: agent.title,
    agent,
    qualifiedCompanies,
    selectedPersonas,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    status: 'active'
  };

  const updatedState: CampaignsState = {
    campaigns: [...campaignsState.campaigns, newCampaign],
    activeCampaignId: newCampaign.id
  };

  saveCampaigns(updatedState);
  return newCampaign;
}

export function updateCampaign(campaignId: string, updates: Partial<CampaignData>): void {
  const campaignsState = getCampaigns();
  
  const updatedCampaigns = campaignsState.campaigns.map(campaign => 
    campaign.id === campaignId 
      ? { ...campaign, ...updates, lastModified: new Date().toISOString() }
      : campaign
  );

  const updatedState: CampaignsState = {
    ...campaignsState,
    campaigns: updatedCampaigns
  };

  saveCampaigns(updatedState);
}

export function deleteCampaign(campaignId: string): void {
  const campaignsState = getCampaigns();
  
  const updatedCampaigns = campaignsState.campaigns.filter(campaign => campaign.id !== campaignId);
  
  const updatedState: CampaignsState = {
    campaigns: updatedCampaigns,
    activeCampaignId: campaignsState.activeCampaignId === campaignId 
      ? (updatedCampaigns.length > 0 ? updatedCampaigns[0].id : null)
      : campaignsState.activeCampaignId
  };

  saveCampaigns(updatedState);
}

export function setActiveCampaign(campaignId: string): void {
  const campaignsState = getCampaigns();
  
  const updatedState: CampaignsState = {
    ...campaignsState,
    activeCampaignId: campaignId
  };

  saveCampaigns(updatedState);
}

export function getCampaignById(campaignId: string): CampaignData | null {
  const campaignsState = getCampaigns();
  return campaignsState.campaigns.find(campaign => campaign.id === campaignId) || null;
}

export function getActiveCampaign(): CampaignData | null {
  const campaignsState = getCampaigns();
  if (!campaignsState.activeCampaignId) {
    return null;
  }
  return getCampaignById(campaignsState.activeCampaignId);
}