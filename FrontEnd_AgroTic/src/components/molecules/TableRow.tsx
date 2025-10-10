import React from "react";
import CustomButton from "../atoms/Boton";
import type { TableRowProps } from "../../types/TableRowProps";

const TableRow: React.FC<TableRowProps> = ({ item, onView }) => {
  return (
    <tr className="border-b hover:bg-gray-100">
      <td className="px-4 py-2">{item.lote}</td>
      <td className="px-4 py-2">{item.cultivo}</td>
      <td className="px-4 py-2">{item.sensor}</td>
      <td className="px-4 py-2 text-center">
        <CustomButton onClick={() => onView(item)}>Ver más</CustomButton>
      </td>
    </tr>
  );
};

export default TableRow;
