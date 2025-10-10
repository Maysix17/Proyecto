import React from "react";
import { Input } from "@heroui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import type { InputSearchProps } from "../../types/InputSearchProps.ts";

const InputSearch: React.FC<InputSearchProps> = ({ placeholder, value, onChange, onKeyDown }) => {
    return (
        <Input
            placeholder={placeholder || "Buscar..."}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            startContent={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
            size="md"
            className="w-64 py-3"
        />
    );
};

export default InputSearch;
    