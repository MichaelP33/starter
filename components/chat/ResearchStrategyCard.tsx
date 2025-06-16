"use client";

import { motion } from "framer-motion";
import { ResearchStrategy } from "./types";
import { cn } from "@/lib/utils";

interface ResearchStrategyCardProps {
  strategy: {
    id: string;
    icon: string;
    title: string;
    description: string;
    agents: any[];
  };
  isSelected: boolean;
  onClick: () => void;
}

export function ResearchStrategyCard({
  strategy,
  isSelected,
  onClick,
}: ResearchStrategyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "p-6 rounded-lg border cursor-pointer transition-colors duration-200",
        isSelected
          ? "border-primary bg-primary/5 shadow-[0_0_0_1px] shadow-primary"
          : "border-muted/20 bg-white hover:border-primary/20 hover:bg-primary/5"
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{strategy.icon}</span>
          <h3 className="text-lg font-medium">{strategy.title}</h3>
        </div>
        <p className="text-muted-foreground">{strategy.description}</p>
      </div>
    </motion.div>
  );
}