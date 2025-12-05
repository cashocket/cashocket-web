"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Loader2,
  ArrowRight,
  ArrowRightLeft,
  CalendarIcon,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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

export function AddTransferDialog({ onSuccess }: { onSuccess: () => void }) {
  const { symbol } = useCurrency();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);

  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("12:00");
  const [description, setDescription] = useState("");

  const timeSlots = Array.from({ length: 48 }).map((_, i) => {
    const hour = Math.floor(i / 2)
      .toString()
      .padStart(2, "0");
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour}:${minute}`;
  });

  useEffect(() => {
    if (open) {
      api.get("/accounts").then((res) => setAccounts(res.data));
      const now = new Date();
      setDate(now);

      const m = now.getMinutes() < 30 ? "00" : "30";
      const h = now.getHours().toString().padStart(2, "0");
      setTime(`${h}:${m}`);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      toast.error("Select date & time");
      return;
    }

    const dateTime = new Date(`${format(date, "yyyy-MM-dd")}T${time}:00`);
    const now = new Date();

    if (dateTime > now) {
      toast.error("Future date/time not allowed.");
      return;
    }
    if (fromAccount === toAccount) {
      toast.error("Source and Destination cannot be same");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/transactions", {
        type: "transfer",
        accountId: fromAccount,
        toAccountId: toAccount,
        amount: parseFloat(amount),
        date: dateTime.toISOString(),
        description,
      });
      toast.success("Transfer successful!");
      setOpen(false);
      setAmount("");
      setDescription("");
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Transfer failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-9 gap-2 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black">
          <ArrowRightLeft className="h-4 w-4" /> <span>New Transfer</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-6">
        <DialogHeader>
          <DialogTitle>Transfer Funds</DialogTitle>
          <DialogDescription>
            Move money between your accounts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
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
                placeholder="0.00"
                required
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
              placeholder="Reason..."
              className="h-20 resize-none"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-11">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
            Confirm Transfer
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
