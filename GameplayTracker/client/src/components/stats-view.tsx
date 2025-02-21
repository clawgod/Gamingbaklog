import { useQuery } from "@tanstack/react-query";
import type { Log } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StatsView() {
  const { data: logs } = useQuery<Log[]>({
    queryKey: ["/api/logs"],
  });

  // Group rewards by name and calculate totals
  const rewardTotals = logs
    ?.filter((log) => log.type === "reward")
    .reduce((acc, log) => {
      const key = log.name;
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += log.amount || 0;
      return acc;
    }, {} as Record<string, number>);

  const todayLogs = logs?.filter((log) => {
    const today = new Date();
    const logDate = new Date(log.timestamp);
    return (
      logDate.getDate() === today.getDate() &&
      logDate.getMonth() === today.getMonth() &&
      logDate.getFullYear() === today.getFullYear()
    );
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rewardTotals && Object.entries(rewardTotals).map(([name, total]) => (
        <Card key={name}>
          <CardHeader>
            <CardTitle className="truncate">{name}</CardTitle>
            <CardDescription>Total rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{total}</p>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Today's Logs</CardTitle>
          <CardDescription>Number of logs today</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{todayLogs?.length || 0}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {logs?.slice(0, 3).map((log) => (
              <div key={log.id} className="text-sm">
                {log.name} {log.subsection && `(${log.subsection})`} - {new Date(log.timestamp).toLocaleTimeString()}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}