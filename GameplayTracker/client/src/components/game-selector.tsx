import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Game } from "@shared/schema";

interface GameSelectorProps {
  value?: number;
  onChange: (value: number) => void;
}

export default function GameSelector({ value, onChange }: GameSelectorProps) {
  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  if (isLoading) {
    return <div className="h-10 w-[200px] animate-pulse bg-muted rounded-md" />;
  }

  return (
    <Select value={value?.toString()} onValueChange={(v) => onChange(parseInt(v))}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a game" />
      </SelectTrigger>
      <SelectContent>
        {games?.map((game) => (
          <SelectItem key={game.id} value={game.id.toString()}>
            {game.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
