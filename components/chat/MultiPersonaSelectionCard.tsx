"use client";

import { motion } from "framer-motion";
import { User, Edit, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Persona } from "./types";

interface SelectedPersona {
  id: string;
  title: string;
  description: string;
}

interface MultiPersonaSelectionCardProps {
  selectedPersonas: SelectedPersona[];
  availablePersonas: Persona[];
  onEditPersona: (persona: SelectedPersona) => void;
  onRemovePersona: (personaId: string) => void;
  onBuildPersona: (persona: Persona) => void;
  onTestAllPersonas: () => void;
  onContinueToCampaign: () => void;
}

export function MultiPersonaSelectionCard({
  selectedPersonas,
  availablePersonas,
  onEditPersona,
  onRemovePersona,
  onBuildPersona,
  onTestAllPersonas,
  onContinueToCampaign,
}: MultiPersonaSelectionCardProps) {
  const isPersonaSelected = (personaId: string) => {
    return selectedPersonas.some(p => p.id === personaId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8"
    >
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="space-y-8">
          {/* Selected Personas Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Selected Personas ({selectedPersonas.length})</h2>
            
            <div className="space-y-3">
              {selectedPersonas.map((persona) => (
                <motion.div
                  key={persona.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-green-50/50 border border-green-200/50 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-600" />
                          <h3 className="font-medium text-gray-900">{persona.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {persona.description.length > 120 
                            ? `${persona.description.substring(0, 120)}...` 
                            : persona.description
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => onEditPersona(persona)}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRemovePersona(persona.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Add More Personas Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Add another persona type</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {availablePersonas.map((persona) => {
                const isSelected = isPersonaSelected(persona.id);
                
                return (
                  <motion.div
                    key={persona.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-lg border transition-all duration-200 ${
                      isSelected 
                        ? "border-gray-200 bg-gray-50/50 opacity-60" 
                        : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50"
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{persona.icon}</span>
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">{persona.title}</h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {persona.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        {isSelected ? (
                          <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-green-100 text-green-800 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            Added
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button 
                              variant="outline"
                              size="sm"
                              className="flex-1 text-sm"
                              onClick={() => {
                                // Preview functionality could be added here
                                console.log("Preview persona:", persona);
                              }}
                            >
                              Preview Details
                            </Button>
                            <Button 
                              onClick={() => onBuildPersona(persona)}
                              className="flex-1 bg-[#6366f1] hover:bg-[#6366f1]/90 text-white text-sm transition-colors duration-200"
                            >
                              Build Persona
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button 
              onClick={onTestAllPersonas}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={selectedPersonas.length === 0}
            >
              Test All Personas
            </Button>
            <Button 
              variant="outline" 
              onClick={onContinueToCampaign}
              disabled={selectedPersonas.length === 0}
            >
              Continue to Campaign
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}