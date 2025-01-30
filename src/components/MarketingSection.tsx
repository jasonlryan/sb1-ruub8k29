import React, { useState, useRef } from "react";
import { Table } from "./Table";
import {
  MarketingChannel,
  TableSection,
  HandleUpdateData,
} from "../types/model";
import { PlusCircle } from "lucide-react";
import { Dialog } from "@headlessui/react";

interface MarketingSectionProps {
  channels: MarketingChannel[];
  onUpdateChannel: HandleUpdateData<MarketingChannel>;
  onAddRow: (section: TableSection) => void;
  onDeleteChannel: (index: number) => void;
  icon: React.ReactNode;
}

export function MarketingSection({
  channels,
  onUpdateChannel,
  onAddRow,
  onDeleteChannel,
  icon,
}: MarketingSectionProps) {
  const totalBudget = channels.reduce(
    (sum, channel) => sum + (channel.monthlyBudget || 0),
    0
  );
  const totalLeads = channels.reduce(
    (sum, channel) => sum + (channel.leadsGenerated || 0),
    0
  );

  const fields = [
    "name",
    "monthlyBudget",
    "costPerLead",
    "leadsGenerated",
    "notes",
  ] as const as Array<keyof MarketingChannel>;

  const [isOpen, setIsOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    role: "",
    fte: "1",
    salaryPerFte: "0",
  });
  const [error, setError] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMember.role.trim()) {
      handleAddTeamMember();
    }
  };

  const handleAddTeamMember = () => {
    const isDuplicate = channels.some(
      (channel) => channel.name.toLowerCase() === newMember.role.toLowerCase()
    );

    if (isDuplicate) {
      setError("A channel with this name already exists");
      return;
    }

    onAddRow("marketing");

    setIsOpen(false);
    setNewMember({ role: "", fte: "1", salaryPerFte: "0" });
    setError("");
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
            onClick={() => onAddRow("marketing")}
            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <PlusCircle className="w-4 h-4" />
            Add Channel
          </button>
        </div>
        <Table
          headers={[
            "Channel",
            "Monthly Budget",
            "Cost per Lead",
            "Leads Generated",
            "Notes",
          ]}
          data={channels.map((channel) => [
            channel.name || "",
            `£${(channel.monthlyBudget || 0).toLocaleString()}`,
            `£${(channel.costPerLead || 0).toLocaleString()}`,
            (channel.leadsGenerated || 0).toString(),
            channel.notes || "",
          ])}
          onEdit={(rowIndex, colIndex, value) => {
            const cleanValue = value.replace(/[£,]/g, "");
            onUpdateChannel(rowIndex, fields[colIndex], cleanValue);
          }}
          onDelete={onDeleteChannel}
          editableColumns={[false, true, true, false, true]}
        />
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <p className="font-semibold">
            Total Monthly Budget: £{totalBudget.toLocaleString()}
          </p>
          <p className="font-semibold">
            Total Monthly Leads: {totalLeads.toLocaleString()}
          </p>
          <p className="font-semibold">
            Average Cost per Lead: £
            {totalLeads > 0 ? (totalBudget / totalLeads).toFixed(2) : "0.00"}
          </p>
        </div>
      </div>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-sm">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Add New Channel
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Channel Name
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={newMember.role}
                  onChange={(e) =>
                    setNewMember((prev) => ({ ...prev, role: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter channel name"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Monthly Budget
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">£</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={newMember.monthlyBudget}
                    onChange={(e) =>
                      setNewMember((prev) => ({
                        ...prev,
                        monthlyBudget: e.target.value,
                      }))
                    }
                    className="block w-full rounded-md border-gray-300 pl-7 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter monthly budget"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cost per Lead
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">£</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newMember.costPerLead}
                    onChange={(e) =>
                      setNewMember((prev) => ({
                        ...prev,
                        costPerLead: e.target.value,
                      }))
                    }
                    className="block w-full rounded-md border-gray-300 pl-7 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter cost per lead"
                  />
                </div>
              </div>

              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setNewMember({ role: "", fte: "1", salaryPerFte: "0" });
                    setError("");
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newMember.role.trim()}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Add Channel
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
