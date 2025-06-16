import { DataConfigTest } from "@/components/test/DataConfigTest";

export default function TestDataPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Data Configuration Test</h1>
            <p className="text-muted-foreground">
              Test page for verifying data loading and configuration
            </p>
          </div>

          {/* Test Component */}
          <div className="rounded-lg border bg-card">
            <DataConfigTest />
          </div>

          {/* Footer */}
          <div className="text-sm text-muted-foreground text-center">
            <p>This page tests the data loading functionality of the application.</p>
            <p>Check the console for any additional debugging information.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 