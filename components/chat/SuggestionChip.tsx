"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SuggestionChipProps {
  icon: string;
  label: string;
  onClick: () => void;
  className?: string;
}

export function SuggestionChip({ 
  icon, 
  label, 
  onClick, 
  className 
}: SuggestionChipProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        variant="outline"
        onClick={onClick}
        className={cn(
          "rounded-full text-sm font-medium py-2 px-4 h-auto bg-white border-muted hover:bg-accent/10 hover:text-accent-foreground hover:border-accent/20 transition-colors duration-200 shadow-sm",
          className
        )}
      >
        <span className="mr-2">{icon}</span>
        {label}
      </Button>
    </motion.div>
  );
}