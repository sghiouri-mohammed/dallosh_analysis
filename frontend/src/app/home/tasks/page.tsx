"use client";

import { useState } from "react";
import { Header } from "@/components/layouts/Header";
import { SidebarFilesList } from "@/components/dashboard/tasks/SidebarFilesList";
import { TaskDetail } from "@/components/dashboard/tasks/TaskDetail";
import type { File } from "@/types";

export default function HomeTasksPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <div className="flex flex-col h-full">
      <Header title="Tasks" subtitle="Your dataset processing tasks" />
      <div className="flex-1 flex overflow-hidden bg-background">
        <div className="w-80 border-r overflow-hidden bg-background">
          <SidebarFilesList
            onFileSelect={setSelectedFile}
            selectedFileId={selectedFile?.uid}
          />
        </div>
        <div className="flex-1 overflow-hidden bg-background">
          {selectedFile ? (
            <TaskDetail file={selectedFile} onTaskDeleted={() => setSelectedFile(null)} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a file to view task details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

