import LogForm from "@/components/log-form";
import GameForm from "@/components/game-form";
import StatsView from "@/components/stats-view";
import CustomTypeForm from "@/components/custom-type-form";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Track your gaming progress and rewards
        </p>
      </div>

      <StatsView />

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold mb-4">Add New Game</h3>
          <GameForm />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Add New Log</h3>
          <div className="space-y-8">
          <LogForm />
          <div className="border-t pt-8">
            <h2 className="text-lg font-medium mb-4">Create Custom Log Type</h2>
            <CustomTypeForm />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}