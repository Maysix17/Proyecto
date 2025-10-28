import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { DateRangeInputProps } from "../../types/dateInput.types";

const DateRangeInput: React.FC<DateRangeInputProps> = ({ label, onChange }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  return (
    <div className="w-64 flex flex-col">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <DatePicker
        selectsRange
        startDate={startDate}
        endDate={endDate}
        onChange={(update: [Date | null, Date | null]) => {
          setStartDate(update[0]);
          setEndDate(update[1]);
          onChange(update);
        }}
        isClearable
        dateFormat="yyyy-MM-dd"
        className="border border-gray-300 rounded-xl px-3 py-3 h-10 text-gray-700 focus:outline-none w-full md:w-64"
        calendarClassName="calendar-responsive"
      />
    </div>
  );
};

export default DateRangeInput;
