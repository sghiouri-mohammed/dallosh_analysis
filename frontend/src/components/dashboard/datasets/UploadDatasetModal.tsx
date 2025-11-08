"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { filesService } from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Globe, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UploadDatasetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UploadDatasetModal({ open, onOpenChange, onSuccess }: UploadDatasetModalProps) {
  const router = useRouter();
  const [source, setSource] = useState<"local" | "external">("local");
  const [file, setFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // External API fields
  const [protocol, setProtocol] = useState("HTTPS");
  const [method, setMethod] = useState("GET");
  const [endpointUrl, setEndpointUrl] = useState("");
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([{ key: "", value: "" }]);
  const [requestType, setRequestType] = useState<"one-time" | "recurring">("one-time");
  const [frequency, setFrequency] = useState("Daily");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile);
        if (!datasetName) {
          setDatasetName(droppedFile.name.replace(".csv", ""));
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!datasetName) {
        setDatasetName(selectedFile.name.replace(".csv", ""));
      }
    }
  };

  const handleAddHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleHeaderChange = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const handleSubmit = async () => {
    if (source === "local") {
      if (!file) {
        toast.error("Please select a file");
        return;
      }
      setUploading(true);
      try {
        await filesService.upload(file);
        onSuccess();
        onOpenChange(false);
        resetForm();
        
        // Show success toast notification with "Go to Task" button
        toast.success(
          <div className="flex flex-col gap-2">
            <p className="font-medium">File uploaded successfully!</p>
            <p className="text-sm text-muted-foreground">
              You can now go to the task page to process the dataset.
            </p>
            <Button
              size="sm"
              className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => {
                toast.dismiss();
                router.push("/admin/tasks");
              }}
            >
              Go to Task
            </Button>
          </div>,
          {
            duration: 10000, // Show for 10 seconds
            position: "bottom-right",
          }
        );
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to upload file");
      } finally {
        setUploading(false);
      }
    } else {
      // External API - This would need backend support
      toast.info("External API dataset creation will be implemented");
    }
  };

  const resetForm = () => {
    setFile(null);
    setDatasetName("");
    setSource("local");
    setProtocol("HTTPS");
    setMethod("GET");
    setEndpointUrl("");
    setHeaders([{ key: "", value: "" }]);
    setRequestType("one-time");
    setFrequency("Daily");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Dataset</DialogTitle>
          <DialogDescription>
            {source === "local"
              ? "Upload a CSV file from your local machine"
              : "Configure an external API data source"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dataset Name */}
          <div className="space-y-2">
            <Label htmlFor="datasetName">Dataset Name</Label>
            <Input
              id="datasetName"
              placeholder="Enter dataset name..."
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
            />
          </div>

          {/* Source Selection */}
          <div className="space-y-2">
            <Label>Data Source</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={source === "local" ? "default" : "outline"}
                className={cn("flex-1", source === "local" && "bg-primary")}
                onClick={() => setSource("local")}
              >
                <Upload className="mr-2 h-4 w-4" />
                Local File
              </Button>
              <Button
                type="button"
                variant={source === "external" ? "default" : "outline"}
                className={cn("flex-1", source === "external" && "bg-primary")}
                onClick={() => setSource("external")}
              >
                <Globe className="mr-2 h-4 w-4" />
                External API
              </Button>
            </div>
          </div>

          {/* Local File Upload */}
          {source === "local" && (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                file && "border-primary bg-primary/5"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-primary font-medium mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-muted-foreground">
                  CSV files up to 10MB
                </p>
                {file && (
                  <p className="mt-4 text-sm font-medium text-foreground">
                    Selected: {file.name}
                  </p>
                )}
              </label>
            </div>
          )}

          {/* External API Configuration */}
          {source === "external" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="protocol">Protocol</Label>
                  <select
                    id="protocol"
                    value={protocol}
                    onChange={(e) => setProtocol(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="HTTPS">HTTPS</option>
                    <option value="HTTP">HTTP</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method">Method</Label>
                  <select
                    id="method"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endpointUrl">Endpoint URL</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-20"
                  >
                    {method}
                  </Button>
                  <Input
                    id="endpointUrl"
                    placeholder="https://api.example.com/data"
                    value={endpointUrl}
                    onChange={(e) => setEndpointUrl(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Headers</Label>
                <div className="space-y-2">
                  {headers.map((header, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Key"
                        value={header.key}
                        onChange={(e) => handleHeaderChange(index, "key", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Value"
                        value={header.value}
                        onChange={(e) => handleHeaderChange(index, "value", e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveHeader(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddHeader}
                  >
                    + Add Header
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Request Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={requestType === "one-time" ? "default" : "outline"}
                    className={cn("flex-1", requestType === "one-time" && "bg-primary")}
                    onClick={() => setRequestType("one-time")}
                  >
                    One-time
                  </Button>
                  <Button
                    type="button"
                    variant={requestType === "recurring" ? "default" : "outline"}
                    className={cn("flex-1", requestType === "recurring" && "bg-primary")}
                    onClick={() => setRequestType("recurring")}
                  >
                    Recurring
                  </Button>
                </div>
              </div>

              {requestType === "recurring" && (
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <select
                    id="frequency"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => {
            onOpenChange(false);
            resetForm();
          }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={uploading}>
            {source === "local" ? "Add Dataset" : "Create Dataset"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

