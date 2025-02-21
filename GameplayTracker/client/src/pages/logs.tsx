import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import GameSelector from "@/components/game-selector";
import type { Log } from "@shared/schema";

export default function LogsView() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedGame, setSelectedGame] = useState<number>();

  const { data: logs, isLoading } = useQuery<Log[]>({
    queryKey: [
      "/api/logs",
      selectedGame ? `?gameId=${selectedGame}` : "",
      selectedDate ? `&date=${selectedDate.toISOString()}` : "",
    ],
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Logs</h2>
        <p className="text-muted-foreground">
          View and filter your gameplay logs
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="mb-4 space-y-2">
            <h3 className="font-medium">Filter by Game</h3>
            <GameSelector
              value={selectedGame}
              onChange={setSelectedGame}
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Filter by Date</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </div>
        </div>

        <div className="flex-[2]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Source / Location</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : logs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs?.map((log) => (
                  <TableRow
                    key={log.id}
                    className="transition-all duration-200 hover:scale-[1.02] hover:bg-accent hover:text-accent-foreground cursor-pointer relative group"
                  >
                    <TableCell className="transition-colors">
                      {format(new Date(log.timestamp), "HH:mm:ss")}
                    </TableCell>
                    <TableCell className="capitalize transition-colors">
                      {log.type}
                    </TableCell>
                    <TableCell className="transition-colors">
                      {log.name}
                    </TableCell>
                    <TableCell className="transition-colors">
                      {log.subsection || "-"}
                    </TableCell>
                    <TableCell className="transition-colors">
                      {log.amount || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}