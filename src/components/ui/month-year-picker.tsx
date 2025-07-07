"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Calendar } from "lucide-react"
import { Button } from "./button"

interface MonthYearPickerProps {
  value?: string // Format: "YYYY-MM" 
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  required?: boolean
}

const months = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" }
]

export function MonthYearPicker({
  value,
  onChange,
  placeholder = "Select month and year",
  disabled = false,
  className = "",
  id,
  required = false
}: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Parse value when it changes
  useEffect(() => {
    if (value) {
      const [year, month] = value.split("-")
      setSelectedYear(year || "")
      setSelectedMonth(month || "")
    } else {
      setSelectedYear("")
      setSelectedMonth("")
    }
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Generate years (current year + 10 years in the future, back to 1950)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1950 + 11 }, (_, i) => currentYear + 10 - i)

  const formatDisplayValue = () => {
    if (!selectedMonth || !selectedYear) return ""
    const monthLabel = months.find(m => m.value === selectedMonth)?.label
    return `${monthLabel} ${selectedYear}`
  }

  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month)
    if (selectedYear) {
      onChange(`${selectedYear}-${month}`)
      setIsOpen(false)
    }
  }

  const handleYearSelect = (year: string) => {
    setSelectedYear(year)
    if (selectedMonth) {
      onChange(`${year}-${selectedMonth}`)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        id={id}
        type="button"
        variant="outline"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full h-12 justify-between font-normal ${
          !formatDisplayValue() ? "text-gray-500" : "text-gray-900"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{formatDisplayValue() || placeholder}</span>
          {required && !formatDisplayValue() && <span className="text-red-500 ml-1">*</span>}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
          <div className="grid grid-cols-2 h-80">
            {/* Months Column */}
            <div className="border-r border-gray-200">
              <div className="p-3 bg-gray-50 border-b border-gray-200">
                <h4 className="font-semibold text-sm text-gray-700">Month</h4>
              </div>
              <div className="overflow-y-auto max-h-64">
                {months.map((month) => (
                  <button
                    key={month.value}
                    type="button"
                    onClick={() => handleMonthSelect(month.value)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                      selectedMonth === month.value ? "bg-cvgenius-primary text-white hover:bg-cvgenius-primary" : ""
                    }`}
                  >
                    {month.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Years Column */}
            <div>
              <div className="p-3 bg-gray-50 border-b border-gray-200">
                <h4 className="font-semibold text-sm text-gray-700">Year</h4>
              </div>
              <div className="overflow-y-auto max-h-64">
                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => handleYearSelect(year.toString())}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                      selectedYear === year.toString() ? "bg-cvgenius-primary text-white hover:bg-cvgenius-primary" : ""
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Clear Button */}
          {formatDisplayValue() && (
            <div className="p-2 border-t border-gray-200 bg-gray-50">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedMonth("")
                  setSelectedYear("")
                  onChange("")
                  setIsOpen(false)
                }}
                className="w-full text-gray-600 hover:text-gray-800"
              >
                Clear Selection
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}