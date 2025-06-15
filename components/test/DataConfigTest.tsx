"use client";

import { useDataConfig } from "@/hooks/useDataConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export function DataConfigTest() {
  const {
    companies,
    agents,
    personas,
    personaCategories,
    oldFormatPersonas,
    isLoading,
    isLoadingCompanies,
    isLoadingAgents,
    isLoadingPersonas,
    hasError,
    errors,
    getAgentsByCategory,
    getPersonasByCategory,
    getPersonaCategory,
  } = useDataConfig();

  // Sample data display helpers
  const renderSampleData = (data: any[], title: string, fields: string[]) => {
    if (!data.length) return null;
    
    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">{title}</h3>
        <div className="space-y-2">
          {data.slice(0, 3).map((item, index) => (
            <div key={index} className="text-sm bg-muted/50 p-2 rounded">
              {fields.map(field => (
                <div key={field} className="flex gap-2">
                  <span className="font-medium">{field}:</span>
                  <span>{item[field]}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <div className="space-y-2">
            <p className="text-lg font-medium">Loading data...</p>
            <div className="flex gap-4 justify-center text-sm text-muted-foreground">
              <span className={isLoadingCompanies ? "animate-pulse" : ""}>
                Companies {isLoadingCompanies ? "..." : "✓"}
              </span>
              <span className={isLoadingAgents ? "animate-pulse" : ""}>
                Agents {isLoadingAgents ? "..." : "✓"}
              </span>
              <span className={isLoadingPersonas ? "animate-pulse" : ""}>
                Personas {isLoadingPersonas ? "..." : "✓"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading data</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              {errors.companies && (
                <div>Companies: {errors.companies.message}</div>
              )}
              {errors.agents && (
                <div>Agents: {errors.agents.message}</div>
              )}
              {errors.personas && (
                <div>Personas: {errors.personas.message}</div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Data Loading Stats</CardTitle>
          <CardDescription>Overview of loaded data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{companies.length}</div>
              <div className="text-sm text-muted-foreground">Companies</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{agents.length}</div>
              <div className="text-sm text-muted-foreground">Agents</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{personas.length}</div>
              <div className="text-sm text-muted-foreground">Personas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Data Display */}
      <div className="grid grid-cols-2 gap-6">
        {/* Companies */}
        <Card>
          <CardHeader>
            <CardTitle>Companies</CardTitle>
            <CardDescription>Sample company data</CardDescription>
          </CardHeader>
          <CardContent>
            {renderSampleData(companies, "Sample Companies", [
              "companyName",
              "industry",
              "employeeCount",
            ])}
          </CardContent>
        </Card>

        {/* Agents */}
        <Card>
          <CardHeader>
            <CardTitle>Agents</CardTitle>
            <CardDescription>Sample agent data</CardDescription>
          </CardHeader>
          <CardContent>
            {renderSampleData(agents, "Sample Agents", [
              "title",
              "description",
              "categoryId",
            ])}
          </CardContent>
        </Card>

        {/* Personas */}
        <Card>
          <CardHeader>
            <CardTitle>Personas</CardTitle>
            <CardDescription>Sample persona data</CardDescription>
          </CardHeader>
          <CardContent>
            {renderSampleData(personas, "Sample Personas", [
              "title",
              "description",
              "categoryId",
            ])}
          </CardContent>
        </Card>

        {/* Helper Methods Test */}
        <Card>
          <CardHeader>
            <CardTitle>Helper Methods</CardTitle>
            <CardDescription>Testing helper methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Test getAgentsByCategory */}
              <div>
                <h3 className="text-sm font-medium mb-2">Agents by Category</h3>
                {personaCategories.slice(0, 2).map(category => (
                  <div key={category.categoryId} className="mb-2">
                    <div className="text-sm font-medium">{category.categoryTitle}</div>
                    <div className="text-sm text-muted-foreground">
                      {getAgentsByCategory(category.categoryId).length} agents
                    </div>
                  </div>
                ))}
              </div>

              {/* Test getPersonasByCategory */}
              <div>
                <h3 className="text-sm font-medium mb-2">Personas by Category</h3>
                {personaCategories.slice(0, 2).map(category => (
                  <div key={category.categoryId} className="mb-2">
                    <div className="text-sm font-medium">{category.categoryTitle}</div>
                    <div className="text-sm text-muted-foreground">
                      {getPersonasByCategory(category.categoryId).length} personas
                    </div>
                  </div>
                ))}
              </div>

              {/* Test old format compatibility */}
              <div>
                <h3 className="text-sm font-medium mb-2">Old Format Compatibility</h3>
                <div className="text-sm text-muted-foreground">
                  {oldFormatPersonas.personas.length} personas in old format
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 