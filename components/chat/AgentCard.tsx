"use client";

import { motion } from "framer-motion";
import { Agent } from "./types";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";

interface AgentCardProps {
  agent: Agent;
  onBuildClick: (agent: Agent) => void;
}

const agentStyles = {
  "marketing-hiring": {
    border: "border-blue-100",
    background: "bg-blue-50/30",
    hover: "hover:border-blue-200 hover:bg-blue-50/50",
  },
  "data-hiring": {
    border: "border-emerald-100",
    background: "bg-emerald-50/30",
    hover: "hover:border-emerald-200 hover:bg-emerald-50/50",
  },
  "leadership-changes": {
    border: "border-purple-100",
    background: "bg-purple-50/30",
    hover: "hover:border-purple-200 hover:bg-purple-50/50",
  },
};

const whyExplanations = {
  "marketing-hiring": "Companies hiring for data-driven marketing roles likely have budget and data infrastructure pain that Segment directly addresses.",
  "data-hiring": "Companies hiring for data roles likely have budget and are struggling with data quality, integration complexity, or scaling issues that Segment solves.",
  "leadership-changes": "Companies with recent leadership changes likely have budget and a mandate to fix existing data infrastructure problems that Segment solves.",
};

export function AgentCard({ agent, onBuildClick }: AgentCardProps) {
  const styles = agentStyles[agent.id as keyof typeof agentStyles];
  const whyText = whyExplanations[agent.id as keyof typeof whyExplanations];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-lg border transition-all duration-200 ${styles.border} ${styles.background} ${styles.hover}`}
    >
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{agent.title}</h3>
        <p className="text-muted-foreground">{agent.description}</p>
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Why?</h4>
          <p className="text-sm text-gray-600">{whyText}</p>
        </div>
        <Button 
          onClick={() => onBuildClick(agent)}
          className="w-full bg-[#6366f1] hover:bg-[#6366f1]/90 text-white transition-colors duration-200"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          Build Agent
        </Button>
      </div>
    </motion.div>
  );
}