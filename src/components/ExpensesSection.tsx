import React, { useState, useRef } from "react";
import { Table } from "./Table";
import { Department, OperatingExpense } from "../types/model";
import { PlusCircle } from "lucide-react";
import { Dialog } from "@headlessui/react";
import { supabase } from "../lib/supabase";
import { useSupabase } from "../contexts/SupabaseContext";

interface ExpensesSectionProps {
  departments: Department[];
  operatingExpenses: OperatingExpense[];
  setDepartments: (departments: Department[]) => void;
  setOperatingExpenses: (expenses: OperatingExpense[]) => void;
  onAddRow: (section: "departments" | "opex") => void;
  onDeleteDepartment: (index: number) => void;
  onDeleteOperatingExpense: (index: number) => void;
  icon: React.ReactNode;
}

export function ExpensesSection({
  departments,
  operatingExpenses,
  setDepartments,
  setOperatingExpenses,
  onAddRow,
  onDeleteDepartment,
  onDeleteOperatingExpense,
  icon,
}: ExpensesSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    fte: "1",
    salary: "0",
    additionalCosts: "0",
  });
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useSupabase();

  // Define editable columns configuration
  const editableColumns = [true, true, true, true, false];

  const totals = {
    monthly: {
      payroll: departments.reduce((sum, dept) => sum + dept.monthlyTotal, 0),
      opex: operatingExpenses.reduce((sum, exp) => sum + exp.monthlyCost, 0),
      totalFte: departments.reduce((sum, dept) => sum + dept.fte, 0),
    },
    annual: {
      payroll:
        departments.reduce((sum, dept) => sum + dept.monthlyTotal, 0) * 12,
      opex:
        operatingExpenses.reduce((sum, exp) => sum + exp.monthlyCost, 0) * 12,
    },
  };

  const handleDepartmentEdit = (
    rowIndex: number,
    field: keyof Department,
    value: string
  ) => {
    const newDepartments = [...departments];
    const department = { ...newDepartments[rowIndex] };

    // Clean the input value first
    const cleanValue = value.replace(/[£,%]/g, "");

    switch (field) {
      case "fte":
        department.fte = parseFloat(cleanValue) || 0;
        break;
      case "salary":
        department.salary = parseFloat(cleanValue) || 0;
        break;
      case "additionalCosts":
        department.additionalCosts = parseFloat(cleanValue) || 0;
        break;
      default:
        department[field] = cleanValue;
    }

    // Recalculate monthly total
    department.monthlyTotal = Math.round(
      (department.salary / 12) *
        department.fte *
        (1 + department.additionalCosts / 100)
    );

    newDepartments[rowIndex] = department;
    setDepartments(newDepartments);

    if (user) {
      supabase
        .from("departments")
        .update({
          name: department.name,
          fte: department.fte,
          salary: department.salary,
          additional_costs: department.additionalCosts,
          monthly_total: department.monthlyTotal,
        })
        .eq("user_id", user.id)
        .eq("name", department.name);
    }
  };

  const handleOpexEdit = (
    rowIndex: number,
    field: keyof OperatingExpense,
    value: string
  ) => {
    const newExpenses = [...operatingExpenses];
    const expense = { ...newExpenses[rowIndex] };

    if (field === "monthlyCost") {
      expense[field] = parseFloat(value) || 0;
    } else {
      expense[field] = value;
    }

    newExpenses[rowIndex] = expense;
    setOperatingExpenses(newExpenses);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDepartment.name.trim()) {
      handleAddDepartment();
    }
  };

  const handleAddDepartment = () => {
    const isDuplicate = departments.some(
      (dept) => dept.name.toLowerCase() === newDepartment.name.toLowerCase()
    );

    if (isDuplicate) {
      setError("A department with this name already exists");
      return;
    }

    onAddRow("departments", {
      name: newDepartment.name,
      fte: parseFloat(newDepartment.fte),
      salary: parseFloat(newDepartment.salary),
      additional_costs: parseFloat(newDepartment.additionalCosts),
    });

    setIsOpen(false);
    setNewDepartment({
      name: "",
      fte: "1",
      salary: "0",
      additionalCosts: "0",
    });
    setError("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-2xl font-bold text-gray-900">Operating Expenses</h2>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">5.1 Departments & Headcount</h3>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <PlusCircle className="w-4 h-4" />
            Add Department
          </button>
        </div>

        <Table
          headers={[
            "Department",
            "FTE",
            "Salary",
            "Additional Costs",
            "Monthly Total",
          ]}
          data={departments.map((dept) => [
            dept.name,
            dept.fte.toString(),
            dept.salary.toString(),
            dept.additionalCosts.toString(),
            `£${dept.monthlyTotal.toLocaleString()}`,
          ])}
          onEdit={(rowIndex, colIndex, value) => {
            const fields: (keyof Department)[] = [
              "name",
              "fte",
              "salary",
              "additionalCosts",
              "monthlyTotal",
            ];
            handleDepartmentEdit(rowIndex, fields[colIndex], value);
          }}
          onDelete={onDeleteDepartment}
          editableColumns={[true, true, true, true, false]}
          inputTypes={["text", "number", "number", "number", "text"]}
          stepValues={["", "0.1", "1000", "1", ""]}
        />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-semibold text-gray-700 mb-2">
              Monthly Metrics
            </h4>
            <p>Total FTE: {totals.monthly.totalFte}</p>
            <p>
              Total Monthly Payroll: £{totals.monthly.payroll.toLocaleString()}
            </p>
            <p>
              Average Monthly Cost per FTE: £
              {totals.monthly.totalFte > 0
                ? Math.round(
                    totals.monthly.payroll / totals.monthly.totalFte
                  ).toLocaleString()
                : 0}
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-md">
            <h4 className="font-semibold text-blue-700 mb-2">Annual Metrics</h4>
            <p>
              Total Annual Payroll: £{totals.annual.payroll.toLocaleString()}
            </p>
            <p>
              Average Annual Cost per FTE: £
              {totals.monthly.totalFte > 0
                ? Math.round(
                    totals.annual.payroll / totals.monthly.totalFte
                  ).toLocaleString()
                : 0}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            5.2 Other Operating Expenses
          </h3>
          <button
            onClick={() => onAddRow("opex")}
            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <PlusCircle className="w-4 h-4" />
            Add Expense
          </button>
        </div>
        <Table
          headers={["Category", "Monthly Cost", "Notes"]}
          data={operatingExpenses.map((exp) => [
            exp?.category || "",
            `£${(exp?.monthlyCost || 0).toLocaleString()}`,
            exp?.notes || "",
          ])}
          onEdit={(rowIndex, colIndex, value) => {
            const fields: (keyof OperatingExpense)[] = [
              "category",
              "monthlyCost",
              "notes",
            ];
            handleOpexEdit(rowIndex, fields[colIndex], value);
          }}
          onDelete={onDeleteOperatingExpense}
          editableColumns={[true, true, true]}
        />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-semibold text-gray-700 mb-2">Monthly Totals</h4>
            <p>Operating Expenses: £{totals.monthly.opex.toLocaleString()}</p>
            <p>Payroll: £{totals.monthly.payroll.toLocaleString()}</p>
            <p className="mt-2 font-semibold">
              Total Monthly Expenses: £
              {(totals.monthly.payroll + totals.monthly.opex).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-md">
            <h4 className="font-semibold text-blue-700 mb-2">Annual Totals</h4>
            <p>Operating Expenses: £{totals.annual.opex.toLocaleString()}</p>
            <p>Payroll: £{totals.annual.payroll.toLocaleString()}</p>
            <p className="mt-2 font-semibold">
              Total Annual Expenses: £
              {(totals.annual.payroll + totals.annual.opex).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-sm">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Add New Department
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Department Name
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={newDepartment.name}
                  onChange={(e) =>
                    setNewDepartment((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter department name"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  FTE (Full Time Equivalent)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={newDepartment.fte}
                  onChange={(e) =>
                    setNewDepartment((prev) => ({
                      ...prev,
                      fte: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="1.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Annual Salary per FTE
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">£</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={newDepartment.salary}
                    onChange={(e) =>
                      setNewDepartment((prev) => ({
                        ...prev,
                        salary: e.target.value,
                      }))
                    }
                    className="block w-full rounded-md border-gray-300 pl-7 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="35000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Additional Costs (%)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={newDepartment.additionalCosts}
                  onChange={(e) =>
                    setNewDepartment((prev) => ({
                      ...prev,
                      additionalCosts: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setNewDepartment({
                      name: "",
                      fte: "1",
                      salary: "0",
                      additionalCosts: "0",
                    });
                    setError("");
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newDepartment.name.trim()}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Add Department
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
