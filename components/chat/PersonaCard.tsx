"use client";

import { motion } from "framer-motion";
import { Persona } from "./types";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface PersonaCardProps {
  persona: Persona;
  onBuildClick: (persona: Persona) => void;
}

export function PersonaCard({ persona, onBuildClick }: PersonaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-lg border border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50 transition-all duration-200"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">{persona.icon}</span>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{persona.name}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{persona.description}</p>
          </div>
        </div>
        
        <div className="pt-2">
          <Button 
            onClick={() => {
              console.log("🔍 PERSONA CARD CLICK DEBUG:");
              console.log("Persona clicked:", persona.name);
              console.log("Calling onBuildClick with persona:", persona);
              onBuildClick(persona);
            }}
            className="w-full bg-[#6366f1] hover:bg-[#6366f1]/90 text-white text-sm transition-colors duration-200"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Build Persona
          </Button>
        </div>
      </div>
    </motion.div>
  );
}