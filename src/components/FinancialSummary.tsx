import React from 'react';
import { Table } from './Table';

interface FinancialSummaryProps {
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
  sectionTotals 
}: FinancialSummaryProps) {
  const monthlyNetIncome = totalRevenue - totalCosts;
  const annualNetIncome = annualRevenue - annualCosts;
  const grossMargin = ((totalRevenue - sectionTotals.cogs) / totalRevenue * 100).toFixed(1);
  const operatingMargin = (monthlyNetIncome / totalRevenue * 100).toFixed(1);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Revenue Breakdown</h3>
          <div className="space-y-2">
            <p className="flex justify-between">
              <span>Monthly Revenue:</span>
              <span className="font-semibold">£{totalRevenue.toLocaleString()}</span>
            </p>
            <p className="flex justify-between">
              <span>Annual Revenue (ARR):</span>
              <span className="font-semibold">£{annualRevenue.toLocaleString()}</span>
            </p>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-red-900 mb-4">Cost Breakdown</h3>
          <div className="space-y-2">
            <p className="flex justify-between">
              <span>Marketing:</span>
              <span>£{sectionTotals.marketing.toLocaleString()}</span>
            </p>
            <p className="flex justify-between">
              <span>COGS:</span>
              <span>£{sectionTotals.cogs.toLocaleString()}</span>
            </p>
            <p className="flex justify-between">
              <span>Payroll:</span>
              <span>£{sectionTotals.payroll.toLocaleString()}</span>
            </p>
            <p className="flex justify-between">
              <span>Operating Expenses:</span>
              <span>£{sectionTotals.opex.toLocaleString()}</span>
            </p>
            <p className="flex justify-between font-semibold border-t border-red-200 pt-2">
              <span>Total Monthly Costs:</span>
              <span>£{totalCosts.toLocaleString()}</span>
            </p>
            <p className="flex justify-between font-semibold">
              <span>Total Annual Costs:</span>
              <span>£{annualCosts.toLocaleString()}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Monthly Net Income</h3>
          <p className={`text-2xl font-bold ${monthlyNetIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            £{monthlyNetIncome.toLocaleString()}
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Annual Net Income</h3>
          <p className={`text-2xl font-bold ${annualNetIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            £{annualNetIncome.toLocaleString()}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">Gross Margin</h3>
          <p className="text-2xl font-bold text-purple-600">{grossMargin}%</p>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-indigo-900 mb-2">Operating Margin</h3>
          <p className="text-2xl font-bold text-indigo-600">{operatingMargin}%</p>
        </div>
      </div>
    </div>
  );
}