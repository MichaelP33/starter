'use client';

import { useDataConfig } from '@/hooks/useDataConfig';
import { ResultsGenerator } from '@/utils/ResultsGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEffect, useState } from 'react';

export default function TestResultsPage() {
  const dataConfig = useDataConfig();
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    qualified: 0,
    qualificationRate: 0,
    avgConfidence: 0
  });

  useEffect(() => {
    if (dataConfig.companies.length > 0 && dataConfig.agents.length > 0) {
      const generator = new ResultsGenerator(dataConfig.companies, dataConfig.agents);
      const marketingAgent = dataConfig.agents.find(a => a.id === 'marketing-hiring');
      
      if (marketingAgent) {
        const agentResults = generator.generateResults(marketingAgent.id);
        setResults(agentResults);

        // Calculate statistics
        const qualified = agentResults.filter(r => r.qualified).length;
        const total = agentResults.length;
        const avgConfidence = agentResults.reduce((sum, r) => sum + r.confidenceScore, 0) / total;

        setStats({
          total,
          qualified,
          qualificationRate: (qualified / total) * 100,
          avgConfidence
        });
      }
    }
  }, [dataConfig.companies, dataConfig.agents]);

  if (!dataConfig.companies.length || !dataConfig.agents.length) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Loading test data...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Agent Results Generator Test</h1>
          <p className="text-muted-foreground">
            Testing the ResultsGenerator with our seed data
          </p>
        </div>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Results Statistics</CardTitle>
            <CardDescription>Overview of generated results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Companies</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Qualified</p>
                <p className="text-2xl font-bold">{stats.qualified}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Qualification Rate</p>
                <p className="text-2xl font-bold">{stats.qualificationRate.toFixed(1)}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">{stats.avgConfidence.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Generated Results</h2>
          <div className="grid gap-4">
            {results.map((result, index) => (
              <Card key={index} className={result.qualified ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{result.companyName}</CardTitle>
                      <CardDescription>
                        {result.industry} • {result.employeeCount} employees
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        result.qualified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.qualified ? 'Qualified' : 'Not Qualified'}
                      </span>
                      <p className="text-sm text-muted-foreground mt-1">
                        Confidence: {result.confidence}%
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm">{result.researchSummary}</p>
                    <div className="flex flex-wrap gap-2">
                      {result.sources.map((source: string, i: number) => (
                        <span 
                          key={i}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 