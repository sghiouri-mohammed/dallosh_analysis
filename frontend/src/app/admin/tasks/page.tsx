"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Moon, Sun, Bell, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores";
import { SidebarFilesList } from "@/components/dashboard/tasks/SidebarFilesList";
import { TaskDetail } from "@/components/dashboard/tasks/TaskDetail";
import type { File } from "@/types";

export default function AdminTasksPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = "/landing";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Custom Header for Tasks Page */}
      <header className="flex h-14 items-center justify-between border-b bg-background px-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Tasks Management</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.data.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

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
