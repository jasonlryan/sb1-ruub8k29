import React from "react";
import { Table } from "./Table";
import { ActiveSubscriber } from "../types/model";

interface SubscriptionsSectionProps {
  activeSubscribers: ActiveSubscriber[];
  setActiveSubscribers: (subs: ActiveSubscriber[]) => void;
  onAddRow: () => void;
  onDelete: (index: number) => void;
  icon: React.ReactNode;
}

export function SubscriptionsSection({
  activeSubscribers,
  setActiveSubscribers,
  onAddRow,
  onDelete,
  icon,
}: SubscriptionsSectionProps) {
  const handleSubscriptionEdit = (
    rowIndex: number,
    field: keyof ActiveSubscriber,
    value: string
  ) => {
    const newSubscriptions = [...activeSubscribers];
    const subscription = { ...newSubscriptions[rowIndex] };

    // Update the edited field
    subscription[field] = parseFloat(value) || 0;

    // Update this month's ending subs
    subscription.endingSubs =
      subscription.existingSubs +
      subscription.newDeals -
      subscription.churnedSubs;

    // Update next month's existing subs if there is a next month
    if (rowIndex < activeSubscribers.length - 1) {
      newSubscriptions[rowIndex + 1].existingSubs = subscription.endingSubs;
    }

    newSubscriptions[rowIndex] = subscription;
    setActiveSubscribers(newSubscriptions);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-2xl font-bold text-gray-900">
          Subscriptions & Churn
        </h2>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">3.1 Active Subscribers</h3>
          <button
            onClick={onAddRow}
            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
          >
            Add Month
          </button>
        </div>

        <Table
          headers={[
            "Month",
            "Existing Subs",
            "New Deals",
            "Churned Subs",
            "Ending Subs",
          ]}
          data={activeSubscribers.map((sub) => [
            sub.month,
            sub.existingSubs.toString(),
            sub.newDeals.toString(),
            sub.churnedSubs.toString(),
            (sub.existingSubs + sub.newDeals - sub.churnedSubs).toString(),
          ])}
          onEdit={(rowIndex, colIndex, value) => {
            const fields: (keyof ActiveSubscriber)[] = [
              "month",
              "existingSubs",
              "newDeals",
              "churnedSubs",
            ];
            handleSubscriptionEdit(rowIndex, fields[colIndex], value);
          }}
          onDelete={onDelete}
          editableColumns={[false, true, true, true, false]}
          inputTypes={["text", "number", "number", "number", "number"]}
          stepValues={["", "1", "1", "1", "1"]}
        />
      </div>
    </div>
  );
}
