"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { tasksService, filesService } from "@/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Play, RotateCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { File, Task, TaskStatus } from "@/types";
import { TaskActivityLogs } from "./TaskActivityLogs";

interface TaskDetailProps {
  file: File;
  onTaskDeleted?: () => void;
}

const STATUS_STEPS: TaskStatus[] = [
  "added",
  "in_queue",
  "reading_dataset",
  "reading_dataset_done",
  "process_cleaning",
  "process_cleaning_done",
  "sending_to_llm",
  "sending_to_llm_done",
  "appending_collumns",
  "appending_collumns_done",
  "saving_file",
  "saving_file_done",
  "done",
];

interface TaskEvent {
  type: string;
  file_id: string;
  event: string;
  timestamp: string;
  data?: any;
}

export function TaskDetail({ file, onTaskDeleted }: TaskDetailProps) {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [currentStatus, setCurrentStatus] = useState<TaskStatus>("added");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<TaskEvent[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [hasShownDoneToast, setHasShownDoneToast] = useState(false);

  useEffect(() => {
    loadTask();
    setupEventSource();
    return () => {
      // Cleanup EventSource
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [file.uid]);

  const loadTask = async () => {
    try {
      console.log(`[TaskDetail] Loading task for file: ${file.uid}`);
      const tasks = await tasksService.findAll({ "data.file_id": file.uid });
      console.log(`[TaskDetail] Found ${tasks.length} task(s) for file ${file.uid}:`, tasks);
      
      if (tasks.length > 0) {
        const foundTask = tasks[0];
        setTask(foundTask);
        const status = foundTask.data.status as TaskStatus;
        console.log(`[TaskDetail] Task status: ${status}`);
        setCurrentStatus(status);
        updateProgress(status);
        
        // Load existing events from task status to show current progress
        // The status field tells us where we are in the process
        if (status && status !== "added") {
          // Task is in progress or completed, we can infer completed steps
          // Events will update this in real-time via SSE
        }
      } else {
        // No task exists yet
        console.log(`[TaskDetail] No task found for file ${file.uid}`);
        setTask(null);
        setCurrentStatus("added");
        updateProgress("added");
      }
    } catch (error) {
      console.error("[TaskDetail] Failed to load task:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupEventSource = () => {
    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create new EventSource connection to backend SSE endpoint
    // Use backend API URL for SSE (backend handles RabbitMQ connection)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const eventSource = new EventSource(
      `${apiUrl}/api/tasks/events?fileId=${file.uid}`
    );
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data: TaskEvent = JSON.parse(event.data);
        
        if (data.type === "connected") {
          console.log("Connected to task events stream");
          return;
        }

        if (data.type === "error") {
          console.error("Event stream error:", data);
          return;
        }

        if (data.type === "event" && data.file_id === file.uid) {
          // Update status based on event name
          const eventName = data.event as TaskStatus;
          setCurrentStatus(eventName);
          updateProgress(eventName);
          
          // Store event for activity logs
          setEvents((prev) => [...prev, data]);
          
          // Show toast notification when task is done
          if (eventName === "done" && !hasShownDoneToast) {
            setHasShownDoneToast(true);
            toast.success(
              <div className="flex flex-col gap-2">
                <p className="font-medium">Task completed successfully!</p>
                <p className="text-sm text-muted-foreground">
                  Your dataset has been processed and is ready for analysis.
                </p>
                <Button
                  size="sm"
                  className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => {
                    toast.dismiss();
                    router.push("/admin/analysis");
                  }}
                >
                  Go to Analysis
                </Button>
              </div>,
              {
                duration: 10000,
                position: "bottom-right",
              }
            );
          }
          
          // Reload task to get latest data from database (microservice should have updated it)
          // This ensures we have the latest status even if events are missed
          setTimeout(() => {
            loadTask();
          }, 500);
        }
      } catch (error) {
        console.error("Error parsing event:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      // Try to reconnect after a delay
      setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          setupEventSource();
        }
      }, 3000);
    };
  };

  const updateProgress = (status: TaskStatus) => {
    const currentIndex = STATUS_STEPS.indexOf(status);
    const totalSteps = STATUS_STEPS.length;
    const calculatedProgress = currentIndex >= 0 ? ((currentIndex + 1) / totalSteps) * 100 : 0;
    setProgress(calculatedProgress);
  };

  const handleProceed = async () => {
    try {
      await tasksService.proceed({
        fileId: file.uid,
        filePath: file.data.file_path,
      });
      await loadTask();
    } catch (error) {
      console.error("Failed to proceed task:", error);
    }
  };

  const handleDownload = async (source: "cleaned" | "analysed") => {
    try {
      await filesService.downloadFile(file.uid, source);
    } catch (error) {
      console.error("Failed to download file:", error);
      toast.error("Failed to download file");
    }
  };

  const handleRestart = async () => {
    if (!confirm("Are you sure you want to restart this task? This will delete the cleaned and analysed files.")) {
      return;
    }
    try {
      await tasksService.restart(file.uid);
      setHasShownDoneToast(false);
      await loadTask();
      toast.success("Task restarted successfully");
    } catch (error) {
      console.error("Failed to restart task:", error);
      toast.error("Failed to restart task");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task? This will permanently delete the task and associated files.")) {
      return;
    }
    try {
      await tasksService.deleteWithFiles(file.uid);
      toast.success("Task deleted successfully");
      // Call callback to clear selection
      if (onTaskDeleted) {
        onTaskDeleted();
      } else {
        // Fallback: reload the page
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task");
    }
  };

  if (loading) {
    return <div className="p-6">Loading task details...</div>;
  }

  // If no task exists (after loading), show message to create one
  // We check if task is null and we've finished loading
  const hasNoTask = !task && !loading;
  
  if (hasNoTask) {
    return (
      <div className="h-full overflow-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No Task Found</h3>
              <p className="text-sm text-muted-foreground mb-6">
                This file doesn't have an associated task. Create one to start processing.
              </p>
              <Button
                onClick={async () => {
                  try {
                    await tasksService.create({
                      file_id: file.uid,
                      file_path: file.data.file_path,
                      status: "added",
                      file_cleaned: { path: null, type: null },
                      file_analysed: { path: null, type: null },
                    });
                    await loadTask();
                    toast.success("Task created successfully");
                  } catch (error) {
                    console.error("Failed to create task:", error);
                    toast.error("Failed to create task");
                  }
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Create Task
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canProceed = currentStatus === "added";
  const canRestart = currentStatus === "done" || currentStatus === "on_error";
  const canDelete = task !== null;
  const filename = file.data.filename.replace('.csv', '');

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Task Header with Action Buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{filename}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Dataset processing task
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canProceed && (
            <Button
              onClick={handleProceed}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Play className="mr-2 h-4 w-4" />
              Start
            </Button>
          )}
          {canRestart && (
            <Button
              onClick={handleRestart}
              variant="outline"
              size="sm"
            >
              <RotateCw className="mr-2 h-4 w-4" />
              Restart
            </Button>
          )}
          {canDelete && (
            <Button
              onClick={handleDelete}
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs */}
      <Card>
        <CardContent className="pt-6">
          <TaskActivityLogs 
            currentStatus={currentStatus} 
            fileId={file.uid}
            events={events}
          />
        </CardContent>
      </Card>

      {/* Download Buttons */}
      {(task?.data.file_cleaned?.path || task?.data.file_analysed?.path) && (
        <div className="flex gap-2">
          {task?.data.file_cleaned?.path && (
            <Button
              variant="outline"
              onClick={() => handleDownload("cleaned")}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Cleaned
            </Button>
          )}
          {task?.data.file_analysed?.path && (
            <Button
              variant="outline"
              onClick={() => handleDownload("analysed")}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Analysed
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
