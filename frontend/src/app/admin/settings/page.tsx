"use client";

import { Header } from "@/components/layouts/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettingsTab } from "@/components/dashboard/settings/GeneralSettingsTab";
import { AISettingsTab } from "@/components/dashboard/settings/AISettingsTab";
import { StorageSettingsTab } from "@/components/dashboard/settings/StorageSettingsTab";

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" subtitle="Manage your application configuration and preferences" />
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="h-10 bg-transparent p-0 border-b border-border rounded-none mb-6">
            <TabsTrigger 
              value="general" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=inactive]:text-muted-foreground rounded-none border-b-2 border-transparent px-4 pb-3"
            >
              General
            </TabsTrigger>
            <TabsTrigger 
              value="ai"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=inactive]:text-muted-foreground rounded-none border-b-2 border-transparent px-4 pb-3"
            >
              AI Configuration
            </TabsTrigger>
            <TabsTrigger 
              value="storage"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=inactive]:text-muted-foreground rounded-none border-b-2 border-transparent px-4 pb-3"
            >
              Storage Configuration
            </TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="mt-0">
            <GeneralSettingsTab />
          </TabsContent>
          <TabsContent value="ai" className="mt-0">
            <AISettingsTab />
          </TabsContent>
          <TabsContent value="storage" className="mt-0">
            <StorageSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

