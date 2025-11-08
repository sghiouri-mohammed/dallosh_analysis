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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { StorageTarget } from "@/types";

interface StorageProviderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (provider: Partial<StorageTarget["data"]>) => Promise<void>;
  provider?: StorageTarget | null;
}

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export function StorageProviderModal({
  open,
  onOpenChange,
  onSave,
  provider,
}: StorageProviderModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    provider: "",
    url: "",
    method: "GET",
    headers: "{}",
    body: "{}",
  });

  useEffect(() => {
    if (provider) {
      setFormData({
        provider: provider.data.provider || "",
        url: provider.data.url || "",
        method: provider.data.method || "GET",
        headers: JSON.stringify(provider.data.headers || {}, null, 2),
        body: JSON.stringify(provider.data.body || {}, null, 2),
      });
    } else {
      setFormData({
        provider: "",
        url: "",
        method: "GET",
        headers: "{}",
        body: "{}",
      });
    }
    setError("");
  }, [provider, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!formData.provider.trim()) {
      setError("Provider name is required");
      setLoading(false);
      return;
    }

    if (!formData.url.trim()) {
      setError("API Endpoint URL is required");
      setLoading(false);
      return;
    }

    // Validate JSON for headers and body
    let parsedHeaders: Record<string, string> = {};
    let parsedBody: Record<string, any> = {};

    try {
      parsedHeaders = JSON.parse(formData.headers);
    } catch {
      setError("Headers must be valid JSON");
      setLoading(false);
      return;
    }

    try {
      parsedBody = JSON.parse(formData.body);
    } catch {
      setError("Body must be valid JSON");
      setLoading(false);
      return;
    }

    try {
      const providerData: Partial<StorageTarget["data"]> = {
        provider: formData.provider.trim(),
        url: formData.url.trim(),
        method: formData.method,
        headers: parsedHeaders,
        body: parsedBody,
      };

      await onSave(providerData);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save provider");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {provider ? "Edit Storage Provider" : "Add Storage Provider"}
          </DialogTitle>
          <DialogDescription>
            Configure an external storage provider (AWS, Azure, Google Cloud, etc.)
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
              <Label htmlFor="provider" className="text-sm font-medium">
                Provider Name
              </Label>
              <Input
                id="provider"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="e.g., AWS, Azure, OVH, Google Cloud"
                className="h-10"
                required
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="space-y-2">
                <Label htmlFor="method" className="text-sm font-medium">
                  Method
                </Label>
                <Select
                  value={formData.method}
                  onValueChange={(value) => setFormData({ ...formData, method: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HTTP_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-3">
                <Label htmlFor="url" className="text-sm font-medium">
                  API Endpoint URL
                </Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://api.example.com/endpoint"
                  className="h-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="headers" className="text-sm font-medium">
                Headers (JSON)
              </Label>
              <Textarea
                id="headers"
                value={formData.headers}
                onChange={(e) => setFormData({ ...formData, headers: e.target.value })}
                placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                className="h-24 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enter headers as JSON object
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="body" className="text-sm font-medium">
                Body (JSON)
              </Label>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder='{"bucket": "my-bucket", "key": "path/to/file"}'
                className="h-24 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enter request body as JSON object
              </p>
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
              {loading ? "Saving..." : provider ? "Update" : "Add"} Provider
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

