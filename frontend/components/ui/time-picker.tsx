"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type TimePickerProps = {
  time?: Date
  onSelect?: (time: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  buttonClassName?: string
  minuteInterval?: number
}

function TimePicker({
  time,
  onSelect,
  placeholder = "Pick a time",
  disabled = false,
  className,
  buttonClassName,
  minuteInterval = 5,
}: TimePickerProps) {
  const [hour, setHour] = React.useState<string>(
    time ? String(time.getHours() % 12 || 12) : ""
  )
  const [minute, setMinute] = React.useState<string>(
    time ? String(time.getMinutes()).padStart(2, "0") : ""
  )
  const [period, setPeriod] = React.useState<"AM" | "PM">(
    time && time.getHours() >= 12 ? "PM" : "AM"
  )

  // Update internal state when time prop changes
  React.useEffect(() => {
    if (time) {
      setHour(String(time.getHours() % 12 || 12))
      setMinute(String(time.getMinutes()).padStart(2, "0"))
      setPeriod(time.getHours() >= 12 ? "PM" : "AM")
    }
  }, [time])

  // Generate hours (1-12)
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1))

  // Generate minutes based on interval
  const minutes = Array.from(
    { length: 60 / minuteInterval },
    (_, i) => String(i * minuteInterval).padStart(2, "0")
  )

  const handleTimeChange = React.useCallback(
    (newHour: string, newMinute: string, newPeriod: "AM" | "PM") => {
      if (!onSelect) return

      const date = time ? new Date(time) : new Date()
      let hours24 = parseInt(newHour)

      // Convert 12-hour to 24-hour format
      if (newPeriod === "PM" && hours24 !== 12) {
        hours24 += 12
      } else if (newPeriod === "AM" && hours24 === 12) {
        hours24 = 0
      }

      date.setHours(hours24)
      date.setMinutes(parseInt(newMinute))
      date.setSeconds(0)
      date.setMilliseconds(0)

      onSelect(date)
    },
    [time, onSelect]
  )

  const handleHourChange = (value: string) => {
    setHour(value)
    if (minute) {
      handleTimeChange(value, minute, period)
    }
  }

  const handleMinuteChange = (value: string) => {
    setMinute(value)
    if (hour) {
      handleTimeChange(hour, value, period)
    }
  }

  const handlePeriodChange = (newPeriod: "AM" | "PM") => {
    setPeriod(newPeriod)
    if (hour && minute) {
      handleTimeChange(hour, minute, newPeriod)
    }
  }

  const handleSetNow = () => {
    const now = new Date()
    const currentHour = String(now.getHours() % 12 || 12)
    const currentMinute = String(
      Math.floor(now.getMinutes() / minuteInterval) * minuteInterval
    ).padStart(2, "0")
    const currentPeriod = now.getHours() >= 12 ? "PM" : "AM"

    setHour(currentHour)
    setMinute(currentMinute)
    setPeriod(currentPeriod)
    handleTimeChange(currentHour, currentMinute, currentPeriod)
  }

  const formattedTime = React.useMemo(() => {
    if (!time) return null
    try {
      return format(time, "h:mm a")
    } catch {
      return null
    }
  }, [time])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !time && "text-muted-foreground",
            buttonClassName
          )}
          disabled={disabled}
          data-slot="time-picker-trigger"
        >
          <Clock className="mr-2 h-4 w-4" />
          {formattedTime || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-auto p-4", className)} align="start">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Select value={hour} onValueChange={handleHourChange}>
              <SelectTrigger
                className="w-full"
                aria-label="Select hour"
                data-slot="time-picker-hour"
              >
                <SelectValue placeholder="HH" />
              </SelectTrigger>
              <SelectContent>
                {hours.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-xl font-semibold">:</span>
          <div className="flex-1">
            <Select value={minute} onValueChange={handleMinuteChange}>
              <SelectTrigger
                className="w-full"
                aria-label="Select minute"
                data-slot="time-picker-minute"
              >
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent>
                {minutes.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Button
              variant={period === "AM" ? "default" : "outline"}
              size="sm"
              className="h-8 px-3"
              onClick={() => handlePeriodChange("AM")}
              type="button"
              aria-label="Select AM"
              data-slot="time-picker-am"
            >
              AM
            </Button>
            <Button
              variant={period === "PM" ? "default" : "outline"}
              size="sm"
              className="h-8 px-3"
              onClick={() => handlePeriodChange("PM")}
              type="button"
              aria-label="Select PM"
              data-slot="time-picker-pm"
            >
              PM
            </Button>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSetNow}
            type="button"
            data-slot="time-picker-now"
          >
            Now
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { TimePicker }

