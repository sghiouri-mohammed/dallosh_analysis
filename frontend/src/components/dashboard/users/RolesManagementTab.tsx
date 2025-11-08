"use client";

import { useState, useEffect } from "react";
import { rolesService } from "@/services";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Edit } from "lucide-react";
import type { Role, Permission } from "@/types";

const ALL_PERMISSIONS: Permission[] = [
  "manage_roles",
  "manage_users",
  "manage_datasets",
  "manage_tasks",
  "manage_app",
  "view_overview",
  "read_users",
  "read_datasets",
  "read_tasks",
  "read_analysis",
];

export function RolesManagementTab() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as Permission[],
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const data = await rolesService.findAll();
      setRoles(data);
    } catch (error) {
      console.error("Failed to load roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await rolesService.create(formData);
      await loadRoles();
      setIsDialogOpen(false);
      setFormData({ name: "", description: "", permissions: [] });
    } catch (error) {
      console.error("Failed to create role:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editingRole) return;
    try {
      await rolesService.update(editingRole.uid, formData);
      await loadRoles();
      setIsDialogOpen(false);
      setEditingRole(null);
      setFormData({ name: "", description: "", permissions: [] });
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleDelete = async (uid: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    try {
      await rolesService.delete(uid);
      await loadRoles();
    } catch (error) {
      console.error("Failed to delete role:", error);
    }
  };

  const togglePermission = (permission: Permission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const openEditDialog = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.data.name,
      description: role.data.description,
      permissions: role.data.permissions,
    });
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="p-6">Loading roles...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Roles Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingRole(null);
              setFormData({ name: "", description: "", permissions: [] });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingRole ? "Edit Role" : "Create New Role"}</DialogTitle>
              <DialogDescription>
                {editingRole ? "Update role information and permissions" : "Create a new role with specific permissions"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                  {ALL_PERMISSIONS.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission}
                        checked={formData.permissions.includes(permission)}
                        onCheckedChange={() => togglePermission(permission)}
                      />
                      <Label
                        htmlFor={permission}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {permission.replace(/_/g, " ")}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={editingRole ? handleUpdate : handleCreate}>
                {editingRole ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.uid}>
                <TableCell className="font-medium">{role.data.name}</TableCell>
                <TableCell>{role.data.description}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {role.data.permissions.map((perm) => (
                      <span
                        key={perm}
                        className="text-xs px-2 py-1 bg-muted rounded"
                      >
                        {perm.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(role)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(role.uid)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

