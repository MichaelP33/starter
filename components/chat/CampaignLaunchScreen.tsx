import React from 'react';
import { motion } from 'framer-motion';
import { KoalaLoadingIndicator } from '@/components/chat/KoalaLoadingIndicator';
import { Agent } from './types';

interface CampaignLaunchScreenProps {
  loadingMessage: string;
  loadingStep: number;
  phaseLabel: string;
  phaseNumber: number;
  agent: Agent | null;
}

export const CampaignLaunchScreen: React.FC<CampaignLaunchScreenProps> = ({ loadingMessage, loadingStep, phaseLabel, phaseNumber, agent }) => {
  const totalPhases = 4;

  return (
    <div className="h-full flex items-center justify-center p-8 bg-muted/10">
      <motion.div 
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 space-y-6">
          {agent && (
            <div className="flex flex-col items-center border-b border-gray-100 pb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🤖</span>
                <span className="text-lg font-semibold text-gray-800">{agent.title}</span>
              </div>
              <p className="text-sm text-gray-500 max-w-md text-center">
                {agent.researchQuestion}
              </p>
            </div>
          )}

          <div className="flex flex-col items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <KoalaLoadingIndicator />
            </motion.div>
            <div className="text-xs text-gray-500 mt-1">
              We're analyzing your complete prospect database to find qualified accounts and their key contacts
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">{`Step ${phaseNumber} of ${totalPhases}: ${phaseLabel}`}</span>
              <span className="font-medium">{Math.round(((loadingStep + 1) / (totalPhases * 2)) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${((loadingStep + 1) / (totalPhases * 2)) * 100}%` }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </div>
          </div>

          <div className="text-center text-base text-gray-700 pt-4 min-h-[32px] flex items-center justify-center">
            <p>{loadingMessage}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 