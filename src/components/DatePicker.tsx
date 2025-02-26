import { forwardRef } from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale/es';
import { Calendar } from 'lucide-react';
import "react-datepicker/dist/react-datepicker.css";

registerLocale('es', es);

interface CustomDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
}

export function CustomDatePicker({ value, onChange, placeholder = "Seleccionar fecha", className = "" }: CustomDatePickerProps) {
  const CustomInput = forwardRef<HTMLDivElement, { value?: string; onClick?: () => void }>(
    ({ value, onClick }, ref) => (
      <div
        className={`flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 
          border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer
          hover:border-emerald-500 dark:hover:border-emerald-500
          focus-within:border-emerald-500 dark:focus-within:border-emerald-500
          focus-within:ring-2 focus:ring-emerald-500/20
          transition-all ${className}`}
        onClick={onClick}
        ref={ref}
      >
        <Calendar className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
        <input
          value={value || placeholder}
          readOnly
          placeholder={placeholder}
          className="bg-transparent border-none outline-none text-sm text-gray-900 
            dark:text-white placeholder-gray-400 dark:placeholder-gray-500 w-full"
        />
      </div>
    )
  );

  return (
    <ReactDatePicker
      selected={value}
      onChange={onChange}
      locale="es"
      dateFormat="dd 'de' MMMM 'de' yyyy"
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
      yearDropdownItemNumber={100}
      scrollableYearDropdown
      customInput={<CustomInput />}
      calendarClassName="bg-white dark:bg-gray-800 border border-gray-200 
        dark:border-gray-700 font-sans text-gray-900 dark:text-white shadow-lg 
        rounded-lg p-2 text-sm"
      wrapperClassName="w-full"
      popperClassName="z-[9999]"
      dayClassName={date =>
        `hover:bg-emerald-50 dark:hover:bg-emerald-900/20 
         hover:text-emerald-600 dark:hover:text-emerald-400
         rounded-md transition-colors mx-0.5 py-1 text-sm`
      }
      renderCustomHeader={({
        date,
        changeYear,
        changeMonth,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
      }) => (
        <div className="flex items-center justify-between px-1 py-2 mb-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={decreaseMonth}
            disabled={prevMonthButtonDisabled}
            className="p-1.5 rounded-md text-gray-500 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-gray-700/50
              hover:text-emerald-600 dark:hover:text-emerald-400
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors"
          >
            <Calendar className="h-3.5 w-3.5 rotate-180" />
          </button>

          <div className="flex items-center gap-2">
            <select
              value={date.getFullYear()}
              onChange={({ target: { value } }) => changeYear(Number(value))}
              className="bg-transparent border border-gray-200 dark:border-gray-700 
                rounded-md px-2 py-1 text-xs font-medium
                hover:border-emerald-500 dark:hover:border-emerald-500
                focus:border-emerald-500 dark:focus:border-emerald-500
                focus:outline-none cursor-pointer transition-colors"
            >
              {Array.from({ length: 100 }, (_, i) => 1990 + i).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={date.getMonth()}
              onChange={({ target: { value } }) => changeMonth(Number(value))}
              className="bg-transparent border border-gray-200 dark:border-gray-700 
                rounded-md px-2 py-1 text-xs font-medium capitalize
                hover:border-emerald-500 dark:hover:border-emerald-500
                focus:border-emerald-500 dark:focus:border-emerald-500
                focus:outline-none cursor-pointer transition-colors"
            >
              {Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('es', { month: 'long' }))
                .map((month, i) => (
                  <option key={month} value={i} className="capitalize">{month}</option>
                ))}
            </select>
          </div>

          <button
            onClick={increaseMonth}
            disabled={nextMonthButtonDisabled}
            className="p-1.5 rounded-md text-gray-500 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-gray-700/50
              hover:text-emerald-600 dark:hover:text-emerald-400
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors"
          >
            <Calendar className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      monthClassName={() => "font-medium"}
      weekDayClassName={() => 
        "text-gray-400 dark:text-gray-500 font-medium text-center py-1.5 text-xs"
      }
      fixedHeight
      showPopperArrow={false}
    />
  );
} 