import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import UserFormDialog from "@/components/modals/UserFormDialog";
import type { User, UserRole } from "@/lib/types";

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrador",
  MANAGER: "Gerente",
  WAITER: "Mesero",
  KITCHEN: "Cocina",
  CASHIER: "Cajero",
};

const roleColors: Record<UserRole, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  MANAGER: "bg-blue-100 text-blue-700",
  WAITER: "bg-green-100 text-green-700",
  KITCHEN: "bg-orange-100 text-orange-700",
  CASHIER: "bg-cyan-100 text-cyan-700",
};

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // User modal state
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await api.get<User[]>("/users");
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Error al cargar los usuarios",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserActive = async (user: User) => {
    try {
      await api.patch(`/users/${user.id}/active`, { active: !user.active });
      setUsers(
        users.map((u) => (u.id === user.id ? { ...u, active: !u.active } : u)),
      );
      toast({
        title: "Usuario actualizado",
        description: `Usuario ${user.active ? "desactivado" : "activado"} correctamente`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error toggling user active state:", error);
      toast({
        title: "Error",
        description: "Error al actualizar el usuario",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
      await api.delete(`/users/${userId}`);
      await fetchUsers();
      toast({
        title: "Usuario eliminado",
        description: "El usuario se ha eliminado correctamente",
        variant: "success",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Error al eliminar el usuario",
        variant: "destructive",
      });
    }
  };

  const openUserDialog = (user?: User) => {
    setEditingUser(user || null);
    setUserDialogOpen(true);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-500">
            {users.filter((u) => u.active).length} usuarios activos
          </p>
        </div>
        <Button onClick={() => openUserDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={roleFilter === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setRoleFilter("ALL")}
          >
            Todos
          </Button>
          {Object.entries(roleLabels).map(([role, label]) => (
            <Button
              key={role}
              variant={roleFilter === role ? "default" : "outline"}
              size="sm"
              onClick={() => setRoleFilter(role as UserRole)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No hay usuarios</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className={!user.active ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium text-primary-700">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button onClick={() => toggleUserActive(user)}>
                    {user.active ? (
                      <UserCheck className="w-5 h-5 text-green-600" />
                    ) : (
                      <UserX className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      roleColors[user.role],
                    )}
                  >
                    {roleLabels[user.role]}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openUserDialog(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {user.phone && (
                  <p className="text-sm text-gray-500 mt-2">
                    Tel: {user.phone}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* User Form Dialog */}
      <UserFormDialog
        open={userDialogOpen}
        onOpenChange={setUserDialogOpen}
        user={editingUser}
        onSuccess={() => {
          fetchUsers();
          setEditingUser(null);
        }}
      />
    </div>
  );
}
