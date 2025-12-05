"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Layers } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryDialog } from "@/components/categories/category-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted");
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  const handleEdit = (cat: any) => {
    setSelectedCategory(cat);
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setOpenDialog(true);
  };

  // Filter Logic
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const incomeCats = filteredCategories.filter((c) => c.type === "income");
  const expenseCats = filteredCategories.filter((c) => c.type === "expense");

  // Reusable List Component
  const CategoryGrid = ({ items }: { items: any[] }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((cat) => (
        <Card
          key={cat.id}
          className="group hover:shadow-md transition-all border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden"
        >
          {/* Color Strip on Left */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1"
            style={{ backgroundColor: cat.color || "#ccc" }}
          />

          <CardContent className="p-4 pl-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl shadow-inner">
                {cat.icon || "🏷️"}
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground truncate max-w-[120px]">
                  {cat.name}
                </h4>
                <p className="text-[10px] text-muted-foreground capitalize">
                  {cat.type}
                </p>
              </div>
            </div>

            {/* Actions (Visible on Hover/Mobile) */}
            <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleEdit(cat)}
              >
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{cat.name}". Transactions
                      using this category might be affected.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(cat.id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add New Button Card */}
      <button
        onClick={handleAdd}
        className="flex flex-col items-center justify-center h-20 sm:h-auto border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl hover:bg-muted/50 transition-colors gap-2 text-muted-foreground hover:text-foreground"
      >
        <Plus className="h-6 w-6 opacity-50" />
        <span className="text-sm font-medium">Add New</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Categories
          </h2>
          <p className="text-muted-foreground">
            Organize your financial records.
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="gap-2 bg-black text-white dark:bg-white dark:text-black"
        >
          <Plus className="h-4 w-4" /> New Category
        </Button>
      </div>

      {/* Search & Tabs */}
      <Tabs defaultValue="expense" className="w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <TabsList className="w-full sm:w-auto grid grid-cols-2">
            <TabsTrigger value="expense">Expense</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-9 bg-white dark:bg-zinc-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="expense" className="space-y-4">
          {expenseCats.length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
              <div className="bg-muted rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-3">
                <Layers className="h-6 w-6 opacity-50" />
              </div>
              <p>No expense categories found.</p>
            </div>
          )}
          <CategoryGrid items={expenseCats} />
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          {incomeCats.length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
              <div className="bg-muted rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-3">
                <Layers className="h-6 w-6 opacity-50" />
              </div>
              <p>No income categories found.</p>
            </div>
          )}
          <CategoryGrid items={incomeCats} />
        </TabsContent>
      </Tabs>

      {/* Unified Add/Edit Dialog */}
      <CategoryDialog
        open={openDialog}
        setOpen={setOpenDialog}
        category={selectedCategory}
        onSuccess={fetchCategories}
      />
    </div>
  );
}
