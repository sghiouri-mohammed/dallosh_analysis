"use client";

import { useState, useEffect } from "react";
import { settingsService } from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Edit, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateUID } from "@/lib/utils";
import { AIModelModal } from "./AIModelModal";
import type { Settings, AIMode, AIModel } from "@/types";
import { useAuthStore } from "@/stores";

export function AISettingsTab() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<AIMode>("automatic");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"local" | "external">("local");
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsService.get();
      setSettings(data);
      if (data.data.ai) {
        setMode(data.data.ai.preferences.mode || "automatic");
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
      await settingsService.updateAI({
        preferences: {
          mode,
        },
      });
      await loadSettings();
      alert("AI settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAddModel = (type: "local" | "external") => {
    setModalType(type);
    setEditingModel(null);
    setModalOpen(true);
  };

  const handleEditModel = (model: AIModel, type: "local" | "external") => {
    setModalType(type);
    setEditingModel(model);
    setModalOpen(true);
  };

  const handleSaveModel = async (modelData: Partial<AIModel["data"]>) => {
    if (!settings) return;

    const now = new Date();
    const userId = user?.uid || "system";

    if (editingModel) {
      // Update existing model
      const updatedModels = (modalType === "local" 
        ? settings.data.ai?.local || []
        : settings.data.ai?.external || []
      ).map((model) => {
        if (model.uid === editingModel.uid) {
          return {
            ...model,
            data: { ...model.data, ...modelData },
            updatedAt: now,
            updatedBy: userId,
          };
        }
        return model;
      });

      await settingsService.updateAI({
        [modalType === "local" ? "local" : "external"]: updatedModels,
      });
    } else {
      // Add new model
      const newModel: AIModel = {
        uid: generateUID(),
        data: {
          model: modelData.model || "",
          baseUrl: modelData.baseUrl || "",
          apiKey: modelData.apiKey || "",
          retryRequests: modelData.retryRequests || 3,
          paginateRowsLimit: modelData.paginateRowsLimit || 500,
        },
        createdAt: now,
        createdBy: userId,
        updatedAt: now,
        updatedBy: userId,
      };

      const existingModels = modalType === "local"
        ? settings.data.ai?.local || []
        : settings.data.ai?.external || [];

      await settingsService.updateAI({
        [modalType === "local" ? "local" : "external"]: [...existingModels, newModel],
      });
    }

    await loadSettings();
  };

  const handleDeleteModel = async (modelId: string, type: "local" | "external") => {
    if (!confirm("Are you sure you want to delete this model?")) return;
    if (!settings) return;

    const updatedModels = (type === "local"
      ? settings.data.ai?.local || []
      : settings.data.ai?.external || []
    ).filter((model) => model.uid !== modelId);

    try {
      await settingsService.updateAI({
        [type === "local" ? "local" : "external"]: updatedModels,
      });
      await loadSettings();
      alert("Model deleted successfully");
    } catch (error) {
      console.error("Failed to delete model:", error);
      alert("Failed to delete model");
    }
  };

  if (loading) {
    return <div className="p-6">Loading AI settings...</div>;
  }

  const localModels = settings?.data.ai?.local || [];
  const externalModels = settings?.data.ai?.external || [];

  const getStatusColor = (index: number, type: "local" | "external") => {
    if (type === "local") {
      if (index === 0) return "bg-green-500";
      if (index === 1) return "bg-yellow-500";
      if (index === 2) return "bg-green-500";
    } else {
      return "bg-green-500";
    }
    return "bg-gray-500";
  };

  const getStatusText = (index: number, type: "local" | "external") => {
    if (type === "local") {
      if (index === 0) return "Connected";
      if (index === 1) return "Idle";
      if (index === 2) return "Connected";
    } else {
      return "Active";
    }
    return "Unknown";
  };

  return (
    <>
      <div className="space-y-8">
        {/* AI Processing Mode */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">AI Processing Mode</h3>
            <p className="text-sm text-muted-foreground">
              Automatic mode will choose the best available model based on task complexity
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

        {/* Local Models */}
        <div className="space-y-4 border-t border-border pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Local Models</h3>
              <p className="text-sm text-muted-foreground">
                Configure Ollama local AI models (max 3)
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => handleAddModel("local")}
              disabled={localModels.length >= 3}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-9"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Model
            </Button>
          </div>
          <div className="space-y-4">
            {localModels.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No local models configured. Click "Add Model" to add one.
              </p>
            ) : (
              localModels.map((model, index) => (
                <Card
                  key={model.uid}
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
                          <Label className="text-sm font-medium text-foreground">Model Name</Label>
                          <Input
                            value={model.data.model}
                            readOnly
                            className="h-10 bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">API Base URL</Label>
                          <Input
                            value={model.data.baseUrl}
                            readOnly
                            className="h-10 bg-background"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={cn("h-2 w-2 rounded-full", getStatusColor(index, "local"))} />
                            <span className="text-sm text-foreground">{getStatusText(index, "local")}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditModel(model, "local")}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDeleteModel(model.uid, "local")}
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

        {/* External Models */}
        <div className="space-y-4 border-t border-border pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">External Models</h3>
              <p className="text-sm text-muted-foreground">
                Configure cloud-based AI services
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => handleAddModel("external")}
              disabled={externalModels.length >= 3}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-9"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Model
            </Button>
          </div>
          <div className="space-y-4">
            {externalModels.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No external models configured. Click "Add Model" to add one.
              </p>
            ) : (
              externalModels.map((model, index) => (
                <Card
                  key={model.uid}
                  className={cn(
                    "border",
                    index === 0 ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800" : "bg-background"
                  )}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Circle
                          className={cn(
                            "h-3 w-3",
                            index === 0 ? "fill-blue-500 text-blue-500" : "fill-muted-foreground text-muted-foreground"
                          )}
                        />
                        <span className="text-sm font-medium text-foreground">Priority {index + 1}</span>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">Model Name</Label>
                          <Input
                            value={model.data.model}
                            readOnly
                            className="h-10 bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">Provider</Label>
                          <Input
                            value={(model.data as any).provider || ""}
                            readOnly
                            className="h-10 bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">API Key</Label>
                          <Input
                            value={model.data.apiKey ? "•".repeat(12) : ""}
                            readOnly
                            className="h-10 bg-background font-mono"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={cn("h-2 w-2 rounded-full", getStatusColor(index, "external"))} />
                            <span className="text-sm text-foreground">{getStatusText(index, "external")}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditModel(model, "external")}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDeleteModel(model.uid, "external")}
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

      <AIModelModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSaveModel}
        model={editingModel}
        type={modalType}
      />
    </>
  );
}
