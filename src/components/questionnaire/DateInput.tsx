"use client";

import { useState, forwardRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion } from "framer-motion";

interface DateInputProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

// Custom input component for the date picker
const CustomInput = forwardRef<HTMLInputElement, any>(({ value, onClick, placeholder }, ref) => (
  <div className="relative w-full">
    <motion.input
      ref={ref}
      value={value}
      onClick={onClick}
      placeholder={placeholder || "Select date"}
      readOnly
      className="w-full p-4 bg-slate-700/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 cursor-pointer hover:border-purple-400/50 hover:bg-purple-500/10"
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
    />
    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
      <svg
        className="w-5 h-5 text-purple-400 transition-colors duration-200"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  </div>
));

CustomInput.displayName = "CustomInput";

export function DateInput({ value, onChange, placeholder, label, required }: DateInputProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Initialize selected date from value prop
  useEffect(() => {
    if (value && value.trim() !== "") {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          setSelectedDate(date);
        }
      } catch (error) {
        console.warn("Invalid date format:", value);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      // Format date as YYYY-MM-DD for consistency
      const formattedDate = date.toISOString().split('T')[0]!;
      onChange(formattedDate);
    } else {
      onChange("");
    }
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-white font-medium text-sm">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="w-full">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          customInput={<CustomInput placeholder={placeholder} />}
          dateFormat="MMM dd, yyyy"
          placeholderText={placeholder || "Select date"}
          calendarClassName="custom-date-picker-calendar"
          dayClassName={(date) => "custom-date-picker-day"}
          weekDayClassName={(date) => "custom-date-picker-weekday"}
          wrapperClassName="w-full block"
          popperPlacement="bottom-start"
          portalId="date-picker-portal"
          showYearDropdown
          showMonthDropdown
          dropdownMode="select"
          yearDropdownItemNumber={15}
          scrollableYearDropdown
          minDate={new Date(2020, 0, 1)}
          maxDate={new Date(2030, 11, 31)}
          shouldCloseOnSelect={true}
          preventOpenOnFocus={false}
          autoComplete="off"
        />
      </div>
    </div>
  );
}
