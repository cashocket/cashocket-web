"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Loader2, ArrowRight, CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { useCurrency } from "@/context/currency-context";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

interface EditTransferProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  transfer: any;
  onSuccess: () => void;
}

export function EditTransferDialog({
  open,
  setOpen,
  transfer,
  onSuccess,
}: EditTransferProps) {
  const { symbol } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);

  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");

  const timeSlots = Array.from({ length: 48 }).map((_, i) => {
    const hour = Math.floor(i / 2)
      .toString()
      .padStart(2, "0");
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour}:${minute}`;
  });

  useEffect(() => {
    if (transfer && open) {
      setAmount(transfer.amount);
      setFromAccount(transfer.accountId);
      setToAccount(transfer.toAccountId);
      setDescription(transfer.description || "");

      const txnDate = new Date(transfer.date);
      setDate(txnDate);

      // Snap to nearest 30 mins
      const m = txnDate.getMinutes() < 30 ? "00" : "30";
      const h = txnDate.getHours().toString().padStart(2, "0");
      let displayTime = `${h}:${m}`;
      if (!timeSlots.includes(displayTime)) {
        displayTime = `${h}:00`; // Fallback
      }
      setTime(displayTime);

      api.get("/accounts").then((res) => setAccounts(res.data));
    }
  }, [open, transfer]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!date || !time) {
      toast.error("Date & Time required");
      setLoading(false);
      return;
    }

    const dateTime = new Date(`${format(date, "yyyy-MM-dd")}T${time}:00`);
    if (dateTime > new Date()) {
      toast.error("Future date/time not allowed.");
      setLoading(false);
      return;
    }
    if (fromAccount === toAccount) {
      toast.error("Accounts cannot be same");
      setLoading(false);
      return;
    }

    try {
      await api.put(`/transactions/${transfer.id}`, {
        amount: parseFloat(amount),
        accountId: fromAccount,
        toAccountId: toAccount,
        date: dateTime.toISOString(),
        description,
        type: "transfer",
      });
      toast.success("Transfer updated!");
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] p-6">
        <DialogHeader>
          <DialogTitle>Edit Transfer</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6 pt-2">
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Amount
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-medium text-muted-foreground/70">
                {symbol}
              </span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-14 h-14 text-2xl font-bold bg-zinc-50/50 border-zinc-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-2">
              <Label className="text-xs font-medium">From</Label>
              <Select
                value={fromAccount}
                onValueChange={setFromAccount}
                required
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="pt-6 text-muted-foreground">
              <ArrowRight className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-2">
              <Label className="text-xs font-medium">To</Label>
              <Select value={toAccount} onValueChange={setToAccount} required>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Dest." />
                </SelectTrigger>
                <SelectContent>
                  {accounts
                    .filter((a) => a.id !== fromAccount)
                    .map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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
                    {date ? format(date, "PPP") : <span>Pick date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date > new Date()}
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
            <Label className="text-xs font-medium">Note</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-20 resize-none"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
            Update Transfer
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
