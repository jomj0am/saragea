// components/admin/NewExpenseDialog.tsx
"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
// import { prisma } from "@/lib/prisma"; // Only for types; actual fetch will be via API
import { LoadingButton } from "../ui/loading-button";

type Property = {
  id: string;
  name: string;
};

const categories = ["Utilities", "Maintenance", "Salaries"];

export default function NewExpenseDialog() {
  const [open, setOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyId, setPropertyId] = useState<string>("general");
  const [category, setCategory] = useState<string>(categories[0]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">(0);
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch properties for dropdown
  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await fetch("/api/properties");
        const data = await res.json();
        setProperties(data);
      } catch (err) {
        console.error("Failed to fetch properties:", err);
      }
    }
    fetchProperties();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: propertyId === "general" ? null : propertyId,
          category,
          description,
          amount: Number(amount),
          expenseDate,
        }),
      });

      if (!res.ok) throw new Error("Failed to create expense");

      setOpen(false);
      setPropertyId("general");
      setCategory(categories[0]);
      setDescription("");
      setAmount(0);
      setExpenseDate(new Date().toISOString().split("T")[0]);

      toast({
        title: "Expense created!",
        description: "Your expense has been added successfully.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Something went wrong while creating the expense.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Expense</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Property Select */}
          <Select value={propertyId} onValueChange={setPropertyId}>
            <SelectTrigger>
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Category Select */}
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Description */}
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Amount */}
          <Input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={0}
            step={0.01}
          />

          {/* Expense Date */}
          <Input
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
          />

          <LoadingButton type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Expense"}
          </LoadingButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
