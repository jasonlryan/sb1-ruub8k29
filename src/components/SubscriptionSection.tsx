import React from "react";
import { Table } from "./Table";
import { Subscription, ActiveSubscribers } from "../types/model";
import { PlusCircle, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabase";

interface SubscriptionSectionProps {
  subscriptions: Subscription[];
  activeSubscribers: ActiveSubscribers[];
  setSubscriptions: (subscriptions: Subscription[]) => void;
  setActiveSubscribers: (activeSubscribers: ActiveSubscribers[]) => void;
  onAddRow: (section: "subscriptions" | "activeSubscribers") => void;
  onDeleteSubscription: (index: number) => void;
  onDeleteActiveSubscriber: (index: number) => void;
  icon: React.ReactNode;
  funnelConversions: FunnelConversion[];
}

export function SubscriptionSection({
  subscriptions,
  activeSubscribers,
  setSubscriptions,
  setActiveSubscribers,
  onAddRow,
  onDeleteSubscription,
  onDeleteActiveSubscriber,
  icon,
  funnelConversions,
}: SubscriptionSectionProps) {
  const totals = {
    monthly: {
      subscribers:
        activeSubscribers[activeSubscribers.length - 1]?.endingSubs || 0,
      newDeals: activeSubscribers.reduce((sum, sub) => sum + sub.newDeals, 0),
      churnedSubs: activeSubscribers.reduce(
        (sum, sub) => sum + sub.churnedSubs,
        0
      ),
    },
    annual: {
      newDeals:
        activeSubscribers.reduce((sum, sub) => sum + sub.newDeals, 0) * 12,
      churnedSubs:
        activeSubscribers.reduce((sum, sub) => sum + sub.churnedSubs, 0) * 12,
    },
  };

  const getMonthlyChurnRate = (month: ActiveSubscribers) => {
    if (month.existingSubs === 0) return 0;
    return (month.churnedSubs / month.existingSubs) * 100;
  };

  const handleSubscriptionEdit = (
    rowIndex: number,
    field: keyof Subscription,
    value: string
  ) => {
    const newSubscriptions = [...subscriptions];
    const subscription = { ...newSubscriptions[rowIndex] };

    if (field === "monthlyPrice" || field === "subscriberCount") {
      subscription[field] = parseFloat(value) || 0;
      subscription.mrr =
        subscription.monthlyPrice * subscription.subscriberCount;
    } else {
      subscription[field] = value;
    }

    newSubscriptions[rowIndex] = subscription;
    setSubscriptions(newSubscriptions);
  };

  const handleActiveSubscribersEdit = (
    rowIndex: number,
    field: keyof ActiveSubscribers,
    value: string
  ) => {
    const newActiveSubscribers = [...activeSubscribers];
    const subscriber = { ...newActiveSubscribers[rowIndex] };

    // Update the edited field
    if (
      field === "newDeals" ||
      field === "churnedSubs" ||
      field === "existingSubs"
    ) {
      subscriber[field] = parseFloat(value) || 0;
    } else {
      subscriber[field] = value;
    }

    // Calculate ending subs for current month
    subscriber.endingSubs =
      subscriber.existingSubs + subscriber.newDeals - subscriber.churnedSubs;

    newActiveSubscribers[rowIndex] = subscriber;

    // Update all subsequent months
    for (let i = rowIndex + 1; i < newActiveSubscribers.length; i++) {
      const currentMonth = { ...newActiveSubscribers[i] };
      // Set existing subs to previous month's ending subs
      currentMonth.existingSubs = newActiveSubscribers[i - 1].endingSubs;
      // Calculate new ending subs
      currentMonth.endingSubs =
        currentMonth.existingSubs +
        currentMonth.newDeals -
        currentMonth.churnedSubs;
      newActiveSubscribers[i] = currentMonth;
    }

    setActiveSubscribers(newActiveSubscribers);
  };

  const calculateRollingMetrics = () => {
    if (activeSubscribers.length < 3) return null;

    const last3Months = activeSubscribers.slice(-3);
    const avgChurnRate =
      last3Months.reduce((sum, month) => sum + getMonthlyChurnRate(month), 0) /
      3;
    const avgNewDeals =
      last3Months.reduce((sum, month) => sum + month.newDeals, 0) / 3;

    return {
      churnRate: avgChurnRate.toFixed(1),
      newDeals: avgNewDeals.toFixed(1),
    };
  };

  const calculateTotalDeals = () => {
    return funnelConversions.reduce((sum, conv) => sum + conv.deals, 0);
  };

  const handleSyncWithFunnel = async () => {
    const totalDeals = calculateTotalDeals();
    const newSubscribers = [...activeSubscribers];

    try {
      // First delete existing records for this user
      const { error: deleteError } = await supabase
        .from("active_subscribers")
        .delete()
        .eq("user_id", activeSubscribers[0].user_id);

      if (deleteError) throw deleteError;

      // Update each month's data
      activeSubscribers.forEach((sub, index) => {
        if (index === 0) {
          newSubscribers[index] = {
            ...sub,
            existingSubs: 0,
            newDeals: totalDeals,
            churnedSubs: sub.churnedSubs || 0,
            endingSubs: totalDeals - (sub.churnedSubs || 0),
            user_id: sub.user_id,
          };
        } else {
          const prevMonth = newSubscribers[index - 1];
          newSubscribers[index] = {
            ...sub,
            existingSubs: prevMonth.endingSubs,
            newDeals: totalDeals,
            churnedSubs: sub.churnedSubs || 0,
            endingSubs:
              prevMonth.endingSubs + totalDeals - (sub.churnedSubs || 0),
            user_id: sub.user_id,
          };
        }
      });

      // Insert new records
      const { error: insertError } = await supabase
        .from("active_subscribers")
        .insert(
          newSubscribers.map((sub) => ({
            month: sub.month,
            existing_subs: sub.existingSubs || 0,
            new_deals: sub.newDeals || 0,
            churned_subs: sub.churnedSubs || 0,
            ending_subs: sub.endingSubs || 0,
            user_id: sub.user_id,
          }))
        );

      if (insertError) throw insertError;
      setActiveSubscribers(newSubscribers);
    } catch (err) {
      console.error("Error syncing with funnel:", err);
    }
  };

  const handleAddMonth = async () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const lastMonth = activeSubscribers[activeSubscribers.length - 1];
    const lastMonthIndex = months.indexOf(lastMonth.month);
    const nextMonthIndex = (lastMonthIndex + 1) % 12;

    const newMonth = {
      month: months[nextMonthIndex],
      existingSubs: lastMonth.endingSubs,
      newDeals: 114, // Keep pattern
      churnedSubs: 0,
      endingSubs: lastMonth.endingSubs + 114, // Initial calculation
      user_id: lastMonth.user_id,
    };

    try {
      const { error } = await supabase
        .from("active_subscribers")
        .insert([newMonth]);

      if (error) throw error;
      setActiveSubscribers([...activeSubscribers, newMonth]);
    } catch (err) {
      console.error("Error adding month:", err);
    }
  };

  const rollingMetrics = calculateRollingMetrics();

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
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">3.1 Active Subscribers</h3>
            <div className="flex gap-2">
              <button
                onClick={handleSyncWithFunnel}
                className="flex items-center gap-2 px-3 py-1 text-sm text-green-600 hover:text-green-700"
              >
                <RefreshCw className="w-4 h-4" />
                Sync with Funnel
              </button>
              <button
                onClick={handleAddMonth}
                className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <PlusCircle className="w-4 h-4" />
                Add Month
              </button>
            </div>
          </div>
        </div>
        <Table
          headers={[
            "Month",
            "Existing Subs",
            "New Deals",
            "Churned Subs",
            "Ending Subs",
          ]}
          data={(activeSubscribers || []).map((sub) => [
            sub?.month || "",
            sub?.existingSubs?.toString() || "0",
            sub?.newDeals?.toString() || "0",
            sub?.churnedSubs?.toString() || "0",
            sub?.endingSubs?.toString() || "0",
          ])}
          onEdit={(rowIndex, colIndex, value) => {
            const fields: (keyof ActiveSubscribers)[] = [
              "month",
              "existingSubs",
              "newDeals",
              "churnedSubs",
              "endingSubs",
            ];
            handleActiveSubscribersEdit(rowIndex, fields[colIndex], value);
          }}
          editableColumns={[false, true, false, true, false]}
          inputTypes={["text", "number", "number", "number", "number"]}
          stepValues={["", "1", "1", "1", "1"]}
        />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-semibold text-gray-700 mb-2">
              Current Metrics
            </h4>
            <p>Total Active Subscribers: {totals.monthly.subscribers}</p>
            <p>
              Latest Monthly Churn Rate:{" "}
              {activeSubscribers.length > 0
                ? getMonthlyChurnRate(
                    activeSubscribers[activeSubscribers.length - 1]
                  ).toFixed(1)
                : "0"}
              %
            </p>
            {rollingMetrics && (
              <>
                <p className="mt-2 text-sm text-gray-500">
                  3-Month Rolling Averages:
                </p>
                <p className="text-sm text-gray-500">
                  Churn Rate: {rollingMetrics.churnRate}%
                </p>
                <p className="text-sm text-gray-500">
                  New Deals: {rollingMetrics.newDeals}
                </p>
              </>
            )}
          </div>
          <div className="p-4 bg-blue-50 rounded-md">
            <h4 className="font-semibold text-blue-700 mb-2">
              Annual Projection
            </h4>
            <p>Projected New Deals: {totals.annual.newDeals}</p>
            <p>Projected Churn: {totals.annual.churnedSubs}</p>
            <p>
              Net Annual Growth:{" "}
              {totals.annual.newDeals - totals.annual.churnedSubs}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
