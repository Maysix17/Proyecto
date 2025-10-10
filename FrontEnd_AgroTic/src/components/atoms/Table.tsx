import React from "react";
import type { TableProps } from "../../types/TableProps";

const Table: React.FC<TableProps> = ({ headers, children }) => {
  return (
    <table className="min-w-full border border-gray-300 rounded-md shadow-sm">
      <thead className="bg-gray-200">
        <tr>
          {headers.map((header, index) => (
            <th key={index} className="px-4 py-2 text-left border-b">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
};

export default Table;

