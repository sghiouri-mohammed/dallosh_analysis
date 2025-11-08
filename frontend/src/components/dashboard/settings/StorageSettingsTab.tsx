"use client";

import { useState, useEffect } from "react";
import { settingsService } from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Edit, Circle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateUID } from "@/lib/utils";
import { StorageProviderModal } from "./StorageProviderModal";
import type { Settings, StorageTarget } from "@/types";
import { useAuthStore } from "@/stores";

export function StorageSettingsTab() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"local" | "automatic" | "external">("automatic");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<StorageTarget | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsService.get();
      setSettings(data);
      if (data.data.storage) {
        const storageMode = data.data.storage.preferences.mode || "automatic";
        setMode(storageMode as "local" | "automatic" | "external");
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.updateStorage({
        preferences: {
          mode,
        },
      });
      await loadSettings();
      alert("Storage settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAddProvider = () => {
    setEditingProvider(null);
    setModalOpen(true);
  };

  const handleEditProvider = (provider: StorageTarget) => {
    setEditingProvider(provider);
    setModalOpen(true);
  };

  const handleSaveProvider = async (providerData: Partial<StorageTarget["data"]>) => {
    if (!settings) return;

    const now = new Date();
    const userId = user?.uid || "system";

    if (editingProvider) {
      // Update existing provider
      const updatedProviders = (settings.data.storage?.target || []).map((provider) => {
        if (provider.uid === editingProvider.uid) {
          return {
            ...provider,
            data: { ...provider.data, ...providerData },
            updatedAt: now,
            updatedBy: userId,
          };
        }
        return provider;
      });

      await settingsService.updateStorage({
        target: updatedProviders,
      });
    } else {
      // Add new provider
      const newProvider: StorageTarget = {
        uid: generateUID(),
        data: {
          url: providerData.url || "",
          method: providerData.method || "GET",
          headers: providerData.headers || {},
          body: providerData.body || {},
          provider: providerData.provider || "",
        },
        createdAt: now,
        createdBy: userId,
        updatedAt: now,
        updatedBy: userId,
      };

      const existingProviders = settings.data.storage?.target || [];

      await settingsService.updateStorage({
        target: [...existingProviders, newProvider],
      });
    }

    await loadSettings();
  };

  const handleDeleteProvider = async (providerId: string) => {
    if (!confirm("Are you sure you want to delete this provider?")) return;
    if (!settings) return;

    const updatedProviders = (settings.data.storage?.target || []).filter(
      (provider) => provider.uid !== providerId
    );

    try {
      await settingsService.updateStorage({
        target: updatedProviders,
      });
      await loadSettings();
      alert("Provider deleted successfully");
    } catch (error) {
      console.error("Failed to delete provider:", error);
      alert("Failed to delete provider");
    }
  };

  const handleEditHeaders = (provider: StorageTarget) => {
    // Open a dialog to edit headers
    const headersStr = JSON.stringify(provider.data.headers || {}, null, 2);
    const newHeadersStr = prompt("Edit Headers (JSON):", headersStr);
    if (newHeadersStr === null) return;

    try {
      const parsedHeaders = JSON.parse(newHeadersStr);
      handleSaveProvider({
        ...provider.data,
        headers: parsedHeaders,
      });
    } catch {
      alert("Invalid JSON format");
    }
  };

  if (loading) {
    return <div className="p-6">Loading storage settings...</div>;
  }

  const storageTargets = settings?.data.storage?.target || [];

  const getStatusColor = (index: number) => {
    if (index === 0) return "bg-green-500";
    if (index === 1) return "bg-yellow-500";
    if (index === 2) return "bg-green-500";
    return "bg-gray-500";
  };

  const getStatusText = (index: number) => {
    if (index === 0) return "Connected";
    if (index === 1) return "Idle";
    if (index === 2) return "Connected";
    return "Unknown";
  };

  return (
    <>
      <div className="space-y-8">
        {/* Storage Mode */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Storage Mode</h3>
            <p className="text-sm text-muted-foreground">
              Automatic mode will fallback to local storage to save the processed dataset files if the external storage provider does not work.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === "local" ? "default" : "outline"}
              className={cn(
                "h-10 px-6",
                mode === "local" 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "bg-background border-border hover:bg-muted"
              )}
              onClick={() => setMode("local")}
            >
              Local
            </Button>
            <Button
              type="button"
              variant={mode === "automatic" ? "default" : "outline"}
              className={cn(
                "h-10 px-6",
                mode === "automatic" 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "bg-background border-border hover:bg-muted"
              )}
              onClick={() => setMode("automatic")}
            >
              Automatic
            </Button>
            <Button
              type="button"
              variant={mode === "external" ? "default" : "outline"}
              className={cn(
                "h-10 px-6",
                mode === "external" 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "bg-background border-border hover:bg-muted"
              )}
              onClick={() => setMode("external")}
            >
              External
            </Button>
          </div>
        </div>

        {/* External Providers */}
        <div className="space-y-4 border-t border-border pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">External Providers</h3>
              <p className="text-sm text-muted-foreground">
                Configure Storage for provider (max 3)
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleAddProvider}
              disabled={storageTargets.length >= 3}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-9"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Model
            </Button>
          </div>
          <div className="space-y-4">
            {storageTargets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No storage providers configured. Click "Add Model" to add one.
              </p>
            ) : (
              storageTargets.map((target, index) => (
                <Card
                  key={target.uid}
                  className={cn(
                    "border",
                    index === 0 ? "bg-primary/5 border-primary/20" : "bg-background"
                  )}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Circle
                          className={cn(
                            "h-3 w-3",
                            index === 0 ? "fill-primary text-primary" : "fill-muted-foreground text-muted-foreground"
                          )}
                        />
                        <span className="text-sm font-medium text-foreground">Priority {index + 1}</span>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">Provider Name</Label>
                          <Input
                            value={target.data.provider || ""}
                            readOnly
                            className="h-10 bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">
                            {index === 0 ? "API Endpoint URL" : "API Base URL"}
                          </Label>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-10 w-20 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-medium"
                            >
                              {target.data.method || "GET"}
                            </Button>
                            <Input
                              value={target.data.url || ""}
                              readOnly
                              className="h-10 bg-background flex-1"
                            />
                          </div>
                        </div>
                        {index !== 2 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Headers</Label>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 border border-border"
                              onClick={() => handleEditHeaders(target)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={cn("h-2 w-2 rounded-full", getStatusColor(index))} />
                            <span className="text-sm text-foreground">{getStatusText(index)}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditProvider(target)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDeleteProvider(target.uid)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <StorageProviderModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSaveProvider}
        provider={editingProvider}
      />
    </>
  );
}
