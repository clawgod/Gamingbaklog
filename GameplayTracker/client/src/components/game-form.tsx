import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGameSchema, type InsertGame } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function GameForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertGame>({
    resolver: zodResolver(insertGameSchema),
    defaultValues: {
      name: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: InsertGame) => {
      await apiRequest("POST", "/api/games", data);
    },
    onSuccess: () => {
      toast({ title: "Game created successfully" });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Game Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          Add Game
        </Button>
      </form>
    </Form>
  );
}
