"use client";

import { motion } from "framer-motion";
import { Agent } from "./types";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";

interface AgentCardProps {
  agent: Agent;
  onBuildClick: (agent: Agent) => void;
}

const getCategoryStyles = (categoryId: string) => {
  switch (categoryId) {
    case 'hiring':
      return {
        border: "border-blue-100",
        background: "bg-blue-50/30",
        hover: "hover:border-blue-200 hover:bg-blue-50/50",
      };
    case 'news':
      return {
        border: "border-emerald-100",
        background: "bg-emerald-50/30",
        hover: "hover:border-emerald-200 hover:bg-emerald-50/50",
      };
    case 'tech':
      return {
        border: "border-purple-100",
        background: "bg-purple-50/30",
        hover: "hover:border-purple-200 hover:bg-purple-50/50",
      };
    default:
      return {
        border: "border-gray-100",
        background: "bg-gray-50/30",
        hover: "hover:border-gray-200 hover:bg-gray-50/50",
      };
  }
};

export function AgentCard({ agent, onBuildClick }: AgentCardProps) {
  // Get category ID from agent ID (e.g., "marketing-hiring" -> "hiring")
  const categoryId = agent.id.split('-')[1] || 'default';
  const styles = getCategoryStyles(categoryId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-lg border transition-all duration-200 ${styles.border} ${styles.background} ${styles.hover}`}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{agent.title}</h3>
          <p className="text-muted-foreground">{agent.description}</p>
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