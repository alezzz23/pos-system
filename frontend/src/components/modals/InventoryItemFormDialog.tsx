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
import type { InventoryItem } from "@/lib/types";

interface InventoryItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem | null;
  onSuccess: () => void;
}

const unitOptions = [
  { value: "unit", label: "Unidades" },
  { value: "kg", label: "Kilogramos (kg)" },
  { value: "g", label: "Gramos (g)" },
  { value: "l", label: "Litros (L)" },
  { value: "ml", label: "Mililitros (ml)" },
  { value: "box", label: "Cajas" },
  { value: "pack", label: "Paquetes" },
];

export default function InventoryItemFormDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: InventoryItemFormDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    quantity: "0",
    unit: "unit",
    minQuantity: "0",
    cost: "0",
    location: "",
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        sku: item.sku || "",
        quantity: item.quantity.toString(),
        unit: item.unit,
        minQuantity: item.minQuantity.toString(),
        cost: item.cost.toString(),
        location: item.location || "",
      });
    } else {
      setFormData({
        name: "",
        sku: "",
        quantity: "0",
        unit: "unit",
        minQuantity: "0",
        cost: "0",
        location: "",
      });
    }
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        sku: formData.sku || undefined,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        minQuantity: parseFloat(formData.minQuantity),
        cost: parseFloat(formData.cost),
        location: formData.location || undefined,
      };

      if (item) {
        // Actualizar
        await api.put(`/inventory/${item.id}`, payload);
        toast({
          title: "Artículo actualizado",
          description: "El artículo se ha actualizado correctamente.",
          variant: "success",
        });
      } else {
        // Crear
        await api.post("/inventory", payload);
        toast({
          title: "Artículo creado",
          description: "El artículo se ha creado correctamente.",
          variant: "success",
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al guardar el artículo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? "Editar Artículo de Inventario" : "Nuevo Artículo de Inventario"}
          </DialogTitle>
          <DialogDescription>
            {item
              ? "Modifica los datos del artículo."
              : "Crea un nuevo artículo para el inventario."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Artículo *</Label>
              <Input
                id="name"
                placeholder="Ej: Carne de Res, Tomate, Aceite..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU / Código</Label>
              <Input
                id="sku"
                placeholder="Código único del producto"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
              />
              <p className="text-xs text-gray-500">
                Código de barras o identificador único (opcional)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad Actual *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unidad de Medida *</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) =>
                    setFormData({ ...formData, unit: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minQuantity">Cantidad Mínima *</Label>
                <Input
                  id="minQuantity"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, minQuantity: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-gray-500">
                  Alerta cuando esté por debajo
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Costo Unitario *</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-gray-500">
                  Precio por unidad
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                placeholder="Ej: Refrigerador A, Bodega, Almacén..."
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
              <p className="text-xs text-gray-500">
                Ubicación física del artículo (opcional)
              </p>
            </div>

            {item && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Valor Total en Inventario
                </p>
                <p className="text-lg font-bold text-blue-700">
                  ${(parseFloat(formData.quantity) * parseFloat(formData.cost)).toFixed(2)}
                </p>
              </div>
            )}
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
              ) : item ? (
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
