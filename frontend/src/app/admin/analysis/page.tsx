"use client";

import { useState } from "react";
import { Header } from "@/components/layouts/Header";
import { SidebarTaskList } from "@/components/dashboard/analysis/SidebarTaskList";
import { DatasetAnalysis } from "@/components/dashboard/analysis/DatasetAnalysis";
import type { Task } from "@/types";

export default function AdminAnalysisPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  return (
    <div className="flex flex-col h-full bg-background">
      <Header title="Analysis Dashboard" subtitle="Analyze customer complaints and feedback data" />
      <div className="flex-1 flex overflow-hidden bg-background">
        <div className="w-80 border-r overflow-hidden bg-background">
          <SidebarTaskList
            onTaskSelect={setSelectedTask}
            selectedTaskId={selectedTask?.uid}
          />
        </div>
        <div className="flex-1 overflow-hidden bg-background">
          {selectedTask ? (
            <DatasetAnalysis task={selectedTask} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a completed task to view analysis
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
