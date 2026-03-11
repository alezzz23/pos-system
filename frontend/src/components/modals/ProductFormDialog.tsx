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
import type { Product, Category } from "@/lib/types";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  categories: Category[];
  onSuccess: () => void;
}

export default function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
  onSuccess,
}: ProductFormDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    image: "",
    preparationTime: "",
    active: true,
    available: true,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        categoryId: product.categoryId,
        image: product.image || "",
        preparationTime: product.preparationTime?.toString() || "",
        active: product.active,
        available: product.available,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        categoryId: categories[0]?.id || "",
        image: "",
        preparationTime: "",
        active: true,
        available: true,
      });
    }
  }, [product, categories, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        image: formData.image || undefined,
        preparationTime: formData.preparationTime
          ? parseInt(formData.preparationTime)
          : undefined,
        active: formData.active,
        available: formData.available,
      };

      if (product) {
        // Actualizar
        await api.put(`/products/${product.id}`, payload);
        toast({
          title: "Producto actualizado",
          description: "El producto se ha actualizado correctamente.",
          variant: "success",
        });
      } else {
        // Crear
        await api.post("/products", payload);
        toast({
          title: "Producto creado",
          description: "El producto se ha creado correctamente.",
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
            : "Error al guardar el producto",
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
            {product ? "Editar Producto" : "Nuevo Producto"}
          </DialogTitle>
          <DialogDescription>
            {product
              ? "Modifica los datos del producto."
              : "Crea un nuevo producto para tu menú."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                placeholder="Ej: Hamburguesa Clásica"
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
                placeholder="Descripción del producto..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Precio *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoría *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
              {formData.image && (
                <div className="mt-2">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-md"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="preparationTime">
                Tiempo de preparación (minutos)
              </Label>
              <Input
                id="preparationTime"
                type="number"
                min="0"
                placeholder="15"
                value={formData.preparationTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preparationTime: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-3">
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
                  Producto activo (visible en el sistema)
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) =>
                    setFormData({ ...formData, available: e.target.checked })
                  }
                  className="rounded"
                />
                <Label
                  htmlFor="available"
                  className="font-normal cursor-pointer"
                >
                  Disponible para ordenar (se puede agregar a pedidos)
                </Label>
              </div>
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
              ) : product ? (
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
