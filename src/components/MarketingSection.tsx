import React from 'react';
import { Table } from './Table';
import { MarketingChannel, Employee } from '../types/model';
import { PlusCircle } from 'lucide-react';

interface MarketingSectionProps {
  channels: MarketingChannel[];
  team: Employee[];
  onUpdateChannel: (index: number, field: keyof MarketingChannel, value: string) => void;
  onUpdateTeam: (index: number, field: keyof Employee, value: string) => void;
  onAddRow: (section: string) => void;
  onDeleteChannel: (index: number) => void;
  onDeleteTeam: (index: number) => void;
  icon: React.ReactNode;
}

export function MarketingSection({
  channels,
  team,
  onUpdateChannel,
  onUpdateTeam,
  onAddRow,
  onDeleteChannel,
  onDeleteTeam,
  icon
}: MarketingSectionProps) {
  const totalBudget = channels.reduce((sum, channel) => sum + channel.monthlyBudget, 0);
  const totalLeads = channels.reduce((sum, channel) => sum + channel.leadsGenerated, 0);
  const totalTeamCost = team.reduce((sum, employee) => sum + employee.monthlyTotal, 0);

  const handleChannelEdit = (rowIndex: number, colIndex: number, value: string) => {
    const fields: (keyof MarketingChannel)[] = ['name', 'monthlyBudget', 'costPerLead', 'leadsGenerated', 'notes'];
    onUpdateChannel(rowIndex, fields[colIndex], value);
  };

  const handleTeamEdit = (rowIndex: number, colIndex: number, value: string) => {
    const fields: (keyof Employee)[] = ['role', 'fte', 'salaryPerFte', 'monthlyTotal'];
    onUpdateTeam(rowIndex, fields[colIndex], value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-2xl font-bold text-gray-900">Marketing & Leads</h2>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">1.1 Channels & Budgets</h3>
          <button
            onClick={() => onAddRow('marketing')}
            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <PlusCircle className="w-4 h-4" />
            Add Channel
          </button>
        </div>
        <Table
          headers={['Channel', 'Monthly Budget', 'Cost per Lead', 'Leads Generated', 'Notes']}
          data={channels.map((channel) => [
            channel.name,
            `£${channel.monthlyBudget.toLocaleString()}`,
            `£${channel.costPerLead.toLocaleString()}`,
            channel.leadsGenerated.toString(),
            channel.notes
          ])}
          onEdit={handleChannelEdit}
          onDelete={onDeleteChannel}
          editableColumns={[true, true, true, false, true]}
        />
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <p className="font-semibold">Total Monthly Budget: £{totalBudget.toLocaleString()}</p>
          <p className="font-semibold">Total Monthly Leads: {totalLeads.toLocaleString()}</p>
          <p className="font-semibold">Average Cost per Lead: £{totalLeads > 0 ? (totalBudget / totalLeads).toFixed(2) : '0.00'}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">1.2 Marketing Team (Setter) FTE</h3>
          <button
            onClick={() => onAddRow('team')}
            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <PlusCircle className="w-4 h-4" />
            Add Team Member
          </button>
        </div>
        <Table
          headers={['Role', 'FTE', 'Annual Salary', 'Monthly Total']}
          data={team.map((employee) => [
            employee.role,
            employee.fte.toString(),
            `£${employee.salaryPerFte.toLocaleString()}`,
            `£${employee.monthlyTotal.toLocaleString()}`
          ])}
          onEdit={handleTeamEdit}
          onDelete={onDeleteTeam}
          editableColumns={[true, true, true, false]}
        />
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <p className="font-semibold">Total Monthly Team Cost: £{totalTeamCost.toLocaleString()}</p>
          <p className="font-semibold">Total Marketing Cost: £{(totalBudget + totalTeamCost).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}