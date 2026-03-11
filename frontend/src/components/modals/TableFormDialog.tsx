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
import type { Table } from "@/lib/types";

interface TableFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table?: Table | null;
  onSuccess: () => void;
}

export default function TableFormDialog({
  open,
  onOpenChange,
  table,
  onSuccess,
}: TableFormDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    number: "",
    capacity: "4",
    shape: "rectangle",
    positionX: "0",
    positionY: "0",
    width: "100",
    height: "100",
  });

  useEffect(() => {
    if (table) {
      setFormData({
        number: table.number,
        capacity: table.capacity.toString(),
        shape: table.shape || "rectangle",
        positionX: table.positionX.toString(),
        positionY: table.positionY.toString(),
        width: table.width.toString(),
        height: table.height.toString(),
      });
    } else {
      setFormData({
        number: "",
        capacity: "4",
        shape: "rectangle",
        positionX: "0",
        positionY: "0",
        width: "100",
        height: "100",
      });
    }
  }, [table, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        number: formData.number,
        capacity: parseInt(formData.capacity),
        shape: formData.shape,
        positionX: parseInt(formData.positionX),
        positionY: parseInt(formData.positionY),
        width: parseInt(formData.width),
        height: parseInt(formData.height),
      };

      if (table) {
        // Actualizar
        await api.put(`/tables/${table.id}`, payload);
        toast({
          title: "Mesa actualizada",
          description: "La mesa se ha actualizado correctamente.",
          variant: "success",
        });
      } else {
        // Crear
        await api.post("/tables", payload);
        toast({
          title: "Mesa creada",
          description: "La mesa se ha creado correctamente.",
          variant: "success",
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al guardar la mesa",
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
            {table ? "Editar Mesa" : "Nueva Mesa"}
          </DialogTitle>
          <DialogDescription>
            {table
              ? "Modifica los datos de la mesa."
              : "Crea una nueva mesa para tu restaurante."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Número de Mesa *</Label>
                <Input
                  id="number"
                  placeholder="Ej: 1, A1, VIP-1"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({ ...formData, number: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidad *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-gray-500">Número de personas</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shape">Forma de la Mesa</Label>
              <Select
                value={formData.shape}
                onValueChange={(value) =>
                  setFormData({ ...formData, shape: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona forma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rectangle">Rectangular</SelectItem>
                  <SelectItem value="circle">Circular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Posición en el Mapa</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="positionX" className="text-xs text-gray-500">
                    Posición X
                  </Label>
                  <Input
                    id="positionX"
                    type="number"
                    min="0"
                    value={formData.positionX}
                    onChange={(e) =>
                      setFormData({ ...formData, positionX: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="positionY" className="text-xs text-gray-500">
                    Posición Y
                  </Label>
                  <Input
                    id="positionY"
                    type="number"
                    min="0"
                    value={formData.positionY}
                    onChange={(e) =>
                      setFormData({ ...formData, positionY: e.target.value })
                    }
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Coordenadas para el mapa visual de mesas
              </p>
            </div>

            <div className="space-y-2">
              <Label>Tamaño en el Mapa</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="width" className="text-xs text-gray-500">
                    Ancho
                  </Label>
                  <Input
                    id="width"
                    type="number"
                    min="50"
                    max="300"
                    value={formData.width}
                    onChange={(e) =>
                      setFormData({ ...formData, width: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="text-xs text-gray-500">
                    Alto
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    min="50"
                    max="300"
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({ ...formData, height: e.target.value })
                    }
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Tamaño en píxeles (100 es estándar)
              </p>
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
              ) : table ? (
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
