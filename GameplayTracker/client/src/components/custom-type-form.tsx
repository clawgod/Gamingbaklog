
import GameSelector from "./game-selector";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CustomTypeForm({ gameId }: { gameId: number }) {
  const { toast } = useToast();
  const [fields, setFields] = useState<Array<{ name: string; type: 'text' | 'number' | 'media' }>>([]);
  const [typeName, setTypeName] = useState("");
  const [selectedGame, setSelectedGame] = useState<number>();

  const { mutate } = useMutation({
    mutationFn: async () => {
      if (!selectedGame) {
        throw new Error("Please select a game first");
      }
      await apiRequest("POST", "/api/custom-log-types", { 
        gameId: selectedGame, 
        name: typeName, 
        fields: fields 
      });
    },
    onSuccess: () => {
      toast({ title: "Custom type created successfully" });
      setFields([]);
      setTypeName("");
    },
  });

  const addField = () => {
    setFields([...fields, { name: "", type: "text" }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <GameSelector
        value={selectedGame}
        onChange={setSelectedGame}
      />
      <Input
        placeholder="Type name (e.g., PVP, Quest)"
        value={typeName}
        onChange={(e) => setTypeName(e.target.value)}
      />

      {fields.map((field, index) => (
        <div key={index} className="flex gap-2">
          <Input
            placeholder="Field name"
            value={field.name}
            onChange={(e) => {
              const newFields = [...fields];
              newFields[index].name = e.target.value;
              setFields(newFields);
            }}
          />
          <select
            className="border rounded px-2"
            value={field.type}
            onChange={(e) => {
              const newFields = [...fields];
              newFields[index].type = e.target.value as 'text' | 'number' | 'media';
              setFields(newFields);
            }}
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="media">Media (Image/GIF/Video)</option>
          </select>
          <Button variant="destructive" onClick={() => removeField(index)}>
            Remove
          </Button>
        </div>
      ))}

      <div className="space-x-2">
        <Button onClick={addField}>Add Field</Button>
        <Button onClick={() => mutate({ name: typeName, fields })} disabled={!typeName || fields.length === 0}>
          Create Type
        </Button>
      </div>
    </div>
  );
}