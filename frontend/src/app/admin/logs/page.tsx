import { Header } from "@/components/layouts/Header";
import { LogsActivities } from "@/components/dashboard/logs/LogsActivities";

export default function AdminLogsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Logs" subtitle="Platform activity logs" />
      <div className="flex-1 overflow-auto p-6">
        <LogsActivities />
      </div>
    </div>
  );
}

