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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import type { User, UserRole } from "@/lib/types";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSuccess: () => void;
}

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrador",
  MANAGER: "Gerente",
  WAITER: "Mesero",
  KITCHEN: "Cocina",
  CASHIER: "Cajero",
};

export default function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UserFormDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "WAITER" as UserRole,
    phone: "",
    active: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: "", // No pre-fill password on edit
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone || "",
        active: user.active,
      });
    } else {
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "WAITER",
        phone: "",
        active: true,
      });
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload: any = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        phone: formData.phone || undefined,
        active: formData.active,
      };

      // Only include password if creating or if password field is filled
      if (!user || formData.password) {
        payload.password = formData.password;
      }

      if (user) {
        // Actualizar
        await api.put(`/users/${user.id}`, payload);
        toast({
          title: "Usuario actualizado",
          description: "El usuario se ha actualizado correctamente.",
          variant: "success",
        });
      } else {
        // Crear
        if (!formData.password) {
          toast({
            title: "Error",
            description: "La contraseña es requerida al crear un usuario",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        await api.post("/users", payload);
        toast({
          title: "Usuario creado",
          description: "El usuario se ha creado correctamente.",
          variant: "success",
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al guardar el usuario",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {user ? "Editar Usuario" : "Nuevo Usuario"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Modifica los datos del usuario."
              : "Crea un nuevo usuario para el sistema."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  placeholder="Juan"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  placeholder="Pérez"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Contraseña {user ? "(opcional - dejar vacío para no cambiar)" : "*"}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={user ? "••••••••" : "Mínimo 6 caracteres"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!user}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value as UserRole })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona rol" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+52 555 123 4567"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="active" className="font-normal cursor-pointer">
                Usuario activo (puede iniciar sesión)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : user ? (
                "Actualizar"
              ) : (
                "Crear"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
