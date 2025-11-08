"use client";

import { Header } from "@/components/layouts/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersManagementTab } from "@/components/dashboard/users/UsersManagementTab";
import { RolesManagementTab } from "@/components/dashboard/users/RolesManagementTab";

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Users Management" subtitle="Manage users and roles" />
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="users" className="w-full">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <UsersManagementTab />
          </TabsContent>
          <TabsContent value="roles">
            <RolesManagementTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

