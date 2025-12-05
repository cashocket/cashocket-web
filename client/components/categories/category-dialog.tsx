"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CategoryDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  category?: any; // If passed, it's Edit mode
  onSuccess: () => void;
}

// Predefined Professional Colors
const COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#d946ef", // Fuchsia
  "#64748b", // Slate
  "#18181b", // Black
];

export function CategoryDialog({
  open,
  setOpen,
  category,
  onSuccess,
}: CategoryDialogProps) {
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [icon, setIcon] = useState("🏷️"); // Default Emoji
  const [color, setColor] = useState(COLORS[5]); // Default Blue

  // Reset or Load Data
  useEffect(() => {
    if (open) {
      if (category) {
        // Edit Mode
        setName(category.name);
        setType(category.type);
        setIcon(category.icon || "🏷️");
        setColor(category.color || COLORS[0]);
      } else {
        // Add Mode (Reset)
        setName("");
        // Keep type same as previous selection or default
        setIcon("🏷️");
        setColor(COLORS[5]);
      }
    }
  }, [open, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = { name, type, icon, color };

    try {
      if (category) {
        await api.put(`/categories/${category.id}`, payload);
        toast.success("Category updated successfully");
      } else {
        await api.post("/categories", payload);
        toast.success("Category created successfully");
      }
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[400px] p-6">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "New Category"}
          </DialogTitle>
          <DialogDescription>
            Organize your transactions with custom tags.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Type Toggle */}
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

          <div className="flex gap-4">
            {/* Icon Input */}
            <div className="space-y-2 w-1/4">
              <Label className="text-xs font-medium">Icon (Emoji)</Label>
              <div className="relative">
                <Input
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="text-center text-2xl h-12 p-0"
                  maxLength={2} // Limit to 1-2 chars
                />
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-2 flex-1">
              <Label className="text-xs font-medium">Category Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Groceries"
                className="h-12"
                required
              />
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-3">
            <Label className="text-xs font-medium">Color Label</Label>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all flex items-center justify-center",
                    color === c
                      ? "border-black dark:border-white scale-110"
                      : "border-transparent hover:scale-110"
                  )}
                  style={{ backgroundColor: c }}
                >
                  {color === c && (
                    <Check className="h-4 w-4 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {category ? "Update Category" : "Create Category"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
