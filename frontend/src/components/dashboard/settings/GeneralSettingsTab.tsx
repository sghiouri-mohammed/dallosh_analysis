"use client";

import { useState, useEffect } from "react";
import { settingsService } from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Wrench, Shield } from "lucide-react";
import type { Settings } from "@/types";

const THEME_COLORS = [
  { name: "Red", value: "#DC2626" },
  { name: "Green", value: "#16A34A" },
  { name: "Blue", value: "#2563EB" },
  { name: "Purple", value: "#9333EA" },
  { name: "Orange", value: "#EA580C" },
];

export function GeneralSettingsTab() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    appName: "Dallosh Analysis",
    appLogo: "",
    primaryColor: "#DC2626",
    timeZone: "(UTC-05:00) Eastern Time (US & Canada)",
    language: "English (US)",
    isMaintenance: false,
    twoFactorAuth: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsService.get();
      setSettings(data);
      if (data.data.general) {
        setFormData({
          appName: data.data.general.appName || "Dallosh Analysis",
          appLogo: data.data.general.appLogo || "",
          primaryColor: data.data.general.primaryColor || "#DC2626",
          timeZone: data.data.general.timeZone || "(UTC-05:00) Eastern Time (US & Canada)",
          language: data.data.general.language || "English (US)",
          isMaintenance: data.data.general.isMaintenance || false,
          twoFactorAuth: data.data.general.twoFactorAuth ?? true,
        });
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
      await settingsService.updateGeneral(formData);
      await loadSettings();
      alert("Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle logo upload - would need to upload to backend
      console.log("Logo upload:", file);
    }
  };

  if (loading) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Branding Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Branding</h3>
          <p className="text-sm text-muted-foreground">
            Customize your application's appearance and identity
          </p>
        </div>
        <div className="space-y-4 pl-0">
          <div className="space-y-2">
            <Label htmlFor="appName" className="text-sm font-medium text-foreground">
              Application Name
            </Label>
            <Input
              id="appName"
              value={formData.appName}
              onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="appLogo" className="text-sm font-medium text-foreground">
              Application Logo
            </Label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground text-xl font-bold">D</span>
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/png,image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("logo-upload")?.click()}
                  className="h-9"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Logo
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: 512x512px, PNG or SVG
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="primaryColor" className="text-sm font-medium text-foreground">
              Primary Theme Color
            </Label>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {THEME_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, primaryColor: color.value })}
                    className={`
                      w-10 h-10 rounded border-2 transition-all
                      ${formData.primaryColor === color.value 
                        ? "border-white shadow-lg ring-2 ring-primary ring-offset-2" 
                        : "border-border hover:border-primary/50"
                      }
                    `}
                    style={{ backgroundColor: color.value }}
                    aria-label={color.name}
                  />
                ))}
              </div>
              <Input
                id="primaryColor"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="h-10 w-32 font-mono"
                placeholder="#DC2626"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Regional Settings Section */}
      <div className="space-y-6 border-t border-border pt-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Regional Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure timezone and localization preferences
          </p>
        </div>
        <div className="space-y-4 pl-0">
          <div className="space-y-2">
            <Label htmlFor="timeZone" className="text-sm font-medium text-foreground">
              Timezone
            </Label>
            <Select value={formData.timeZone} onValueChange={(value) => setFormData({ ...formData, timeZone: value })}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="(UTC-05:00) Eastern Time (US & Canada)">
                  (UTC-05:00) Eastern Time (US & Canada)
                </SelectItem>
                <SelectItem value="(UTC-08:00) Pacific Time (US & Canada)">
                  (UTC-08:00) Pacific Time (US & Canada)
                </SelectItem>
                <SelectItem value="(UTC+00:00) Greenwich Mean Time">
                  (UTC+00:00) Greenwich Mean Time
                </SelectItem>
                <SelectItem value="(UTC+01:00) Central European Time">
                  (UTC+01:00) Central European Time
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="language" className="text-sm font-medium text-foreground">
              Language
            </Label>
            <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English (US)">English (US)</SelectItem>
                <SelectItem value="English (UK)">English (UK)</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="German">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Maintenance Mode Section */}
      <div className="space-y-6 border-t border-border pt-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Maintenance Mode</h3>
          <p className="text-sm text-muted-foreground">
            Control application availability for users
          </p>
        </div>
        <div className="pl-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wrench className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="maintenance" className="text-sm font-medium text-foreground cursor-pointer">
                  Enable Maintenance Mode
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Users will see a maintenance page when enabled
                </p>
              </div>
            </div>
            <Switch
              id="maintenance"
              checked={formData.isMaintenance}
              onCheckedChange={(checked) => setFormData({ ...formData, isMaintenance: checked })}
            />
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="space-y-6 border-t border-border pt-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Security</h3>
          <p className="text-sm text-muted-foreground">
            Manage authentication and access control settings
          </p>
        </div>
        <div className="pl-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="twoFactorAuth" className="text-sm font-medium text-foreground cursor-pointer">
                  Two-Factor Authentication (2FA)
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Require 2FA for all admin users
                </p>
              </div>
            </div>
            <Switch
              id="twoFactorAuth"
              checked={formData.twoFactorAuth}
              onCheckedChange={(checked) => setFormData({ ...formData, twoFactorAuth: checked })}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
