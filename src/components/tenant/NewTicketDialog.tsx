"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  PlusCircle,
  Wrench,
  AlertTriangle,
  Home,
  FileText,
} from "lucide-react";
import { type Lease, type Room, type Property } from "@prisma/client";
import { LoadingButton } from "../ui/loading-button";

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z
    .string()
    .min(20, { message: "Please provide more details (min 20 chars)." }),
  priority: z.enum(["Low", "Medium", "High"]),
});

type LeaseWithDetails = Lease & {
  room: Room & {
    property: Property;
  };
};

export default function NewTicketDialog({
  lease,
}: {
  lease: LeaseWithDetails;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", description: "", priority: "Medium" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          roomId: lease.roomId,
        }),
      });
      if (!response.ok) throw new Error("Failed to submit ticket");

      toast({
        title: "Request Submitted!",
        description: "Our maintenance team has been notified.",
        variant: "success",
      });
      setIsOpen(false);
      form.reset();
      router.refresh();
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not submit your request. Please try again.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-md rounded-full px-4">
          <PlusCircle className="mr-2 h-4 w-4" /> Report Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg rounded-2xl !px-2 !md:px-6 overflow-hidden">
        <DialogHeader className="bg-muted/30 p-6 pb-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Wrench className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <DialogTitle className="text-xl">Maintenance Request</DialogTitle>
              <DialogDescription>
                Submit a new ticket for repairs or issues.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Context Card */}
        <div className="mx-6 p-3 bg-secondary/50 rounded-xl border border-dashed flex items-center gap-3 text-sm">
          <Home className="h-4 w-4 text-muted-foreground" />
          <span>
            Reporting for:{" "}
            <span className="font-semibold">
              {lease.room.property.name}, Room {lease.room.roomNumber}
            </span>
          </span>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 px-6 pb-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Issue Title
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <AlertTriangle className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="e.g. Leaking Faucet"
                        {...field}
                        className="pl-9 bg-background"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Priority
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500" />{" "}
                            Low (Non-urgent)
                          </div>
                        </SelectItem>
                        <SelectItem value="Medium">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-yellow-500" />{" "}
                            Medium (Standard)
                          </div>
                        </SelectItem>
                        <SelectItem value="High">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-red-500" />{" "}
                            High (Emergency)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Details
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        placeholder="Please describe the issue in detail..."
                        className="min-h-[120px] pl-9 bg-background resize-none"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <LoadingButton
                type="submit"
                className="bg-gradient-to-r from-orange-500 rounded-full to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
                loading={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Submitting..."
                  : "Submit Ticket"}
              </LoadingButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
