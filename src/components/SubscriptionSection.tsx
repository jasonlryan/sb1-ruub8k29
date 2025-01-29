import React from 'react';
import { Table } from './Table';
import { Subscription, ActiveSubscribers } from '../types/model';
import { PlusCircle } from 'lucide-react';

interface SubscriptionSectionProps {
  subscriptions: Subscription[];
  activeSubscribers: ActiveSubscribers[];
  setSubscriptions: (subscriptions: Subscription[]) => void;
  setActiveSubscribers: (activeSubscribers: ActiveSubscribers[]) => void;
  onAddRow: (section: 'subscriptions' | 'activeSubscribers') => void;
  onDeleteSubscription: (index: number) => void;
  onDeleteActiveSubscriber: (index: number) => void;
  icon: React.ReactNode;
}

export function SubscriptionSection({
  subscriptions,
  activeSubscribers,
  setSubscriptions,
  setActiveSubscribers,
  onAddRow,
  onDeleteSubscription,
  onDeleteActiveSubscriber,
  icon
}: SubscriptionSectionProps) {
  const totals = {
    monthly: {
      subscribers: activeSubscribers[activeSubscribers.length - 1]?.endingSubs || 0,
      newDeals: activeSubscribers.reduce((sum, sub) => sum + sub.newDeals, 0),
      churnedSubs: activeSubscribers.reduce((sum, sub) => sum + sub.churnedSubs, 0)
    },
    annual: {
      newDeals: activeSubscribers.reduce((sum, sub) => sum + sub.newDeals, 0) * 12,
      churnedSubs: activeSubscribers.reduce((sum, sub) => sum + sub.churnedSubs, 0) * 12
    }
  };

  const getMonthlyChurnRate = (month: ActiveSubscribers) => {
    if (month.existingSubs === 0) return 0;
    return (month.churnedSubs / month.existingSubs) * 100;
  };

  const handleSubscriptionEdit = (rowIndex: number, field: keyof Subscription, value: string) => {
    const newSubscriptions = [...subscriptions];
    const subscription = { ...newSubscriptions[rowIndex] };
    
    if (field === 'monthlyPrice' || field === 'subscriberCount') {
      subscription[field] = parseFloat(value) || 0;
      subscription.mrr = subscription.monthlyPrice * subscription.subscriberCount;
    } else {
      subscription[field] = value;
    }
    
    newSubscriptions[rowIndex] = subscription;
    setSubscriptions(newSubscriptions);
  };

  const handleActiveSubscribersEdit = (rowIndex: number, field: keyof ActiveSubscribers, value: string) => {
    const newActiveSubscribers = [...activeSubscribers];
    const subscriber = { ...newActiveSubscribers[rowIndex] };
    
    if (field === 'newDeals' || field === 'churnedSubs') {
      subscriber[field] = parseFloat(value) || 0;
      subscriber.endingSubs = subscriber.existingSubs + subscriber.newDeals - subscriber.churnedSubs;
    } else if (field !== 'endingSubs') {
      subscriber[field] = value;
    }
    
    if (rowIndex < newActiveSubscribers.length - 1) {
      for (let i = rowIndex + 1; i < newActiveSubscribers.length; i++) {
        newActiveSubscribers[i].existingSubs = newActiveSubscribers[i - 1].endingSubs;
        newActiveSubscribers[i].endingSubs = 
          newActiveSubscribers[i].existingSubs + 
          newActiveSubscribers[i].newDeals - 
          newActiveSubscribers[i].churnedSubs;
      }
    }
    
    newActiveSubscribers[rowIndex] = subscriber;
    setActiveSubscribers(newActiveSubscribers);
  };

  const calculateRollingMetrics = () => {
    if (activeSubscribers.length < 3) return null;

    const last3Months = activeSubscribers.slice(-3);
    const avgChurnRate = last3Months.reduce((sum, month) => 
      sum + getMonthlyChurnRate(month), 0) / 3;
    const avgNewDeals = last3Months.reduce((sum, month) => 
      sum + month.newDeals, 0) / 3;

    return {
      churnRate: avgChurnRate.toFixed(1),
      newDeals: avgNewDeals.toFixed(1)
    };
  };

  const rollingMetrics = calculateRollingMetrics();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-2xl font-bold text-gray-900">Subscriptions & Churn</h2>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">3.1 Active Subscribers</h3>
          <button
            onClick={() => onAddRow('activeSubscribers')}
            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <PlusCircle className="w-4 h-4" />
            Add Month
          </button>
        </div>
        <Table
          headers={['Month', 'Existing Subs', 'New Deals', 'Churned', 'Churn Rate %', 'Ending Subs']}
          data={activeSubscribers.map((sub) => [
            sub.month,
            sub.existingSubs.toString(),
            sub.newDeals.toString(),
            sub.churnedSubs.toString(),
            getMonthlyChurnRate(sub).toFixed(1) + '%',
            sub.endingSubs.toString()
          ])}
          onEdit={(rowIndex, colIndex, value) => {
            const fields: (keyof ActiveSubscribers)[] = ['month', 'existingSubs', 'newDeals', 'churnedSubs', 'endingSubs'];
            handleActiveSubscribersEdit(rowIndex, fields[colIndex], value);
          }}
          onDelete={onDeleteActiveSubscriber}
          editableColumns={[true, true, true, true, false, false]}
        />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-semibold text-gray-700 mb-2">Current Metrics</h4>
            <p>Total Active Subscribers: {totals.monthly.subscribers}</p>
            <p>Latest Monthly Churn Rate: {
              activeSubscribers.length > 0 
                ? getMonthlyChurnRate(activeSubscribers[activeSubscribers.length - 1]).toFixed(1)
                : '0'
            }%</p>
            {rollingMetrics && (
              <>
                <p className="mt-2 text-sm text-gray-500">3-Month Rolling Averages:</p>
                <p className="text-sm text-gray-500">Churn Rate: {rollingMetrics.churnRate}%</p>
                <p className="text-sm text-gray-500">New Deals: {rollingMetrics.newDeals}</p>
              </>
            )}
          </div>
          <div className="p-4 bg-blue-50 rounded-md">
            <h4 className="font-semibold text-blue-700 mb-2">Annual Projection</h4>
            <p>Projected New Deals: {totals.annual.newDeals}</p>
            <p>Projected Churn: {totals.annual.churnedSubs}</p>
            <p>Net Annual Growth: {totals.annual.newDeals - totals.annual.churnedSubs}</p>
          </div>
        </div>
      </div>
    </div>
  );
}