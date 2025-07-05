"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { seedDataManager, validateCurrentDataset } from "@/utils/seedDataManager";
import { useSimplifiedDataConfig } from "@/hooks/useSimplifiedDataConfig";

interface DatasetValidation {
  valid: boolean;
  errors: string[];
}

export default function SeedDataAdmin() {
  const { datasetInfo, switchDataset, validateDataset } = useSimplifiedDataConfig();
  const [validation, setValidation] = useState<DatasetValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [availableDatasets] = useState(['segment-saas']); // In real app, would fetch from API

  useEffect(() => {
    // Auto-validate on load
    handleValidateDataset();
  }, []);

  const handleValidateDataset = async () => {
    setIsValidating(true);
    try {
      const result = await validateCurrentDataset();
      setValidation(result);
    } catch (error) {
      setValidation({
        valid: false,
        errors: [`Validation failed: ${error}`]
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSwitchDataset = async (datasetName: string) => {
    const success = await switchDataset(datasetName);
    if (success) {
      console.log(`Switched to dataset: ${datasetName}`);
    } else {
      console.error(`Failed to switch to dataset: ${datasetName}`);
    }
  };

  const handleClearCache = () => {
    seedDataManager.clearCache();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Seed Data Management</h1>
          <p className="text-gray-600 mt-2">
            Manage datasets for the Target Account List Builder application
          </p>
        </div>

        {/* Current Dataset Info */}
        <Card>
          <CardHeader>
            <CardTitle>Current Dataset</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-lg font-semibold">{datasetInfo.name || 'Loading...'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Vertical</label>
                <p className="text-lg">{datasetInfo.vertical || 'Loading...'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Version</label>
                <p className="text-lg">{datasetInfo.version || 'Loading...'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <p className={`text-lg font-semibold ${validation?.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {validation === null ? 'Unknown' : validation.valid ? 'Valid' : 'Invalid'}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Description</label>
              <p className="text-gray-800">{datasetInfo.description || 'Loading...'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Dataset Validation */}
        <Card>
          <CardHeader>
            <CardTitle>Dataset Validation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={handleValidateDataset}
                disabled={isValidating}
                variant="outline"
              >
                {isValidating ? 'Validating...' : 'Validate Current Dataset'}
              </Button>
              <Button 
                onClick={handleClearCache}
                variant="outline"
              >
                Clear Cache & Reload
              </Button>
            </div>

            {validation && (
              <div className={`p-4 rounded-lg ${validation.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h4 className={`font-semibold ${validation.valid ? 'text-green-800' : 'text-red-800'}`}>
                  {validation.valid ? '✅ Dataset is valid' : '❌ Dataset has errors'}
                </h4>
                {validation.errors.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {validation.errors.map((error, index) => (
                      <li key={index} className="text-red-700 text-sm">• {error}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Datasets */}
        <Card>
          <CardHeader>
            <CardTitle>Available Datasets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {availableDatasets.map((dataset) => (
                <div key={dataset} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{dataset}</h4>
                    <p className="text-sm text-gray-600">
                      {dataset === 'segment-saas' ? 'SaaS companies targeting dataset for Segment' : 'Dataset description'}
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleSwitchDataset(dataset)}
                    variant="outline"
                    disabled={datasetInfo.name?.includes(dataset)}
                  >
                    {datasetInfo.name?.includes(dataset) ? 'Active' : 'Switch'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upload New Dataset */}
        <Card>
          <CardHeader>
            <CardTitle>Upload New Dataset</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="space-y-4">
                <div className="text-4xl">📁</div>
                <div>
                  <h3 className="text-lg font-semibold">Dataset Upload (Coming Soon)</h3>
                  <p className="text-gray-600">
                    Upload a ZIP file containing config.json, companies.json, agents.json, personas.json, and results.json
                  </p>
                </div>
                <Button disabled variant="outline">
                  Choose ZIP File
                </Button>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Dataset Structure Required:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <code>config.json</code> - Dataset metadata and configuration</li>
                <li>• <code>companies.json</code> - Array of company objects with enrichment data</li>
                <li>• <code>agents.json</code> - Research agents grouped by categories</li>
                <li>• <code>personas.json</code> - Contact personas with targeting information</li>
                <li>• <code>results.json</code> - Mock qualification results for testing</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Documentation & Help</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Quick Actions</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Validate dataset structure and data integrity</li>
                  <li>• Switch between available datasets</li>
                  <li>• Clear cache to reload data from source</li>
                  <li>• Upload new datasets via ZIP files</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Data Format Reference</h4>
                <ul className="space-y-2 text-sm">
                  <li>• <a href="/data/seed-data/README.md" className="text-blue-600 hover:underline">View README</a></li>
                  <li>• <a href="/data/seed-data/segment-saas/" className="text-blue-600 hover:underline">Example Dataset</a></li>
                  <li>• JSON schema validation included</li>
                  <li>• Backward compatibility maintained</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}