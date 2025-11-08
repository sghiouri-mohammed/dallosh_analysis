"use client";

import { useState, useEffect } from "react";
import { usersService } from "@/services";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit } from "lucide-react";
import type { User } from "@/types";
import { rolesService } from "@/services";
import type { Role } from "@/types";

export function UsersManagementTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ email: "", password: "", roleId: "" });

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await usersService.findAll();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await rolesService.findAll();
      setRoles(data);
    } catch (error) {
      console.error("Failed to load roles:", error);
    }
  };

  const handleCreate = async () => {
    try {
      await usersService.create(formData);
      await loadUsers();
      setIsDialogOpen(false);
      setFormData({ email: "", password: "", roleId: "" });
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    
    // Protect root user (admin@free.com)
    if (editingUser.data.email === "admin@free.com") {
      alert("Cannot edit the root user (admin@free.com)");
      return;
    }
    
    try {
      await usersService.update(editingUser.uid, formData);
      await loadUsers();
      setIsDialogOpen(false);
      setEditingUser(null);
      setFormData({ email: "", password: "", roleId: "" });
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleDelete = async (uid: string) => {
    const user = users.find((u) => u.uid === uid);
    
    // Protect root user (admin@free.com)
    if (user?.data.email === "admin@free.com") {
      alert("Cannot delete the root user (admin@free.com)");
      return;
    }
    
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await usersService.delete(uid);
      await loadUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.data.email,
      password: "",
      roleId: user.data.roleId || "",
    });
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="p-6">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Users Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingUser(null);
              setFormData({ email: "", password: "", roleId: "" });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>
              <DialogDescription>
                {editingUser ? "Update user information" : "Add a new user to the system"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{editingUser ? "New Password (optional)" : "Password"}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.roleId}
                  onValueChange={(value) => setFormData({ ...formData, roleId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.uid} value={role.uid}>
                        {role.data.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={editingUser ? handleUpdate : handleCreate}>
                {editingUser ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const role = roles.find((r) => r.uid === user.data.roleId);
              return (
                <TableRow key={user.uid}>
                  <TableCell className="font-medium">{user.data.email}</TableCell>
                  <TableCell>{role?.data.name || "No role"}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(user)}
                        disabled={user.data.email === "admin@free.com"}
                        title={user.data.email === "admin@free.com" ? "Cannot edit root user" : "Edit user"}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user.uid)}
                        disabled={user.data.email === "admin@free.com"}
                        title={user.data.email === "admin@free.com" ? "Cannot delete root user" : "Delete user"}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

