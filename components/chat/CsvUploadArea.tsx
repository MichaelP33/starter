"use client";

import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Account } from "./types";

interface CsvUploadAreaProps {
  onUploadSuccess: (accounts: Account[]) => void;
}

const mockAccounts: Account[] = [
  {
    companyName: "Stripe",
    website: "stripe.com",
    industry: "FinTech",
    hqCountry: "United States",
    employeeCount: "5000+",
    totalFunding: "$600M",
    estimatedAnnualRevenue: "$1B+",
    hqCity: "San Francisco",
    yearFounded: "2010",
  },
  {
    companyName: "Notion",
    website: "notion.so",
    industry: "Productivity Software",
    hqCountry: "United States",
    employeeCount: "1000+",
    totalFunding: "$275M",
    estimatedAnnualRevenue: "$500M",
    hqCity: "San Francisco",
    yearFounded: "2013",
  },
  {
    companyName: "Figma",
    website: "figma.com",
    industry: "Design Software",
    hqCountry: "United States",
    employeeCount: "1000+",
    totalFunding: "$330M",
    estimatedAnnualRevenue: "$400M",
    hqCity: "San Francisco",
    yearFounded: "2012",
  },
  {
    companyName: "Vercel",
    website: "vercel.com",
    industry: "Developer Tools",
    hqCountry: "United States",
    employeeCount: "500+",
    totalFunding: "$313M",
    estimatedAnnualRevenue: "$100M",
    hqCity: "San Francisco",
    yearFounded: "2015",
  },
  {
    companyName: "Linear",
    website: "linear.app",
    industry: "Project Management",
    hqCountry: "United States",
    employeeCount: "100+",
    totalFunding: "$62M",
    estimatedAnnualRevenue: "$50M",
    hqCity: "San Francisco",
    yearFounded: "2019",
  },
  {
    companyName: "Supabase",
    website: "supabase.com",
    industry: "Database",
    hqCountry: "United States",
    employeeCount: "100+",
    totalFunding: "$116M",
    estimatedAnnualRevenue: "$50M",
    hqCity: "San Francisco",
    yearFounded: "2020",
  },
  {
    companyName: "Loom",
    website: "loom.com",
    industry: "Video Software",
    hqCountry: "United States",
    employeeCount: "500+",
    totalFunding: "$203M",
    estimatedAnnualRevenue: "$100M",
    hqCity: "San Francisco",
    yearFounded: "2015",
  },
  {
    companyName: "Retool",
    website: "retool.com",
    industry: "Low-Code Platform",
    hqCountry: "United States",
    employeeCount: "500+",
    totalFunding: "$445M",
    estimatedAnnualRevenue: "$100M",
    hqCity: "San Francisco",
    yearFounded: "2017",
  },
];

export function CsvUploadArea({ onUploadSuccess }: CsvUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
      onUploadSuccess(mockAccounts);
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