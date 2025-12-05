// components/transactions/transaction-dialog.tsx

"use client";

import { useEffect, useState } from "react";
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
import { toast } from "sonner";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useCurrency } from "@/context/currency-context";

interface TransactionDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  account?: any; // Current account context
  transactionToEdit?: any; // Agar edit kar rahe hain to data yahan aayega
  onSuccess?: () => void; // Refresh karne ke liye callback
}

export function TransactionDialog({
  trigger,
  open,
  onOpenChange,
  account,
  transactionToEdit,
  onSuccess,
}: TransactionDialogProps) {
  const { symbol } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"income" | "expense" | "transfer">(
    "expense"
  );
  const [date, setDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [toAccountId, setToAccountId] = useState("");

  // Lists for dropdowns
  const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  // Internal open state handler
  const handleOpenChange = (val: boolean) => {
    setIsOpen(val);
    onOpenChange?.(val);
    if (!val && !transactionToEdit) resetForm(); // Close hone pe form reset
  };

  // Fetch helpers
  const fetchData = async () => {
    try {
      const [catRes, accRes] = await Promise.all([
        api.get("/categories"),
        api.get("/accounts"),
      ]);
      setCategories(catRes.data);
      setAccounts(accRes.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    if (isOpen || open) {
      fetchData();
    }
  }, [isOpen, open]);

  // Edit Mode: Data populate karo
  useEffect(() => {
    if (transactionToEdit) {
      setAmount(transactionToEdit.amount);
      setDescription(transactionToEdit.description || "");
      setType(transactionToEdit.type);
      setDate(
        transactionToEdit.date
          ? new Date(transactionToEdit.date).toISOString().split("T")[0]
          : ""
      );
      setCategoryId(transactionToEdit.categoryId || "");
      setToAccountId(transactionToEdit.toAccountId || "");
    }
  }, [transactionToEdit]);

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setType("expense");
    setDate(new Date().toISOString().split("T")[0]);
    setCategoryId("");
    setToAccountId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        amount,
        description,
        type,
        date,
        categoryId: type === "transfer" ? null : categoryId,
        accountId: account.id, // Current account se link hoga
        toAccountId: type === "transfer" ? toAccountId : null,
      };

      if (transactionToEdit) {
        // Update
        await api.put(`/transactions/${transactionToEdit.id}`, payload);
        toast.success("Transaction updated successfully");
      } else {
        // Create
        await api.post("/transactions", payload);
        toast.success("Transaction added successfully");
      }

      handleOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open ?? isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {transactionToEdit ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Type Selector */}
          <div className="grid grid-cols-3 gap-2">
            {(["expense", "income", "transfer"] as const).map((t) => (
              <div
                key={t}
                onClick={() => setType(t)}
                className={`cursor-pointer rounded-md border py-2 text-center text-sm font-medium capitalize transition-all ${
                  type === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {t}
              </div>
            ))}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                {symbol}
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                className="pl-8"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {type !== "transfer" && (
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((c) => c.type === type)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="mr-2">{cat.icon}</span>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {type === "transfer" && (
            <div className="grid gap-2">
              <Label htmlFor="toAccount">To Account</Label>
              <Select value={toAccountId} onValueChange={setToAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts
                    .filter((acc) => acc.id !== account?.id) // Khud ko exclude karo
                    .map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {transactionToEdit ? "Save Changes" : "Add Transaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
