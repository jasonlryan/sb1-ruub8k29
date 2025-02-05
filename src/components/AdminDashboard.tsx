import React from "react";
import { useSupabase } from "../contexts/SupabaseContext";
import { supabase } from "../lib/supabase";

interface AggregateData {
  totalUsers: number;
  averageRevenue: number;
  totalSubscribers: number;
  averageChurnRate: number;
}

export function AdminDashboard() {
  const { isAdmin } = useSupabase();
  const [aggregateData, setAggregateData] =
    React.useState<AggregateData | null>(null);

  React.useEffect(() => {
    if (!isAdmin) return;

    const fetchAggregateData = async () => {
      try {
        // Get total users with proper type assertion
        const { count } = await supabase
          .from("profiles")
          .select("*", { count: "exact" });

        const totalUsers = count ?? 0;

        // Get subscription data
        const { data: subscriptionData } = await supabase
          .from("subscriptions")
          .select("mrr, subscriber_count");

        // Get churn data
        const { data: churnData } = await supabase
          .from("active_subscribers")
          .select("churned_subs, existing_subs");

        if (!subscriptionData || !churnData) {
          throw new Error("Failed to fetch data");
        }

        // Calculate aggregates
        const totalRevenue = subscriptionData.reduce(
          (sum, sub) => sum + (sub.mrr ?? 0),
          0
        );

        const totalSubscribers = subscriptionData.reduce(
          (sum, sub) => sum + (sub.subscriber_count ?? 0),
          0
        );

        const averageChurnRate = churnData.length
          ? churnData.reduce((sum, data) => {
              return data.existing_subs > 0
                ? sum + (data.churned_subs / data.existing_subs) * 100
                : sum;
            }, 0) / churnData.length
          : 0;

        setAggregateData({
          totalUsers,
          averageRevenue: totalUsers ? totalRevenue / totalUsers : 0,
          totalSubscribers,
          averageChurnRate,
        });
      } catch (error) {
        console.error("Error fetching aggregate data:", error);
      }
    };

    fetchAggregateData();
  }, [isAdmin]);

  if (!isAdmin) {
    return <div>Access Denied</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      {aggregateData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Users</h3>
            <p className="text-2xl">{aggregateData.totalUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Average Revenue/User</h3>
            <p className="text-2xl">
              £{aggregateData.averageRevenue.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Subscribers</h3>
            <p className="text-2xl">{aggregateData.totalSubscribers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Average Churn Rate</h3>
            <p className="text-2xl">
              {aggregateData.averageChurnRate.toFixed(1)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
