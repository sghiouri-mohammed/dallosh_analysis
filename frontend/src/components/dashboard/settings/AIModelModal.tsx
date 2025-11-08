"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AIModel } from "@/types";

interface AIModelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (model: Partial<AIModel["data"]>) => Promise<void>;
  model?: AIModel | null;
  type: "local" | "external";
}

export function AIModelModal({
  open,
  onOpenChange,
  onSave,
  model,
  type,
}: AIModelModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    model: "",
    baseUrl: "",
    apiKey: "",
    retryRequests: 3,
    paginateRowsLimit: 500,
    provider: "", // For external models
  });

  useEffect(() => {
    if (model) {
      setFormData({
        model: model.data.model || "",
        baseUrl: model.data.baseUrl || "",
        apiKey: model.data.apiKey || "",
        retryRequests: model.data.retryRequests || 3,
        paginateRowsLimit: model.data.paginateRowsLimit || 500,
        provider: (model.data as any).provider || "",
      });
    } else {
      setFormData({
        model: "",
        baseUrl: type === "local" ? "localhost:11434" : "",
        apiKey: "",
        retryRequests: 3,
        paginateRowsLimit: 500,
        provider: "",
      });
    }
    setError("");
  }, [model, open, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!formData.model.trim()) {
      setError("Model name is required");
      setLoading(false);
      return;
    }

    if (!formData.baseUrl.trim()) {
      setError("API Base URL is required");
      setLoading(false);
      return;
    }

    if (formData.retryRequests < 1 || formData.retryRequests > 10) {
      setError("Retry requests must be between 1 and 10");
      setLoading(false);
      return;
    }

    if (formData.paginateRowsLimit < 1 || formData.paginateRowsLimit > 5000) {
      setError("Paginate rows limit must be between 1 and 5000");
      setLoading(false);
      return;
    }

    try {
      const modelData: Partial<AIModel["data"]> = {
        model: formData.model.trim(),
        baseUrl: formData.baseUrl.trim(),
        apiKey: formData.apiKey.trim(),
        retryRequests: formData.retryRequests,
        paginateRowsLimit: formData.paginateRowsLimit,
      };

      // Add provider for external models if provided
      if (type === "external" && formData.provider) {
        (modelData as any).provider = formData.provider.trim();
      }

      await onSave(modelData);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save model");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {model ? `Edit ${type === "local" ? "Local" : "External"} Model` : `Add ${type === "local" ? "Local" : "External"} Model`}
          </DialogTitle>
          <DialogDescription>
            {type === "local"
              ? "Configure an Ollama local AI model"
              : "Configure a cloud-based AI service"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="model" className="text-sm font-medium">
                Model Name
              </Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder={type === "local" ? "e.g., Qwen3:4b" : "e.g., GPT-4"}
                className="h-10"
                required
              />
            </div>
            {type === "external" && (
              <div className="space-y-2">
                <Label htmlFor="provider" className="text-sm font-medium">
                  Provider
                </Label>
                <Input
                  id="provider"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="e.g., Google, OpenAI, UX Pilot AI"
                  className="h-10"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="baseUrl" className="text-sm font-medium">
                API Base URL
              </Label>
              <Input
                id="baseUrl"
                value={formData.baseUrl}
                onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                placeholder={type === "local" ? "localhost:11434" : "https://api.example.com"}
                className="h-10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-sm font-medium">
                API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="Enter API key"
                className="h-10 font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="retryRequests" className="text-sm font-medium">
                  Retry Requests
                </Label>
                <Input
                  id="retryRequests"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.retryRequests}
                  onChange={(e) => setFormData({ ...formData, retryRequests: parseInt(e.target.value) || 3 })}
                  className="h-10"
                  required
                />
                <p className="text-xs text-muted-foreground">Max: 10</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paginateRowsLimit" className="text-sm font-medium">
                  Paginate Rows Limit
                </Label>
                <Input
                  id="paginateRowsLimit"
                  type="number"
                  min="1"
                  max="5000"
                  value={formData.paginateRowsLimit}
                  onChange={(e) => setFormData({ ...formData, paginateRowsLimit: parseInt(e.target.value) || 500 })}
                  className="h-10"
                  required
                />
                <p className="text-xs text-muted-foreground">Max: 5000</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? "Saving..." : model ? "Update" : "Add"} Model
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

