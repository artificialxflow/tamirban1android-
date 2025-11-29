"use client";

import { useState, useEffect, useRef } from "react";
import { toGregorian, toJalaali, jalaaliMonthLength } from "jalaali-js";

interface PersianDateTimePickerProps {
  name: string;
  required?: boolean;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

function formatPersianDate(year: number, month: number, day: number): string {
  return `${year}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
}

function parsePersianDate(dateString: string): { year: number; month: number; day: number } | null {
  const parts = dateString.split("/").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return { year: parts[0], month: parts[1], day: parts[2] };
}

export function PersianDateTimePicker({
  name,
  required = false,
  defaultValue,
  onChange,
}: PersianDateTimePickerProps) {
  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("12:00");
  const [gregorianValue, setGregorianValue] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(1403);
  const [currentMonth, setCurrentMonth] = useState(1);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize date value on mount or when defaultValue changes
    if (defaultValue) {
      // Convert ISO datetime to Persian
      const date = new Date(defaultValue);
      const gregorian = {
        gy: date.getFullYear(),
        gm: date.getMonth() + 1,
        gd: date.getDate(),
      };
      const jalali = toJalaali(gregorian.gy, gregorian.gm, gregorian.gd);
      const persianDate = formatPersianDate(jalali.jy, jalali.jm, jalali.jd);
      const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
      setDateValue(persianDate);
      setTimeValue(time);
      updateGregorianValue(persianDate, time);
    } else {
      // Default to tomorrow at 12:00
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const gregorian = {
        gy: tomorrow.getFullYear(),
        gm: tomorrow.getMonth() + 1,
        gd: tomorrow.getDate(),
      };
      const jalali = toJalaali(gregorian.gy, gregorian.gm, gregorian.gd);
      const persianDate = formatPersianDate(jalali.jy, jalali.jm, jalali.jd);
      setDateValue(persianDate);
      setTimeValue("12:00");
      updateGregorianValue(persianDate, "12:00");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  const updateGregorianValue = (persianDate: string, time: string) => {
    try {
      if (!persianDate || !time) return;
      
      const parsed = parsePersianDate(persianDate);
      if (!parsed) {
        console.warn("Invalid Persian date format:", persianDate);
        return;
      }

      const gregorian = toGregorian(parsed.year, parsed.month, parsed.day);
      const [hours, minutes] = time.split(":").map(Number);
      
      if (isNaN(hours) || isNaN(minutes)) {
        console.warn("Invalid time format:", time);
        return;
      }

      const date = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd, hours, minutes);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date:", { gregorian, hours, minutes });
        return;
      }
      
      const isoString = date.toISOString();
      setGregorianValue(isoString);
      onChange?.(isoString);
    } catch (error) {
      console.error("Error converting Persian date:", error);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateValue(value);
    updateGregorianValue(value, timeValue);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTimeValue(value);
    updateGregorianValue(dateValue, value);
  };

  // Initialize current year and month from dateValue
  useEffect(() => {
    if (dateValue) {
      const parsed = parsePersianDate(dateValue);
      if (parsed) {
        setCurrentYear(parsed.year);
        setCurrentMonth(parsed.month);
      }
    } else {
      // Default to current Persian date
      const now = new Date();
      const jalali = toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
      setCurrentYear(jalali.jy);
      setCurrentMonth(jalali.jm);
    }
  }, [dateValue]);

  // Close calendar when clicking outside
  useEffect(() => {
    if (!isCalendarOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCalendarOpen]);

  const handleDateSelect = (day: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newDate = formatPersianDate(currentYear, currentMonth, day);
    setDateValue(newDate);
    updateGregorianValue(newDate, timeValue);
    setIsCalendarOpen(false);
  };

  const monthNames = [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
  ];

  const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

  const getDaysInMonth = () => {
    return jalaaliMonthLength(currentYear, currentMonth);
  };

  const getFirstDayOfMonth = () => {
    // Calculate first day of month (0 = شنبه, 6 = جمعه)
    const gregorian = toGregorian(currentYear, currentMonth, 1);
    const date = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
    const day = date.getDay();
    // Convert to Persian week (شنبه = 0)
    return (day + 1) % 7;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth();
    const firstDay = getFirstDayOfMonth();
    const days = [];

    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = dateValue === formatPersianDate(currentYear, currentMonth, day);
      days.push(
        <button
          key={day}
          type="button"
          onClick={(e) => handleDateSelect(day, e)}
          className={`h-10 w-10 rounded-lg text-sm transition hover:bg-primary-100 hover:text-primary-700 ${
            isSelected
              ? "bg-primary-500 text-white font-semibold"
              : "text-slate-700 hover:bg-slate-50"
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  return (
    <div className="flex gap-2">
      <input type="hidden" name={name} value={gregorianValue} required={required} />
      <div className="flex-1 relative min-w-0">
        <div className="relative">
          <input
            type="text"
            value={dateValue}
            onChange={handleDateChange}
            onClick={() => setIsCalendarOpen(true)}
            placeholder="۱۴۰۴/۰۸/۱۵"
            pattern="[0-9]{4}/[0-9]{2}/[0-9]{2}"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 overflow-hidden text-ellipsis"
            dir="ltr"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsCalendarOpen(!isCalendarOpen);
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-500 transition z-10"
            aria-label="باز کردن تقویم"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
        {isCalendarOpen && (
          <div
            ref={calendarRef}
            className="absolute z-[60] mt-2 w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigateMonth("prev")}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition"
                aria-label="ماه قبل"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="text-center">
                <div className="font-semibold text-slate-800">
                  {monthNames[currentMonth - 1]} {currentYear}
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigateMonth("next")}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition"
                aria-label="ماه بعد"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
          </div>
        )}
        <p className="mt-1 text-xs text-slate-400">فرمت: ۱۴۰۴/۰۸/۱۵</p>
      </div>
      <div className="w-32">
        <input
          type="time"
          value={timeValue}
          onChange={handleTimeChange}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
      </div>
    </div>
  );
}
