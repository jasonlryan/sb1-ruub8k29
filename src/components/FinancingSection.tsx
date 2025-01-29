import React from 'react';
import { Table } from './Table';
import { FundingRound } from '../types/model';
import { PlusCircle } from 'lucide-react';

interface FinancingSectionProps {
  fundingRounds: FundingRound[];
  setFundingRounds: (rounds: FundingRound[]) => void;
  onAddRow: () => void;
  onDelete: (index: number) => void;
  icon: React.ReactNode;
}

export function FinancingSection({
  fundingRounds,
  setFundingRounds,
  onAddRow,
  onDelete,
  icon
}: FinancingSectionProps) {
  const totals = {
    totalRaised: fundingRounds.reduce((sum, round) => sum + round.amountRaised, 0),
    totalEquitySold: fundingRounds.reduce((sum, round) => sum + round.equitySold, 0),
    latestValuation: fundingRounds[fundingRounds.length - 1]?.valuationPre || 0
  };

  const handleEdit = (rowIndex: number, field: keyof FundingRound, value: string) => {
    const newRounds = [...fundingRounds];
    const round = { ...newRounds[rowIndex] };
    
    if (field === 'amountRaised' || field === 'valuationPre' || field === 'equitySold') {
      round[field] = parseFloat(value) || 0;
    } else {
      round[field] = value;
    }
    
    newRounds[rowIndex] = round;
    setFundingRounds(newRounds);
  };

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
          headers={['Round', 'Amount Raised', 'Valuation (Pre)', '% Equity Sold', 'Close Date']}
          data={fundingRounds.map((round) => [
            round.round,
            `£${round.amountRaised.toLocaleString()}`,
            `£${round.valuationPre.toLocaleString()}`,
            `${round.equitySold}%`,
            round.closeDate
          ])}
          onEdit={(rowIndex, colIndex, value) => {
            const fields: (keyof FundingRound)[] = ['round', 'amountRaised', 'valuationPre', 'equitySold', 'closeDate'];
            handleEdit(rowIndex, fields[colIndex], value);
          }}
          onDelete={onDelete}
          editableColumns={[true, true, true, true, true]}
        />
        <div className="mt-4 p-4 bg-gray-50 rounded-md space-y-2">
          <h4 className="font-semibold text-gray-700 mb-2">Funding Summary</h4>
          <p>Total Amount Raised: £{totals.totalRaised.toLocaleString()}</p>
          <p>Total Equity Sold: {totals.totalEquitySold}%</p>
          <p>Latest Valuation: £{totals.latestValuation.toLocaleString()}</p>
          <p>Remaining Equity: {(100 - totals.totalEquitySold).toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}