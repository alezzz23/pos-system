import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, MoreHorizontal, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import TableFormDialog from "@/components/modals/TableFormDialog";
import type { Table, TableStatus } from "@/lib/types";

const statusColors: Record<TableStatus, string> = {
  AVAILABLE: "bg-green-100 border-green-300 hover:bg-green-200",
  OCCUPIED: "bg-red-100 border-red-300 hover:bg-red-200",
  RESERVED: "bg-yellow-100 border-yellow-300 hover:bg-yellow-200",
  BILL_REQUESTED: "bg-purple-100 border-purple-300 hover:bg-purple-200",
  CLEANING: "bg-gray-100 border-gray-300 hover:bg-gray-200",
};

const statusLabels: Record<TableStatus, string> = {
  AVAILABLE: "Disponible",
  OCCUPIED: "Ocupada",
  RESERVED: "Reservada",
  BILL_REQUESTED: "Cuenta",
  CLEANING: "Limpieza",
};

export default function TablesPage() {
  const { toast } = useToast();
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Table modal state
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  const fetchTables = async () => {
    try {
      const data = await api.get<Table[]>("/tables");
      setTables(data);
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast({
        title: "Error",
        description: "Error al cargar las mesas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
  };

  const handleCreateOrder = () => {
    if (selectedTable) {
      navigate(`/orders/new?tableId=${selectedTable.id}`);
    }
  };

  const handleViewOrder = () => {
    if (selectedTable?.orders?.[0]) {
      navigate(`/orders/${selectedTable.orders[0].id}`);
    }
  };

  const handleAddItems = () => {
    if (selectedTable?.orders?.[0]) {
      navigate(`/orders/${selectedTable.orders[0].id}`);
    }
  };

  const handleRequestBill = async () => {
    if (!selectedTable?.orders?.[0]) return;
    try {
      await api.post(`/orders/${selectedTable.orders[0].id}/request-bill`, {});
      const updatedTable = await api.get<Table>(`/tables/${selectedTable.id}`);
      setTables(
        tables.map((t) => (t.id === updatedTable.id ? updatedTable : t)),
      );
      setSelectedTable(updatedTable);
    } catch (error) {
      console.error("Error requesting bill:", error);
    }
  };

  const handleReserve = async () => {
    if (!selectedTable) return;
    try {
      await api.patch(`/tables/${selectedTable.id}/reserve`, {});
      const updatedTable = await api.get<Table>(`/tables/${selectedTable.id}`);
      setTables(
        tables.map((t) => (t.id === updatedTable.id ? updatedTable : t)),
      );
      setSelectedTable(updatedTable);
    } catch (error) {
      console.error("Error reserving table:", error);
    }
  };

  const handleProcessPayment = () => {
    if (selectedTable?.orders?.[0]) {
      navigate(`/orders/${selectedTable.orders[0].id}`);
    }
  };

  const handleMarkClean = async () => {
    if (selectedTable) {
      try {
        await api.patch(`/tables/${selectedTable.id}/available`, {});
        const updatedTable = await api.get<Table>(
          `/tables/${selectedTable.id}`,
        );
        setTables(
          tables.map((t) => (t.id === updatedTable.id ? updatedTable : t)),
        );
        setSelectedTable(updatedTable);
      } catch (error) {
        console.error("Error updating table:", error);
        toast({
          title: "Error",
          description: "Error al actualizar la mesa",
          variant: "destructive",
        });
      }
    }
  };

  const openTableDialog = (table?: Table) => {
    setEditingTable(table || null);
    setTableDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-56" />
            <Skeleton className="mt-2 h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="h-[108px] w-full rounded-xl" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-44" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Mesas</h1>
          <p className="text-gray-500">
            Selecciona una mesa para gestionar pedidos
          </p>
        </div>
        <Button onClick={() => openTableDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Mesa
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Mesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleTableClick(table)}
                    className={cn(
                      "relative p-4 border-2 rounded-xl transition-all cursor-pointer hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      statusColors[table.status],
                      selectedTable?.id === table.id &&
                      "ring-2 ring-primary ring-offset-2",
                    )}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold mb-1">
                        {table.number}
                      </span>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{table.capacity}</span>
                      </div>
                      <span className="text-xs mt-2 px-2 py-0.5 bg-white/50 rounded">
                        {statusLabels[table.status]}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2 p-1 hover:bg-white/50 rounded">
                      <MoreHorizontal className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedTable
                  ? `Mesa ${selectedTable.number}`
                  : "Selecciona una mesa"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTable ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Estado</p>
                      <p className="font-medium">
                        {statusLabels[selectedTable.status]}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Capacidad</p>
                      <p className="font-medium">
                        {selectedTable.capacity} personas
                      </p>
                    </div>
                  </div>

                  {selectedTable.status === "AVAILABLE" && (
                    <Button className="w-full" onClick={handleCreateOrder}>
                      Crear Pedido
                    </Button>
                  )}

                  {selectedTable.status === "OCCUPIED" && (
                    <div className="space-y-2">
                      <Button className="w-full" onClick={handleViewOrder}>
                        Ver Pedido
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleAddItems}
                      >
                        Agregar Items
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={handleRequestBill}
                      >
                        Solicitar Cuenta
                      </Button>
                    </div>
                  )}

                  {selectedTable.status === "BILL_REQUESTED" && (
                    <div className="space-y-2">
                      <Button className="w-full" onClick={handleProcessPayment}>
                        Procesar Pago
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleViewOrder}
                      >
                        Ver Detalles
                      </Button>
                    </div>
                  )}

                  {selectedTable.status === "AVAILABLE" && (
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={handleReserve}
                    >
                      Reservar Mesa
                    </Button>
                  )}

                  {selectedTable.status === "CLEANING" && (
                    <Button className="w-full" onClick={handleMarkClean}>
                      Marcar como Limpia
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Haz clic en una mesa para ver detalles
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Table Form Dialog */}
      <TableFormDialog
        open={tableDialogOpen}
        onOpenChange={setTableDialogOpen}
        table={editingTable}
        onSuccess={() => {
          fetchTables();
          setEditingTable(null);
        }}
      />
    </div>
  );
}
