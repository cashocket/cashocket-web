"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Plus, CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AddTransactionProps {
  onSuccess?: () => void;
  defaultType?: "income" | "expense";
}

export function AddTransactionDialog({
  onSuccess,
  defaultType = "expense",
}: AddTransactionProps) {
  const { symbol } = useCurrency();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("");
  const [type, setType] = useState<"income" | "expense">(defaultType);

  // Generate Time Slots (Every 30 mins)
  const timeSlots = Array.from({ length: 48 }).map((_, i) => {
    const hour = Math.floor(i / 2)
      .toString()
      .padStart(2, "0");
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour}:${minute}`;
  });

  useEffect(() => {
    if (open) {
      const now = new Date();
      setDate(now);

      // Round to nearest 30 min for UX
      const minutes = now.getMinutes();
      const roundedMinutes = minutes < 30 ? "00" : "30";
      const currentHour = now.getHours().toString().padStart(2, "0");
      setTime(`${currentHour}:${roundedMinutes}`);

      const fetchDeps = async () => {
        try {
          const [accRes, catRes] = await Promise.all([
            api.get("/accounts"),
            api.get(`/categories?type=${type}`),
          ]);
          setAccounts(accRes.data);
          setCategories(catRes.data);
        } catch (e) {
          console.error(e);
        }
      };
      fetchDeps();
    }
  }, [open, type]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!date || !time) {
      toast.error("Please select date and time");
      setLoading(false);
      return;
    }

    const dateTimeString = `${format(date, "yyyy-MM-dd")}T${time}:00`;
    const dateTime = new Date(dateTimeString);

    if (dateTime > new Date()) {
      toast.error("Future date/time not allowed.");
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    try {
      await api.post("/transactions", {
        amount: formData.get("amount"),
        description: formData.get("description"),
        accountId: formData.get("accountId"),
        categoryId: formData.get("categoryId"),
        type,
        date: dateTime.toISOString(),
      });
      toast.success("Record added successfully!");
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            "gap-2 h-9",
            type === "income"
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-black text-white"
          )}
        >
          <Plus className="h-4 w-4" /> Add{" "}
          {defaultType === "income" ? "Income" : "Expense"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] p-6">
        <DialogHeader>
          <DialogTitle>
            New {type === "income" ? "Income" : "Expense"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6 pt-2">
          {/* Toggle Type */}
          <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <button
              type="button"
              onClick={() => setType("income")}
              className={cn(
                "py-1.5 text-sm font-medium rounded-md transition-all",
                type === "income"
                  ? "bg-white shadow-sm text-green-700"
                  : "text-muted-foreground"
              )}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setType("expense")}
              className={cn(
                "py-1.5 text-sm font-medium rounded-md transition-all",
                type === "expense"
                  ? "bg-white shadow-sm text-red-700"
                  : "text-muted-foreground"
              )}
            >
              Expense
            </button>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Amount
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-medium text-muted-foreground/70">
                {symbol}
              </span>
              <Input
                name="amount"
                type="number"
                step="0.01"
                required
                className="pl-14 h-14 text-2xl font-bold bg-zinc-50/50 border-zinc-200"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Category</Label>
              <Select name="categoryId" required>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Account</Label>
              <Select name="accountId" required>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* DATE & TIME - Fixed Width & UX */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label className="text-xs font-medium">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full h-10 pl-3 text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Time</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className="h-10 w-full">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 opacity-50" />
                    <SelectValue placeholder="Time" />
                  </div>
                </SelectTrigger>
                <SelectContent className="h-[200px]">
                  {timeSlots.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Description</Label>
            <Textarea
              name="description"
              placeholder="Add a note..."
              className="resize-none h-20"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 text-base font-medium"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
            Transaction
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
