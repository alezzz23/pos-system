import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  AlertTriangle,
  Package,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import InventoryItemFormDialog from "@/components/modals/InventoryItemFormDialog";
import InventoryMovementDialog from "@/components/modals/InventoryMovementDialog";
import type { InventoryItem } from "@/lib/types";

interface InventorySummary {
  totalItems: number;
  lowStockCount: number;
  totalValue: number;
  lowStockItems: InventoryItem[];
}

export default function InventoryPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Item modal state
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Movement modal state
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);
  const [movementDefaultType, setMovementDefaultType] = useState<
    "IN" | "OUT" | "ADJUSTMENT" | "RETURN"
  >("IN");

  const fetchData = async () => {
    try {
      const [itemsData, summaryData] = await Promise.all([
        api.get<InventoryItem[]>("/inventory"),
        api.get<InventorySummary>("/inventory/summary"),
      ]);
      setItems(itemsData);
      setSummary(summaryData);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      toast({
        title: "Error",
        description: "Error al cargar el inventario",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("¿Estás seguro de eliminar este artículo?")) return;

    try {
      await api.delete(`/inventory/${itemId}`);
      await fetchData();
      toast({
        title: "Artículo eliminado",
        description: "El artículo se ha eliminado correctamente",
        variant: "success",
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Error al eliminar el artículo",
        variant: "destructive",
      });
    }
  };

  const openItemDialog = (item?: InventoryItem) => {
    setEditingItem(item || null);
    setItemDialogOpen(true);
  };

  const openMovementDialog = (type: "IN" | "OUT") => {
    setMovementDefaultType(type);
    setMovementDialogOpen(true);
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-500">
            {summary?.lowStockCount || 0} artículos con stock bajo
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openMovementDialog("IN")}>
            <ArrowUp className="w-4 h-4 mr-2" />
            Entrada
          </Button>
          <Button variant="outline" onClick={() => openMovementDialog("OUT")}>
            <ArrowDown className="w-4 h-4 mr-2" />
            Salida
          </Button>
          <Button onClick={() => openItemDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Artículo
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Artículos</p>
                <p className="text-2xl font-bold">
                  {summary?.totalItems || items.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Stock Bajo</p>
                <p className="text-2xl font-bold text-red-600">
                  {summary?.lowStockCount || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-full">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary?.totalValue || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar por nombre o SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Artículos de Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay artículos de inventario
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      Artículo
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      SKU
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      Cantidad
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      Unidad
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      Costo Unit.
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      Ubicación
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      Estado
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{item.name}</td>
                      <td className="py-3 px-4 text-gray-500">
                        {item.sku || "-"}
                      </td>
                      <td className="py-3 px-4">{item.quantity}</td>
                      <td className="py-3 px-4">{item.unit}</td>
                      <td className="py-3 px-4">{formatCurrency(item.cost)}</td>
                      <td className="py-3 px-4 text-gray-500">
                        {item.location || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            item.quantity <= item.minQuantity
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700",
                          )}
                        >
                          {item.quantity <= item.minQuantity
                            ? "Stock bajo"
                            : "OK"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openItemDialog(item)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventory Item Form Dialog */}
      <InventoryItemFormDialog
        open={itemDialogOpen}
        onOpenChange={setItemDialogOpen}
        item={editingItem}
        onSuccess={() => {
          fetchData();
          setEditingItem(null);
        }}
      />

      <InventoryMovementDialog
        open={movementDialogOpen}
        onOpenChange={setMovementDialogOpen}
        items={items}
        defaultType={movementDefaultType}
        onSuccess={() => {
          fetchData();
        }}
      />
    </div>
  );
}
