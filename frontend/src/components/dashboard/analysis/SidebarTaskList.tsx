"use client";

import { useState, useEffect } from "react";
import { tasksService, filesService } from "@/services";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, File } from "@/types";

interface SidebarTaskListProps {
  onTaskSelect: (task: Task) => void;
  selectedTaskId?: string;
}

interface TaskWithFile extends Task {
  file?: File;
}

export function SidebarTaskList({ onTaskSelect, selectedTaskId }: SidebarTaskListProps) {
  const [tasks, setTasks] = useState<TaskWithFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      // Only load tasks with status 'done'
      const data = await tasksService.findAll({ "data.status": "done" });
      
      // Load file information for each task
      const tasksWithFiles = await Promise.all(
        data.map(async (task) => {
          try {
            const file = await filesService.findOne(task.data.file_id);
            return { ...task, file };
          } catch (error) {
            console.error(`Failed to load file for task ${task.uid}:`, error);
            return { ...task, file: undefined };
          }
        })
      );
      
      setTasks(tasksWithFiles);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const searchLower = searchQuery.toLowerCase();
    const filename = task.file?.data.filename || "";
    return task.uid.toLowerCase().includes(searchLower) ||
      task.data.file_id.toLowerCase().includes(searchLower) ||
      filename.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading tasks...</div>;
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-3 text-foreground">Datasets</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search datasets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto divide-y">
        {filteredTasks.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No completed tasks found
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isSelected = selectedTaskId === task.uid;
            return (
              <div
                key={task.uid}
                className={cn(
                  "p-4 cursor-pointer hover:bg-accent transition-colors bg-background",
                  isSelected && "bg-accent border-l-4 border-primary"
                )}
                onClick={() => onTaskSelect(task)}
              >
                <div className="flex items-start gap-3">
                  <FileText className={cn(
                    "h-5 w-5 mt-0.5 flex-shrink-0",
                    isSelected ? "text-primary" : "text-primary"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium text-sm truncate",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      {task.file?.data.filename || task.data.file_id}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="default" className="bg-green-500 text-xs">
                        Processed
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {task.data.file_analysed ? "Analysed" : "Processing"}
                      </span>
                    </div>
                    <p className="text-xs mt-1 text-muted-foreground">
                      Updated {new Date(task.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {filteredTasks.length > 0 && (
        <div className="p-4 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>Page 1 of 3</span>
          <div className="flex gap-1">
            <button className="p-1 hover:bg-accent rounded">←</button>
            <button className="p-1 hover:bg-accent rounded">→</button>
          </div>
        </div>
      )}
    </div>
  );
}

