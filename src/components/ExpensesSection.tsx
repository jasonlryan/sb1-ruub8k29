import React from 'react';
import { Table } from './Table';
import { Department, OperatingExpense } from '../types/model';
import { PlusCircle } from 'lucide-react';

interface ExpensesSectionProps {
  departments: Department[];
  operatingExpenses: OperatingExpense[];
  setDepartments: (departments: Department[]) => void;
  setOperatingExpenses: (expenses: OperatingExpense[]) => void;
  onAddRow: (section: 'departments' | 'opex') => void;
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
  icon
}: ExpensesSectionProps) {
  const totals = {
    monthly: {
      payroll: departments.reduce((sum, dept) => sum + dept.monthlyTotal, 0),
      opex: operatingExpenses.reduce((sum, exp) => sum + exp.monthlyCost, 0),
      totalFte: departments.reduce((sum, dept) => sum + dept.fte, 0)
    },
    annual: {
      payroll: departments.reduce((sum, dept) => sum + dept.monthlyTotal, 0) * 12,
      opex: operatingExpenses.reduce((sum, exp) => sum + exp.monthlyCost, 0) * 12
    }
  };

  const handleDepartmentEdit = (rowIndex: number, field: keyof Department, value: string) => {
    const newDepartments = [...departments];
    const department = { ...newDepartments[rowIndex] };
    
    if (field === 'fte' || field === 'salary' || field === 'additionalCosts') {
      department[field] = parseFloat(value) || 0;
      department.monthlyTotal = (department.salary / 12) * department.fte * (1 + department.additionalCosts / 100);
    } else {
      department[field] = value;
    }
    
    newDepartments[rowIndex] = department;
    setDepartments(newDepartments);
  };

  const handleOpexEdit = (rowIndex: number, field: keyof OperatingExpense, value: string) => {
    const newExpenses = [...operatingExpenses];
    const expense = { ...newExpenses[rowIndex] };
    
    if (field === 'monthlyCost') {
      expense[field] = parseFloat(value) || 0;
    } else {
      expense[field] = value;
    }
    
    newExpenses[rowIndex] = expense;
    setOperatingExpenses(newExpenses);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-2xl font-bold text-gray-900">Operating Expenses</h2>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">5.1 Human Resources</h3>
          <button
            onClick={() => onAddRow('departments')}
            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <PlusCircle className="w-4 h-4" />
            Add Department
          </button>
        </div>
        <Table
          headers={['Department', 'FTE', 'Salary', 'Additional Costs', 'Monthly Total']}
          data={departments.map((dept) => [
            dept.name,
            dept.fte.toString(),
            `£${dept.salary.toLocaleString()}`,
            `${dept.additionalCosts}%`,
            `£${dept.monthlyTotal.toLocaleString()}`
          ])}
          onEdit={(rowIndex, colIndex, value) => {
            const fields: (keyof Department)[] = ['name', 'fte', 'salary', 'additionalCosts', 'monthlyTotal'];
            handleDepartmentEdit(rowIndex, fields[colIndex], value);
          }}
          onDelete={onDeleteDepartment}
          editableColumns={[true, true, true, true, false]}
        />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-semibold text-gray-700 mb-2">Monthly Payroll</h4>
            <p>Total FTE: {totals.monthly.totalFte}</p>
            <p>Total Monthly Payroll: £{totals.monthly.payroll.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-md">
            <h4 className="font-semibold text-blue-700 mb-2">Annual Payroll</h4>
            <p>Total Annual Payroll: £{totals.annual.payroll.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">5.2 Other Operating Expenses</h3>
          <button
            onClick={() => onAddRow('opex')}
            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <PlusCircle className="w-4 h-4" />
            Add Expense
          </button>
        </div>
        <Table
          headers={['Category', 'Monthly Cost', 'Notes']}
          data={operatingExpenses.map((exp) => [
            exp.category,
            `£${exp.monthlyCost.toLocaleString()}`,
            exp.notes
          ])}
          onEdit={(rowIndex, colIndex, value) => {
            const fields: (keyof OperatingExpense)[] = ['category', 'monthlyCost', 'notes'];
            handleOpexEdit(rowIndex, fields[colIndex], value);
          }}
          onDelete={onDeleteOperatingExpense}
          editableColumns={[true, true, true]}
        />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-semibold text-gray-700 mb-2">Monthly Opex</h4>
            <p>Total Monthly Opex: £{totals.monthly.opex.toLocaleString()}</p>
            <p>Total Monthly Expenses: £{(totals.monthly.payroll + totals.monthly.opex).toLocaleString()}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-md">
            <h4 className="font-semibold text-blue-700 mb-2">Annual Opex</h4>
            <p>Total Annual Opex: £{totals.annual.opex.toLocaleString()}</p>
            <p>Total Annual Expenses: £{(totals.annual.payroll + totals.annual.opex).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}