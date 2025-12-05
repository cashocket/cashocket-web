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
import { Loader2, Plus } from "lucide-react";
import { useCurrency } from "@/context/currency-context";

interface BudgetDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  budgetToEdit?: any; // Future use ke liye agar edit feature add karna ho
}

export function BudgetDialog({
  trigger,
  onSuccess,
  budgetToEdit,
}: BudgetDialogProps) {
  const { symbol } = useCurrency();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  // Categories fetch karna (Sirf Expense categories)
  useEffect(() => {
    if (open) {
      api
        .get("/categories?type=expense")
        .then((res) => setCategories(res.data))
        .catch((err) => console.error("Failed to load categories", err));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post("/budgets", {
        amount,
        categoryId,
        period: "monthly",
      });
      toast.success("Budget set successfully!");
      setOpen(false);
      setAmount("");
      setCategoryId("");
      onSuccess?.();
    } catch (error: any) {
      // Agar duplicate budget hai to error handle karein
      const msg = error.response?.data?.message || "Failed to set budget";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="rounded-full shadow-lg">
            <Plus className="mr-2 h-4 w-4" /> Set Budget
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Monthly Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an expense category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="mr-2">{cat.icon}</span> {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Monthly Limit</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                {symbol}
              </span>
              <Input
                type="number"
                placeholder="0.00"
                className="pl-8"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Budget
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
