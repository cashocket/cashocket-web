"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

interface DashboardFiltersProps {
  filter: "today" | "weekly" | "monthly" | "custom";
  setFilter: (f: "today" | "weekly" | "monthly" | "custom") => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
}

export function DashboardFilters({
  filter,
  setFilter,
  dateRange,
  setDateRange,
}: DashboardFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-1 bg-muted/50 rounded-lg w-fit">
      {["today", "weekly", "monthly"].map((f) => (
        <Button
          key={f}
          variant={filter === f ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter(f as any)}
          className="rounded-md capitalize h-8"
        >
          {f}
        </Button>
      ))}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={filter === "custom" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("custom")}
            className={cn(
              "rounded-md gap-2 h-8",
              filter === "custom" && "pl-3"
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            {filter === "custom" && dateRange?.from ? (
              <span className="text-xs">
                {dateRange.to
                  ? `${format(dateRange.from, "MMM dd")} - ${format(
                      dateRange.to,
                      "MMM dd"
                    )}`
                  : format(dateRange.from, "MMM dd")}
              </span>
            ) : (
              "Custom"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b bg-muted/20 flex justify-between items-center">
            <p className="text-sm font-medium">Select Range</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setDateRange(undefined)}
              title="Clear"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from || new Date()}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
            disabled={(date) => date > new Date()}
            className="p-3"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
