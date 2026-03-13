import { useEffect, useState } from "react";
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
import type { InventoryItem, MovementType } from "@/lib/types";

interface InventoryMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: InventoryItem[];
  defaultType?: MovementType;
  onSuccess: () => void;
}

const movementTypeLabels: Record<MovementType, string> = {
  IN: "Entrada",
  OUT: "Salida",
  ADJUSTMENT: "Ajuste",
  RETURN: "Devolución",
};

export default function InventoryMovementDialog({
  open,
  onOpenChange,
  items,
  defaultType = "IN",
  onSuccess,
}: InventoryMovementDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    itemId: "",
    type: defaultType as MovementType,
    quantity: "1",
    reason: "",
    reference: "",
  });

  useEffect(() => {
    if (!open) return;

    setFormData({
      itemId: items[0]?.id || "",
      type: defaultType,
      quantity: "1",
      reason: "",
      reference: "",
    });
  }, [open, defaultType, items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemId) {
      toast({
        title: "Error",
        description: "Selecciona un artículo",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        quantity: parseFloat(formData.quantity),
        type: formData.type,
        reason: formData.reason || undefined,
        reference: formData.reference || undefined,
      };

      await api.post(`/inventory/${formData.itemId}/movements`, payload);

      toast({
        title: "Movimiento registrado",
        description: `${movementTypeLabels[formData.type]} registrada correctamente`,
        variant: "success",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al registrar el movimiento",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Registrar Movimiento</DialogTitle>
          <DialogDescription>
            Registra una entrada, salida, ajuste o devolución del inventario.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Artículo *</Label>
              <Select
                value={formData.itemId}
                onValueChange={(value) =>
                  setFormData({ ...formData, itemId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un artículo" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((it) => (
                    <SelectItem key={it.id} value={it.id}>
                      {it.name} {it.sku ? `(${it.sku})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value as MovementType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(movementTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">
                  {formData.type === "ADJUSTMENT"
                    ? "Cantidad final *"
                    : "Cantidad *"}
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  required
                />
                {formData.type === "ADJUSTMENT" && (
                  <p className="text-xs text-gray-500">
                    En ajuste, la cantidad reemplaza el stock actual.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Motivo</Label>
              <Input
                id="reason"
                placeholder="Ej: Compra a proveedor, merma, inventario..."
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Referencia</Label>
              <Input
                id="reference"
                placeholder="Ej: Factura #123, Pedido ORD-001..."
                value={formData.reference}
                onChange={(e) =>
                  setFormData({ ...formData, reference: e.target.value })
                }
              />
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
            <Button type="submit" disabled={isLoading || items.length === 0}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Registrar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
