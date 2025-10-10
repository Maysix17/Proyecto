import React from "react";
import type { TextInputProps } from "../../types/textInput.types"

const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) => {
  return (
    <div className="flex flex-col mb-4">
      {/* Label visible arriba del input */}
      <label className="text-gray-700 text-sm mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default TextInput;
