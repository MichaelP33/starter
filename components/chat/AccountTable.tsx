"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Account, EnrichmentOption } from "./types";
import { motion } from "framer-motion";

interface AccountTableProps {
  accounts: Account[];
  enrichmentOptions: EnrichmentOption[];
}

export function AccountTable({ accounts, enrichmentOptions }: AccountTableProps) {
  const selectedOptions = enrichmentOptions.filter((option) => option.isSelected);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
    >
      <div className="rounded-lg border border-muted/20 bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-muted/20">
              {selectedOptions.map((option, index) => (
                <TableHead
                  key={option.id}
                  className={`bg-muted/5 py-4 ${
                    index < selectedOptions.length - 1 ? "border-r border-muted/20" : ""
                  }`}
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <span>{option.icon}</span>
                    <span className="font-medium">{option.label}</span>
                  </motion.div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account, index) => (
              <TableRow
                key={index}
                className="hover:bg-muted/5 transition-colors duration-200"
              >
                {selectedOptions.map((option, colIndex) => (
                  <TableCell
                    key={option.id}
                    className={`py-3 ${
                      colIndex < selectedOptions.length - 1 ? "border-r border-muted/20" : ""
                    }`}
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {account[option.field]}
                    </motion.div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}