import React from "react";
import { Trash2 } from "lucide-react";

interface TableProps {
  headers: string[];
  data: (string | number)[][];
  onEdit?: (rowIndex: number, colIndex: number, value: string) => void;
  onDelete?: (index: number) => void;
  editableColumns?: boolean[];
  inputTypes?: ("text" | "number")[];
  stepValues?: string[];
}

export function Table({
  headers,
  data,
  onEdit,
  onDelete,
  editableColumns = [],
  inputTypes = [],
  stepValues = [],
}: TableProps) {
  const handleEdit = (rowIndex: number, colIndex: number, value: string) => {
    if (onEdit && editableColumns[colIndex]) {
      const cleanValue = value.replace(/[£%,]/g, "");
      onEdit(rowIndex, colIndex, cleanValue);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
            {onDelete && <th className="px-6 py-3 w-16"></th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                >
                  {editableColumns[cellIndex] ? (
                    <input
                      type={inputTypes[cellIndex] || "text"}
                      step={stepValues[cellIndex] || "1"}
                      value={cell.toString()}
                      onChange={(e) =>
                        handleEdit(rowIndex, cellIndex, e.target.value)
                      }
                      className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    cell
                  )}
                </td>
              ))}
              {onDelete && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-16">
                  <button
                    onClick={() => onDelete(rowIndex)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="Delete row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
