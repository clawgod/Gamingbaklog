import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLogSchema, type InsertLog } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import GameSelector from "./game-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LogForm() {
  const { toast } = useToast();
  const [selectedGame, setSelectedGame] = useState<number>();

  const [customTypes, setCustomTypes] = useState<any[]>([]);
  const [customFields, setCustomFields] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (selectedGame) {
      fetch(`/api/custom-log-types?gameId=${selectedGame}`)
        .then(res => res.json())
        .then(types => setCustomTypes(types));
    }
  }, [selectedGame]);

  const form = useForm<InsertLog>({
    resolver: zodResolver(insertLogSchema),
    defaultValues: {
      type: "reward",
      name: "",
      subsection: "",
      amount: 0,
    },
  });

  const selectedType = form.watch("type");
  const currentCustomType = customTypes.find(t => t.name === selectedType);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});

  const handleSubmit = (data: any) => {
    if (currentCustomType) {
      data.customFields = JSON.stringify(customFieldValues);
    }
    mutate(data);
    setCustomFieldValues({});
  };

  const resetCustomFields = () => {
    setCustomFieldValues({});
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: InsertLog) => {
      await apiRequest("POST", "/api/logs", data);
    },
    onSuccess: () => {
      toast({ title: "Log created successfully" });
      form.reset();
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutate(data))} className="space-y-4">
        <FormItem>
          <FormLabel>Game</FormLabel>
          <GameSelector 
            value={selectedGame} 
            onChange={(id) => {
              setSelectedGame(id);
              form.setValue("gameId", id);
            }}
          />
        </FormItem>

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Log Type</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="reward">Reward</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                  {customTypes.map(type => (
                    <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {currentCustomType && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Custom Fields</h3>
            {JSON.parse(currentCustomType.fields).map((field: { name: string; type: string }) => (
              <FormItem key={field.name}>
                <FormLabel>{field.name}</FormLabel>
                <FormControl>
                  {field.type === 'media' ? (
                    <Input 
                      type="file" 
                      accept="image/*,video/*" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append('file', file); // Changed to 'file'
                          const res = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData
                          });
                          const { url } = await res.json();
                          setCustomFieldValues(prev => ({
                            ...prev,
                            [field.name]: url
                          }));
                        }
                      }}
                    />
                  ) : field.type === 'number' ? (
                    <Input type="number" 
                           value={customFieldValues[field.name] || ""}
                           onChange={(e) => {
                             setCustomFieldValues(prev => ({
                               ...prev,
                               [field.name]: e.target.value
                             }));
                           }} />
                  ) : (
                    <Input 
                      value={customFieldValues[field.name] || ""}
                      onChange={(e) => {
                        setCustomFieldValues(prev => ({
                          ...prev,
                          [field.name]: e.target.value
                        }));
                      }} 
                    />
                  )}
                </FormControl>
              </FormItem>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="font-medium">Item Details</h3>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Category</FormLabel>
                <FormDescription>
                  Enter the main category (e.g., "Egg", "Potion", "Weapon")
                </FormDescription>
                <FormControl>
                  <Input {...field} placeholder="e.g., Egg" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subsection"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source / Location</FormLabel>
                <FormDescription>
                  Enter where you got this item (e.g., "Boss Fight", "Daily Quest", "Trading")
                </FormDescription>
                <FormControl>
                  <Input {...field} placeholder="e.g., Boss Fight" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Screenshot</FormLabel>
                <FormDescription>
                  Upload a screenshot of the item (optional)
                </FormDescription>
                <FormControl>
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const formData = new FormData();
                        formData.append('image', file);
                        const res = await fetch('/api/upload', {
                          method: 'POST',
                          body: formData
                        });
                        const { url } = await res.json();
                        field.onChange(url);
                      }
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {form.watch("type") === "reward" && (
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <Button type="submit" disabled={isPending}>
          Add Log
        </Button>
      </form>
    </Form>
  );
}