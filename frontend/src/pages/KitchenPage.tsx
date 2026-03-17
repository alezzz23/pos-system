import { useEffect, useMemo, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, ChefHat, Clock, Bell, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
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

/** Calculate elapsed time in minutes from a date to now */
function getElapsedMinutes(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
}

/** Format elapsed minutes as MM:SS string with live seconds */
function formatElapsed(dateStr: string): string {
  const totalSeconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Color thresholds: < 10 min green, 10-20 yellow, 20+ red */
function getTimerColor(minutes: number): string {
  if (minutes < 10) return "text-green-600 dark:text-green-400";
  if (minutes < 20) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function getBorderColor(status: string, minutes: number): string {
  if (status === "PENDING") {
    if (minutes >= 20) return "border-l-red-500 bg-red-50/30 dark:bg-red-950/20";
    if (minutes >= 10) return "border-l-yellow-500 bg-yellow-50/30 dark:bg-yellow-950/20";
    return "border-l-orange-400";
  }
  if (status === "IN_PROGRESS") {
    if (minutes >= 20) return "border-l-red-500 bg-red-50/30 dark:bg-red-950/20";
    return "border-l-blue-500";
  }
  return "border-l-green-500";
}

export default function KitchenPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Tick state for live timer updates
  const [, setTick] = useState(0);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const data = await api.get<Order[]>(
        "/orders?status=PENDING,IN_PROGRESS",
      );
      // Sort oldest first
      data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      // Play alert sound for new pending orders
      if (orders.length > 0) {
        const newPendingIds = data
          .filter((o) => o.status === "PENDING")
          .map((o) => o.id);
        const prevPendingIds = orders
          .filter((o) => o.status === "PENDING")
          .map((o) => o.id);
        const hasNew = newPendingIds.some((id) => !prevPendingIds.includes(id));
        if (hasNew) {
          playAlertSound();
          toast({
            title: "🔔 Nuevo pedido",
            description: "Se ha recibido un nuevo pedido en cocina",
          });
        }
      }

      setOrders(data);
    } catch (error) {
      console.error("Error fetching kitchen orders:", error);
      if (!silent) {
        toast({
          title: "Error",
          description: "Error al cargar pedidos de cocina",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [orders, toast]);

  // Live timer tick every second
  useEffect(() => {
    const timerInterval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timerInterval);
  }, []);

  // Auto-refresh orders every 10 seconds
  useEffect(() => {
    fetchOrders(true);
    const interval = setInterval(() => fetchOrders(true), 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast({
        title: "Pedido actualizado",
        description: `Estado cambiado a ${statusLabel[status] || status}`,
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
  const inProgressCount = useMemo(
    () => orders.filter((o) => o.status === "IN_PROGRESS").length,
    [orders],
  );
  const urgentCount = useMemo(
    () =>
      orders.filter((o) => getElapsedMinutes(o.createdAt) >= 20).length,
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
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ChefHat className="w-7 h-7" />
            Cocina (KDS)
          </h1>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-muted-foreground">
              {orders.length} activos
            </span>
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              <Clock className="w-3 h-3 mr-1" />
              {pendingCount} pendientes
            </Badge>
            <Badge variant="secondary">
              <ChefHat className="w-3 h-3 mr-1" />
              {inProgressCount} preparando
            </Badge>
            {urgentCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {urgentCount} urgentes
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchOrders()} disabled={isRefreshing}>
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refrescar
          </Button>
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((order) => {
            const elapsed = getElapsedMinutes(order.createdAt);
            const timerColor = getTimerColor(elapsed);
            const borderClass = getBorderColor(order.status, elapsed);

            return (
              <Card
                key={order.id}
                className={cn(
                  "border-l-4 transition-all duration-300",
                  borderClass,
                  elapsed >= 20 && "shadow-lg shadow-red-500/10 ring-1 ring-red-200 dark:ring-red-800"
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        #{order.orderNumber || order.id.slice(0, 8)}
                        {elapsed >= 20 && (
                          <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                        )}
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
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={statusVariant[order.status] || "outline"}>
                        {statusLabel[order.status] || order.status}
                      </Badge>
                      {/* Live Timer */}
                      <div className={cn("flex items-center gap-1 text-sm font-mono font-bold", timerColor)}>
                        <Clock className="w-3.5 h-3.5" />
                        {formatElapsed(order.createdAt)}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {order.items?.length ? (
                      order.items.map((item) => (
                        <div key={item.id} className="p-3 bg-accent/40 rounded-lg">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="font-medium text-base">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold mr-2">
                                  {item.quantity}
                                </span>
                                {item.product?.name || item.productId}
                              </div>
                              {item.notes && (
                                <div className="text-sm text-yellow-700 dark:text-yellow-400 mt-1 flex items-start gap-1">
                                  <Bell className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                  {item.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Sin items
                      </div>
                    )}
                  </div>

                  {order.notes && (
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
                        📝 {order.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t">
                    {order.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(order.id, "IN_PROGRESS")}
                        className="flex-1"
                      >
                        <ChefHat className="w-4 h-4 mr-1" />
                        Iniciar
                      </Button>
                    )}
                    {order.status === "IN_PROGRESS" && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(order.id, "READY")}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        ✅ Marcar listo
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 880;
    oscillator.type = "sine";
    gain.gain.value = 0.3;
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    oscillator.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio not available
  }
}
