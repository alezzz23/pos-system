import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, ChefHat, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { EmptyState } from "@/components/ui/empty-state";
import type { Order, OrderStatus } from "@/lib/types";

const statusLabel: Record<string, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En preparación",
  READY: "Listo",
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  IN_PROGRESS: "secondary",
  READY: "default",
};

export default function KitchenPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrders = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const data = await api.get<Order[]>(
        "/orders?status=PENDING,IN_PROGRESS",
      );
      // Sort oldest first
      data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setOrders(data);
    } catch (error) {
      console.error("Error fetching kitchen orders:", error);
      toast({
        title: "Error",
        description: "Error al cargar pedidos de cocina",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders(true);
    const interval = setInterval(() => fetchOrders(true), 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast({
        title: "Pedido actualizado",
        description: `Estado cambiado a ${statusLabel[status] || status}`,
        variant: "success",
      });
      await fetchOrders(true);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Error al actualizar el estado del pedido",
        variant: "destructive",
      });
    }
  };

  const pendingCount = useMemo(
    () => orders.filter((o) => o.status === "PENDING").length,
    [orders],
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
          <h1 className="text-2xl font-bold">Cocina (KDS)</h1>
          <p className="text-muted-foreground">
            {orders.length} pedidos activos ({pendingCount} pendientes)
          </p>
        </div>
        <Button variant="outline" onClick={() => fetchOrders()} disabled={isRefreshing}>
          {isRefreshing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refrescar
        </Button>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="Sin pedidos en cocina"
          description="Cuando entren pedidos en PENDIENTE o EN PREPARACIÓN, se mostrarán aquí."
          icon={ChefHat}
          action={
            <Button variant="outline" onClick={() => fetchOrders()} disabled={isRefreshing}>
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refrescar
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">
                      #{order.orderNumber || order.id.slice(0, 8)}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground mt-1">
                      {order.type === "DINE_IN"
                        ? order.table
                          ? `Mesa ${order.table.number}`
                          : "Mesa"
                        : order.type === "TAKEAWAY"
                          ? "Para llevar"
                          : "Delivery"}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 tabular-nums">
                      <Clock className="w-3 h-3" />
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <Badge variant={statusVariant[order.status] || "outline"}>
                    {statusLabel[order.status] || order.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {order.items?.length ? (
                    order.items.map((item) => (
                      <div key={item.id} className="p-3 bg-accent/40 rounded-lg">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-medium">
                              {item.quantity}x {item.product?.name || item.productId}
                            </div>
                            {item.notes && (
                              <div className="text-sm text-muted-foreground mt-1">
                                Nota: {item.notes}
                              </div>
                            )}
                          </div>
                          <ChefHat className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Sin items (verifica include de items en backend).
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  {order.status === "PENDING" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(order.id, "IN_PROGRESS")}
                    >
                      Iniciar
                    </Button>
                  )}
                  {order.status === "IN_PROGRESS" && (
                    <Button size="sm" onClick={() => updateStatus(order.id, "READY")}
                    >
                      Marcar listo
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
