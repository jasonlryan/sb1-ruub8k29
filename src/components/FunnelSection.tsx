import React from "react";
import { Table } from "./Table";
import { FunnelConversion } from "../types/model";
import { PlusCircle } from "lucide-react";

interface FunnelSectionProps {
  conversions: FunnelConversion[];
  setConversions: React.Dispatch<React.SetStateAction<FunnelConversion[]>>;
  onAddRow: () => void;
  onDelete: (index: number) => void;
  icon: React.ReactNode;
}

export function FunnelSection({
  conversions,
  setConversions,
  onAddRow,
  onDelete,
  icon,
}: FunnelSectionProps) {
  const totals = {
    monthly: {
      totalMql: conversions.reduce((sum, conv) => sum + conv.mql, 0),
      totalSql: conversions.reduce((sum, conv) => sum + conv.sql, 0),
      totalDeals: conversions.reduce((sum, conv) => sum + conv.deals, 0),
    },
    annual: {
      totalMql: conversions.reduce((sum, conv) => sum + conv.mql, 0) * 12,
      totalSql: conversions.reduce((sum, conv) => sum + conv.sql, 0) * 12,
      totalDeals: conversions.reduce((sum, conv) => sum + conv.deals, 0) * 12,
    },
  };

  const avgConversionRates = {
    mqlToSql: totals.monthly.totalMql
      ? ((totals.monthly.totalSql / totals.monthly.totalMql) * 100).toFixed(1)
      : "0.0",
    sqlToDeal: totals.monthly.totalSql
      ? ((totals.monthly.totalDeals / totals.monthly.totalSql) * 100).toFixed(1)
      : "0.0",
  };

  const handleConversionEdit = (
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    const conv = { ...conversions[rowIndex] };
    const numericValue = parseFloat(value.replace(/%/g, "")) || 0;

    switch (colIndex) {
      case 2: // MQL → SQL Rate
        conv.mqlToSqlRate = numericValue;
        conv.sql = Math.floor(conv.mql * (numericValue / 100));
        conv.deals = Math.floor(conv.sql * (conv.sqlToDealRate / 100));
        break;
      case 4: // SQL → Deal Rate
        conv.sqlToDealRate = numericValue;
        conv.deals = Math.floor(conv.sql * (numericValue / 100));
        break;
    }

    setConversions((prev) => prev.map((c, i) => (i === rowIndex ? conv : c)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-2xl font-bold text-gray-900">Funnel Conversions</h2>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            2.1 From MQL to SQL (Setter Process)
          </h3>
          <button
            onClick={onAddRow}
            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <PlusCircle className="w-4 h-4" />
            Add Channel
          </button>
        </div>
        <Table
          headers={["Channel", "MQLs", "MQL → SQL Rate", "SQLs"]}
          data={conversions.map((conv) => [
            conv.channel,
            conv.mql.toString(),
            `${conv.mqlToSqlRate}%`,
            conv.sql.toString(),
          ])}
          onEdit={(rowIndex, colIndex, value) => {
            handleConversionEdit(rowIndex, colIndex, value);
          }}
          onDelete={onDelete}
          editableColumns={[false, false, true, false]}
        />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-semibold text-gray-700 mb-2">Monthly Totals</h4>
            <p>Total MQLs: {totals.monthly.totalMql}</p>
            <p>Total SQLs: {totals.monthly.totalSql}</p>
            <p>Average Conversion: {avgConversionRates.mqlToSql}%</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-md">
            <h4 className="font-semibold text-blue-700 mb-2">
              Annual Projection
            </h4>
            <p>Total MQLs: {totals.annual.totalMql}</p>
            <p>Total SQLs: {totals.annual.totalSql}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            2.2 From SQL to Deal (Closer Process)
          </h3>
        </div>
        <Table
          headers={["Channel", "SQLs", "SQL → Deal Rate", "New Deals"]}
          data={conversions.map((conv) => [
            conv.channel,
            conv.sql.toString(),
            `${conv.sqlToDealRate}%`,
            conv.deals.toString(),
          ])}
          onEdit={(rowIndex, colIndex, value) => {
            handleConversionEdit(rowIndex, colIndex, value);
          }}
          onDelete={onDelete}
          editableColumns={[false, false, true, false]}
        />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-semibold text-gray-700 mb-2">Monthly Totals</h4>
            <p>Total SQLs: {totals.monthly.totalSql}</p>
            <p>Total Deals: {totals.monthly.totalDeals}</p>
            <p>Average Conversion: {avgConversionRates.sqlToDeal}%</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-md">
            <h4 className="font-semibold text-blue-700 mb-2">
              Annual Projection
            </h4>
            <p>Total SQLs: {totals.annual.totalSql}</p>
            <p>Total Deals: {totals.annual.totalDeals}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
