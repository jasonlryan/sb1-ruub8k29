import React from 'react';
import { Table } from './Table';
import { Subscription, COGS } from '../types/model';
import { PlusCircle } from 'lucide-react';

interface RevenueSectionProps {
  subscriptions: Subscription[];
  setSubscriptions: (subscriptions: Subscription[]) => void;
  cogs: COGS[];
  setCogs: (cogs: COGS[]) => void;
  onAddRow: () => void;
  onDeleteCogs: (index: number) => void;
  icon: React.ReactNode;
}

export function RevenueSection({
  subscriptions,
  setSubscriptions,
  cogs,
  setCogs,
  onAddRow,
  onDeleteCogs,
  icon
}: RevenueSectionProps) {
  const totals = {
    monthly: {
      mrr: subscriptions.reduce((sum, sub) => sum + sub.mrr, 0),
      cogs: cogs.reduce((sum, cost) => sum + cost.monthlyCost, 0),
      subscribers: subscriptions.reduce((sum, sub) => sum + sub.subscriberCount, 0)
    },
    annual: {
      arr: subscriptions.reduce((sum, sub) => sum + sub.mrr, 0) * 12,
      cogs: cogs.reduce((sum, cost) => sum + cost.monthlyCost, 0) * 12
    }
  };

  const margins = {
    grossMargin: totals.monthly.mrr ? ((totals.monthly.mrr - totals.monthly.cogs) / totals.monthly.mrr * 100).toFixed(1) : '0.0',
    avgRevenuePerUser: totals.monthly.subscribers ? (totals.monthly.mrr / totals.monthly.subscribers).toFixed(2) : '0.00'
  };

  const handleSubscriptionEdit = (rowIndex: number, colIndex: number, value: string) => {
    const newSubscriptions = [...subscriptions];
    const subscription = { ...newSubscriptions[rowIndex] };
    const fields: (keyof Subscription)[] = ['tier', 'monthlyPrice', 'subscriberCount', 'mrr'];
    const field = fields[colIndex];
    
    if (field === 'monthlyPrice' || field === 'subscriberCount') {
      const numValue = parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
      subscription[field] = numValue;
      subscription.mrr = subscription.monthlyPrice * subscription.subscriberCount;
    } else if (field === 'tier') {
      subscription.tier = value;
    }
    
    newSubscriptions[rowIndex] = subscription;
    setSubscriptions(newSubscriptions);
  };

  const handleCogsEdit = (rowIndex: number, colIndex: number, value: string) => {
    const newCogs = [...cogs];
    const cost = { ...newCogs[rowIndex] };
    const fields: (keyof COGS)[] = ['category', 'monthlyCost', 'notes'];
    const field = fields[colIndex];
    
    if (field === 'monthlyCost') {
      cost[field] = parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
    } else {
      cost[field] = value;
    }
    
    newCogs[rowIndex] = cost;
    setCogs(newCogs);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-2xl font-bold text-gray-900">Revenue Calculation</h2>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">4.1 Subscription Pricing & MRR</h3>
          <button
            onClick={onAddRow}
            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <PlusCircle className="w-4 h-4" />
            Add Subscription Tier
          </button>
        </div>
        <Table
          headers={['Tier', 'Monthly Price', 'Subscribers', 'MRR']}
          data={subscriptions.map((sub) => [
            sub.tier,
            `£${sub.monthlyPrice}`,
            sub.subscriberCount.toString(),
            `£${sub.mrr.toLocaleString()}`
          ])}
          onEdit={handleSubscriptionEdit}
          editableColumns={[true, true, true, false]}
        />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-semibold text-gray-700 mb-2">Monthly Revenue</h4>
            <p>Total MRR: £{totals.monthly.mrr.toLocaleString()}</p>
            <p>Total Subscribers: {totals.monthly.subscribers}</p>
            <p>Avg. Revenue Per User: £{margins.avgRevenuePerUser}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-md">
            <h4 className="font-semibold text-blue-700 mb-2">Annual Revenue</h4>
            <p>Total ARR: £{totals.annual.arr.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">4.2 COGS & Gross Margin</h3>
          <button
            onClick={onAddRow}
            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <PlusCircle className="w-4 h-4" />
            Add COGS
          </button>
        </div>
        <Table
          headers={['Category', 'Monthly Cost', 'Notes']}
          data={cogs.map((cost) => [
            cost.category,
            `£${cost.monthlyCost.toLocaleString()}`,
            cost.notes
          ])}
          onEdit={handleCogsEdit}
          onDelete={onDeleteCogs}
          editableColumns={[true, true, true]}
        />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-semibold text-gray-700 mb-2">Monthly COGS</h4>
            <p>Total COGS: £{totals.monthly.cogs.toLocaleString()}</p>
            <p>Gross Margin: {margins.grossMargin}%</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-md">
            <h4 className="font-semibold text-blue-700 mb-2">Annual COGS</h4>
            <p>Total COGS: £{totals.annual.cogs.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}