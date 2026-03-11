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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import type { Category } from "@/lib/types";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSuccess: () => void;
}

export default function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryFormDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    sortOrder: 0,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || "",
        image: category.image || "",
        sortOrder: category.sortOrder,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        image: "",
        sortOrder: 0,
      });
    }
  }, [category, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (category) {
        // Actualizar
        await api.put(`/products/categories/${category.id}`, formData);
        toast({
          title: "Categoría actualizada",
          description: "La categoría se ha actualizado correctamente.",
          variant: "success",
        });
      } else {
        // Crear
        await api.post("/products/categories", formData);
        toast({
          title: "Categoría creada",
          description: "La categoría se ha creado correctamente.",
          variant: "success",
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al guardar la categoría",
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
            {category ? "Editar Categoría" : "Nueva Categoría"}
          </DialogTitle>
          <DialogDescription>
            {category
              ? "Modifica los datos de la categoría."
              : "Crea una nueva categoría para organizar tus productos."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                placeholder="Ej: Entradas, Bebidas, Postres..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Descripción de la categoría (opcional)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">URL de Imagen</Label>
              <Input
                id="image"
                type="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
              />
              <p className="text-xs text-gray-500">
                URL de la imagen para la categoría (opcional)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Orden de visualización</Label>
              <Input
                id="sortOrder"
                type="number"
                min="0"
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sortOrder: parseInt(e.target.value) || 0,
                  })
                }
              />
              <p className="text-xs text-gray-500">
                Número que determina el orden de aparición (menor primero)
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
              ) : category ? (
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
