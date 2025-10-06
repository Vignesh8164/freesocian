import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

// Simple date formatter to replace date-fns
const formatDate = (date: Date, formatStr: string): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  if (formatStr === 'MMM dd, yyyy') {
    return `${month} ${day.toString().padStart(2, '0')}, ${year}`;
  }
  
  return date.toLocaleDateString();
};

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  disabled?: boolean;
  label?: string;
}

export function DateTimePicker({ value, onChange, disabled = false, label }: DateTimePickerProps) {
  const [date, setDate] = useState<Date>(value);
  const [time, setTime] = useState({
    hours: value.getHours(),
    minutes: value.getMinutes()
  });
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    setDate(value);
    setTime({
      hours: value.getHours(),
      minutes: value.getMinutes()
    });
  }, [value]);

  const updateDateTime = (newDate: Date, newTime: { hours: number; minutes: number }) => {
    const updatedDate = new Date(newDate);
    updatedDate.setHours(newTime.hours, newTime.minutes, 0, 0);
    onChange(updatedDate);
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      updateDateTime(selectedDate, time);
      setShowCalendar(false);
    }
  };

  const handleTimeChange = (field: 'hours' | 'minutes', value: string) => {
    const numValue = parseInt(value, 10);
    const newTime = { ...time, [field]: numValue };
    setTime(newTime);
    updateDateTime(date, newTime);
  };

  const generateHours = () => {
    return Array.from({ length: 24 }, (_, i) => ({
      value: i.toString(),
      label: i.toString().padStart(2, '0')
    }));
  };

  const generateMinutes = () => {
    return Array.from({ length: 60 }, (_, i) => ({
      value: i.toString(),
      label: i.toString().padStart(2, '0')
    }));
  };

  const isDateInPast = (checkDate: Date) => {
    const now = new Date();
    return checkDate < now;
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        {/* Date Picker */}
        <Popover open={showCalendar} onOpenChange={setShowCalendar}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className="flex-1 justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDate(date, 'MMM dd, yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={(date) => isDateInPast(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Time Picker */}
        <div className="flex items-center gap-1 border rounded-md px-3 py-2 bg-background">
          <Clock className="h-4 w-4 text-muted-foreground mr-1" />
          <Select
            value={time.hours.toString()}
            onValueChange={(value) => handleTimeChange('hours', value)}
            disabled={disabled}
          >
            <SelectTrigger className="w-16 h-auto p-0 border-none shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {generateHours().map((hour) => (
                <SelectItem key={hour.value} value={hour.value}>
                  {hour.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">:</span>
          <Select
            value={time.minutes.toString()}
            onValueChange={(value) => handleTimeChange('minutes', value)}
            disabled={disabled}
          >
            <SelectTrigger className="w-16 h-auto p-0 border-none shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {generateMinutes().map((minute) => (
                <SelectItem key={minute.value} value={minute.value}>
                  {minute.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isDateInPast(date) && (
        <p className="text-sm text-destructive">
          ⚠️ This date is in the past. Please select a future date and time.
        </p>
      )}
    </div>
  );
}