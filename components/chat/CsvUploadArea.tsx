"use client";

import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Account } from "./types";
import { useDataConfig } from '@/hooks/useDataConfig';

interface CsvUploadAreaProps {
  onUploadSuccess: (accounts: Account[], pageSize: number) => void;
}

export function CsvUploadArea({ onUploadSuccess }: CsvUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { companies } = useDataConfig();

  // Convert Company type to Account type for all companies
  const realAccounts: Account[] = companies.map((company) => ({
    companyName: company.companyName,
    website: company.website,
    industry: company.industry,
    hqCountry: company.hqCountry,
    employeeCount: company.employeeCount,
    totalFunding: company.totalFunding,
    estimatedAnnualRevenue: company.estimatedAnnualRevenue,
    hqCity: company.hqCity,
    yearFounded: company.yearFounded?.toString() || '',
  }));

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const simulateUpload = () => {
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      onUploadSuccess(realAccounts, 10); // Pass pageSize of 10
    }, 1500);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    simulateUpload();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-xl mx-auto"
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-12
          flex flex-col items-center justify-center
          transition-colors duration-200
          ${isDragging ? "border-primary bg-primary/5" : "border-muted"}
          ${isUploading ? "opacity-50" : ""}
        `}
      >
        <UploadCloud
          className={`w-12 h-12 mb-4 ${
            isDragging ? "text-primary" : "text-muted-foreground"
          }`}
        />
        <h3 className="text-lg font-medium mb-2">
          {isUploading ? "Uploading..." : "Upload your CSV file"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Drag and drop your file here, or click to select
        </p>
        <Button
          onClick={simulateUpload}
          disabled={isUploading}
          variant="outline"
          className="rounded-full"
        >
          Select File
        </Button>
      </div>
    </motion.div>
  );
}