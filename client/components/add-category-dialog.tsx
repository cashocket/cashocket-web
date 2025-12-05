"use client";

import { useState, useRef } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Plus, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryIconView } from "@/components/category-icon-view";

export function AddCategoryDialog({
  onCategoryAdded,
}: {
  onCategoryAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [color, setColor] = useState("#ef4444");
  const [icon, setIcon] = useState(""); // Stores Emoji or Base64 Image

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Image Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 100) {
        // Limit 100KB
        toast.error("Image too large. Please pick a smaller icon (<100KB).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setIcon(reader.result as string); // Save as Base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post("/categories", { name, type, color, icon: icon || "🏷️" });
      toast.success("Category created!");
      setOpen(false);
      setName("");
      setIcon("");
      onCategoryAdded();
    } catch (error) {
      toast.error("Failed to create category.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full shadow-lg gap-2">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>New Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* --- ICON SELECTION AREA --- */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="relative h-20 w-20 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {icon ? (
                <img
                  src={icon}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    Upload
                  </span>
                </div>
              )}
            </div>

            {/* Hidden Input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />

            {/* Option to clear or use Emoji fallback */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => setIcon("🏷️")}
              >
                Use Emoji
              </Button>
              {icon && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 text-red-500"
                  onClick={() => setIcon("")}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={type}
                onValueChange={(val) => {
                  setType(val);
                  setColor(val === "income" ? "#10b981" : "#ef4444");
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Color Tag</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-full p-1 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl mt-2"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
            Save
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
