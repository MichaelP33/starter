"use client";

import { EnrichmentChip } from "./EnrichmentChip";
import { EnrichmentOption } from "./types";
import { motion } from "framer-motion";

interface CustomizationPanelProps {
  enrichmentOptions: EnrichmentOption[];
  onToggleOption: (id: string) => void;
}

export function CustomizationPanel({
  enrichmentOptions,
  onToggleOption,
}: CustomizationPanelProps) {
  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <h2 className="text-xl font-medium text-foreground">
          Add enrichment data to inform your outreach approach.
        </h2>
        <p className="text-muted-foreground">
          Koala takes into account all the data in the table when helping draft messaging.
        </p>
      </motion.div>

      <div className="flex flex-wrap gap-4">
        {enrichmentOptions.map((option) => (
          <EnrichmentChip
            key={option.id}
            icon={option.icon}
            label={option.label}
            isSelected={option.isSelected}
            onClick={() => onToggleOption(option.id)}
          />
        ))}
      </div>
    </div>
  );
}