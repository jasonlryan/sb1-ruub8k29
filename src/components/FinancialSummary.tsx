import React from "react";

export interface FinancialSummaryProps {
  totalRevenue: number;
  totalCosts: number;
  annualRevenue: number;
  annualCosts: number;
  sectionTotals: {
    marketing: number;
    payroll: number;
    cogs: number;
    opex: number;
  };
}

export function FinancialSummary({
  totalRevenue,
  totalCosts,
  annualRevenue,
  annualCosts,
  sectionTotals,
}: FinancialSummaryProps) {
  const monthlyNetIncome = totalRevenue - totalCosts;
  const annualNetIncome = annualRevenue - annualCosts;
  const grossMargin =
    totalRevenue > 0
      ? ((totalRevenue - sectionTotals.cogs) / totalRevenue) * 100
      : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Financial Summary
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Monthly Revenue Box */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Monthly Revenue
          </h3>
          <div className="space-y-2">
            <p className="flex justify-between">
              <span>Subscription Revenue:</span>
              <span>£{totalRevenue.toLocaleString()}</span>
            </p>
            <p className="flex justify-between">
              <span>COGS:</span>
              <span>£{sectionTotals.cogs.toLocaleString()}</span>
            </p>
            <p className="flex justify-between">
              <span>Marketing:</span>
              <span>£{sectionTotals.marketing.toLocaleString()}</span>
            </p>
            <p className="flex justify-between">
              <span>Payroll:</span>
              <span>£{sectionTotals.payroll.toLocaleString()}</span>
            </p>
            <p className="flex justify-between">
              <span>Operating Expenses:</span>
              <span>£{sectionTotals.opex.toLocaleString()}</span>
            </p>
            <div className="border-t border-blue-200 pt-2 mt-2">
              <p className="flex justify-between font-semibold">
                <span>Monthly Net Income:</span>
                <span
                  className={
                    monthlyNetIncome >= 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  £{monthlyNetIncome.toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Annual Revenue Box */}
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4">
            Annual Revenue
          </h3>
          <div className="space-y-2">
            <p className="flex justify-between">
              <span>Annual Revenue (ARR):</span>
              <span>£{annualRevenue.toLocaleString()}</span>
            </p>
            <p className="flex justify-between">
              <span>Annual COGS:</span>
              <span>£{(sectionTotals.cogs * 12).toLocaleString()}</span>
            </p>
            <p className="flex justify-between">
              <span>Annual Marketing:</span>
              <span>£{(sectionTotals.marketing * 12).toLocaleString()}</span>
            </p>
            <p className="flex justify-between">
              <span>Annual Payroll:</span>
              <span>£{(sectionTotals.payroll * 12).toLocaleString()}</span>
            </p>
            <p className="flex justify-between">
              <span>Annual Operating Expenses:</span>
              <span>£{(sectionTotals.opex * 12).toLocaleString()}</span>
            </p>
            <div className="border-t border-indigo-200 pt-2 mt-2">
              <p className="flex justify-between font-semibold">
                <span>Annual Net Income:</span>
                <span
                  className={
                    annualNetIncome >= 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  £{annualNetIncome.toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Monthly Revenue
          </h3>
          <p className="text-2xl font-bold text-green-600">
            £{totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Monthly Costs
          </h3>
          <p className="text-2xl font-bold text-red-600">
            £{totalCosts.toLocaleString()}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            Gross Margin
          </h3>
          <p className="text-2xl font-bold text-purple-600">
            {grossMargin.toFixed(1)}%
          </p>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-indigo-900 mb-2">
            Net Margin
          </h3>
          <p className="text-2xl font-bold text-indigo-600">
            {totalRevenue > 0
              ? ((monthlyNetIncome / totalRevenue) * 100).toFixed(1)
              : "0.0"}
            %
          </p>
        </div>
      </div>
    </div>
  );
}
