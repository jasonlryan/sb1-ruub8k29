import React, { useMemo } from "react";
import { Table } from "./Table";
import { FundingRound } from "../types/model";
import { PlusCircle } from "lucide-react";

interface FundingSectionProps {
  fundingRounds: FundingRound[];
  setFundingRounds: (rounds: FundingRound[]) => void;
  onAddRow: () => void;
  onDeleteRound: (index: number) => void;
  icon: React.ReactNode;
}

export function FundingSection({
  fundingRounds,
  setFundingRounds,
  onAddRow,
  onDeleteRound,
  icon,
}: FundingSectionProps) {
  // Calculate totals and valuations for each round
  const roundsWithValuations = useMemo(() => {
    return fundingRounds.map((round) => ({
      ...round,
      valuationPost: round.valuationPre + round.amountRaised,
    }));
  }, [fundingRounds]);

  const totals = useMemo(() => {
    const latest = roundsWithValuations[roundsWithValuations.length - 1];
    return {
      totalRaised: roundsWithValuations.reduce(
        (sum, r) => sum + r.amountRaised,
        0
      ),
      totalEquitySold: roundsWithValuations.reduce(
        (sum, r) => sum + r.equitySold,
        0
      ),
      latestValuation: latest ? latest.valuationPost : 0,
    };
  }, [roundsWithValuations]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-2xl font-bold text-gray-900">Financing</h2>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">6.1 Equity Funding</h3>
          <button
            onClick={onAddRow}
            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <PlusCircle className="w-4 h-4" />
            Add Round
          </button>
        </div>

        <Table
          headers={[
            "Round",
            "Amount Raised",
            "Valuation (Pre)",
            "Valuation (Post)",
            "% Equity Sold",
            "Close Date",
          ]}
          data={roundsWithValuations.map((round) => [
            round.round,
            `£${round.amountRaised.toLocaleString()}`,
            `£${round.valuationPre.toLocaleString()}`,
            `£${round.valuationPost.toLocaleString()}`,
            `${round.equitySold}%`,
            round.closeDate,
          ])}
          onDelete={onDeleteRound}
          editableColumns={[true, true, true, false, false, true]}
          inputTypes={["text", "number", "number", "number", "number", "text"]}
        />

        <div className="mt-4">
          <h4 className="font-semibold mb-2">Funding Summary</h4>
          <p>Total Amount Raised: £{totals.totalRaised.toLocaleString()}</p>
          <p>Total Equity Sold: {totals.totalEquitySold}%</p>
          <p>Latest Valuation: £{totals.latestValuation.toLocaleString()}</p>
          <p>Remaining Equity: {(100 - totals.totalEquitySold).toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}
