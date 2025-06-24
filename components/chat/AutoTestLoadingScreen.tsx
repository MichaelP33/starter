import React, { useEffect, useState } from 'react';
import { KoalaLoadingIndicator } from '@/components/chat/KoalaLoadingIndicator';
import { Agent } from './types';
import { motion } from 'framer-motion';

interface AutoTestLoadingScreenProps {
  onComplete: () => void;
  agent: Agent | null;
}

const messages = [
  "Auto-testing your agent on sample companies...",
  "Testing Marketing Personas Hiring? on 10 sample companies from your list...",
  "Ensuring agent criteria are relevant before full analysis...",
  "Test complete! Agent is ready for your campaign."
];

export const AutoTestLoadingScreen: React.FC<AutoTestLoadingScreenProps> = ({ onComplete, agent }) => {
  const [step, setStep] = useState(0);
  const totalSteps = 4;

  useEffect(() => {
    if (step < totalSteps - 1) {
      const timeout = setTimeout(() => setStep(step + 1), 900);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => onComplete(), 900);
      return () => clearTimeout(timeout);
    }
  }, [step, onComplete]);

  return (
    <div className="h-full flex items-center justify-center p-8 bg-muted/10">
      <motion.div 
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 space-y-8">
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
              Testing on 10 of 152 companies
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">{`Step ${step + 1} of 4`}</span>
              <span className="font-medium">{Math.round(((step + 1) / totalSteps) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </div>
          </div>

          <div className="text-center text-base text-gray-700 pt-4 min-h-[32px] flex items-center justify-center">
            <p>{messages[step]}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 