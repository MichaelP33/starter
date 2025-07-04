"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CampaignData } from "@/components/chat/types";

interface CampaignCardProps {
  campaign: CampaignData;
  isActive: boolean;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
}

export function CampaignCard({ 
  campaign, 
  isActive, 
  onClick, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: CampaignCardProps) {
  const qualifiedCount = campaign.qualifiedCompanies.filter(c => c.qualified && !c.needsReview).length;
  const totalCount = campaign.qualifiedCompanies.length;
  const personaCount = campaign.selectedPersonas.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs';
      case 'completed':
        return 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs';
      default:
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isActive ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {campaign.name}
              </h3>
              <span className={getStatusColor(campaign.status)}>
                {campaign.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {campaign.agent.description}
            </p>
          </div>
          <div className="ml-2 flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                ✏️
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                🗑️
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Qualified Companies</span>
            <span className="font-medium text-gray-900">
              {qualifiedCount} / {totalCount}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Target Personas</span>
            <span className="font-medium text-gray-900">{personaCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Created</span>
            <span className="font-medium text-gray-900">
              {formatDate(campaign.createdAt)}
            </span>
          </div>
          {campaign.lastModified !== campaign.createdAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Last Modified</span>
              <span className="font-medium text-gray-900">
                {formatDate(campaign.lastModified)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}