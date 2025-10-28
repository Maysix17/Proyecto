import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import type { InputSearchProps } from "../../types/InputSearchProps";

const InputSearch: React.FC<InputSearchProps> = ({ placeholder, value, onChange, onKeyDown }) => {
    return (
        <div className="relative">
            <input
                type="text"
                placeholder={placeholder || "Buscar..."}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                className="w-64 px-3 py-2.5 pl-10 text-sm rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                name="search"
            />
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
    );
};

export default InputSearch;
    