"use client";

import { Contact } from "./types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles, Linkedin } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PersonaContactRowProps {
  contact: Contact;
}

const statusComponents: Record<Contact['status'], (contact: Contact) => React.ReactNode> = {
  'Not Contacted': (contact) => (
    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold border border-gray-200 transition-all duration-200 hover:scale-105">
      Not Contacted
    </span>
  ),
  'Send Message': (contact) => (
    <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 h-auto rounded-full text-xs font-semibold border border-purple-200 transition-all duration-200 hover:scale-105">
      Send Message 📧
    </Button>
  ),
  'Awaiting Reply': (contact) => (
    <div className="flex flex-col items-start transition-all duration-200 hover:scale-105">
      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold border border-yellow-200">
        Awaiting Reply ⏳
      </span>
      <span className="text-gray-500 text-xs mt-1">Sent {contact.statusDays} day{contact.statusDays === 1 ? '' : 's'} ago</span>
    </div>
  ),
  'Replied': (contact) => (
    <div className="flex flex-col items-start transition-all duration-200 hover:scale-105">
      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold border border-green-200">
        Replied ✓
      </span>
      <span className="text-gray-500 text-xs mt-1">Replied {contact.statusDays} day{contact.statusDays === 1 ? '' : 's'} ago</span>
    </div>
  ),
  'Interested': (contact) => (
    <div className="flex flex-col items-start transition-all duration-200 hover:scale-105">
      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold border border-blue-200">
        Interested
      </span>
      <span className="text-gray-500 text-xs mt-1">Marked {contact.statusDays} day{contact.statusDays === 1 ? '' : 's'} ago</span>
    </div>
  ),
  'Demo Booked': (contact) => (
    <div className="flex flex-col items-start transition-all duration-200 hover:scale-105">
      <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs font-semibold border border-teal-200">
        Demo Booked
      </span>
      <span className="text-gray-500 text-xs mt-1">Marked {contact.statusDays} day{contact.statusDays === 1 ? '' : 's'} ago</span>
    </div>
  ),
  'Not Interested': (contact) => (
    <div className="flex flex-col items-start transition-all duration-200 hover:scale-105">
      <span className="bg-gray-100 text-gray-400 px-2 py-1 rounded-full text-xs font-semibold border border-gray-200">
        Not Interested
      </span>
      <span className="text-gray-500 text-xs mt-1">Replied {contact.statusDays} day{contact.statusDays === 1 ? '' : 's'} ago</span>
    </div>
  ),
};

const matchScoreColors = (score: number) => {
  if (score >= 90) return 'text-green-700';
  if (score >= 80) return 'text-blue-700';
  if (score >= 70) return 'text-yellow-700';
  if (score >= 60) return 'text-orange-700';
  return 'text-red-700';
};

export function PersonaContactRow({ contact }: PersonaContactRowProps) {
  return (
    <div className="grid grid-cols-7 gap-4 items-center py-4 px-3 text-sm hover:bg-gray-25 transition-colors duration-150">
      {/* Contact Name/Title */}
      <div className="col-span-2">
        <div className="font-semibold text-gray-900 tracking-wide">{contact.name}</div>
        <div className="text-gray-500">{contact.title}</div>
      </div>

      {/* Coach Button */}
      <div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className="bg-transparent text-purple-500 hover:text-purple-600 hover:bg-purple-50 hover:border-purple-600 border border-purple-200 px-3 py-1 rounded-full text-sm font-medium h-auto shadow-sm hover:shadow-lg hover:shadow-purple-200 hover:scale-105 transition-all duration-200 cursor-pointer group"
              >
                <Sparkles className="w-3 h-3 mr-1.5 group-hover:animate-pulse text-purple-500 group-hover:text-purple-600 transition-colors duration-200" />
                Coach
              </Button>
            </TooltipTrigger>
            <TooltipContent 
              side="top" 
              className="bg-white shadow-lg border border-gray-200 text-gray-800 text-sm px-3 py-2 rounded-lg max-w-xs"
            >
              <p>Koala's AI Coach partners with reps to draft hyper-personalized research</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Email */}
      <a href={`mailto:${contact.email}`} className="text-gray-600 truncate hover:text-blue-600 transition-colors">{contact.email}</a>

      {/* LinkedIn */}
      <div className="flex items-center">
        <a 
          href={contact.linkedin} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-gray-400 hover:text-[#0A66C2] transition-colors duration-200 cursor-pointer hover:scale-110 transform transition-transform duration-200 hover:bg-blue-50 hover:rounded-full p-1"
        >
          <Linkedin className="w-4 h-4" />
        </a>
      </div>

      {/* Match % */}
      <div className="text-center">
        <span className={cn('font-semibold', matchScoreColors(contact.matchScore))}>
          {contact.matchScore}%
        </span>
      </div>

      {/* Status */}
      <div className="flex items-start">
        {statusComponents[contact.status](contact)}
      </div>
    </div>
  );
}

export function ExpandedContactHeader() {
  return (
    <div className="grid grid-cols-7 gap-4 py-3 px-3 text-xs font-medium text-gray-500 bg-gray-50/70 border-y border-gray-200/80">
      <div className="col-span-2">Contact</div>
      <div>Coach</div>
      <div>Email</div>
      <div>LinkedIn</div>
      <div>Match %</div>
      <div>Status</div>
    </div>
  );
} 