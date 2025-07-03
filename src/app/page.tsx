"use client";

import { StatCards } from "@/components/dashboard/stat-cards";
import { SpendingOverview } from "@/components/dashboard/spending-overview";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { AiFinancialHealth } from "@/components/dashboard/ai-financial-health";

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="space-y-4">
        <StatCards />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <SpendingOverview />
          <div className="lg:col-span-3 space-y-4">
            <RecentTransactions />
            <AiFinancialHealth />
          </div>
        </div>
      </div>
    </div>
  );
}
