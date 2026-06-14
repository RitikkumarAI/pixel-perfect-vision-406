import { createFileRoute } from "@tanstack/react-router";
import { FounderCommandCenter } from "@/components/dashboard/FounderCommandCenter";

export const Route = createFileRoute("/dashboard/analytics")({
  component: AnalyticsRoute,
});

function AnalyticsRoute() {
  return (
    <div className="h-full bg-slate-50 overflow-auto rounded-xl border border-slate-200">
      <FounderCommandCenter />
    </div>
  );
}
