import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Clock,
  ChefHat,
  CheckCircle,
  XCircle,
  Plus,
  Loader2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCw } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { Order, OrderStatus } from "@/lib/types";

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
  PENDING: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-700",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "En preparación",
    color: "bg-blue-100 text-blue-700",
    icon: ChefHat,
  },
  READY: {
    label: "Listo",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  SERVED: {
    label: "Servido",
    color: "bg-purple-100 text-purple-700",
    icon: CheckCircle,
  },
  BILL_REQUESTED: {
    label: "Cuenta",
    color: "bg-orange-100 text-orange-700",
    icon: Clock,
  },
  COMPLETED: {
    label: "Completado",
    color: "bg-gray-100 text-gray-700",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelado",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrders = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const data = await api.get<Order[]>("/orders");
      // Sort newest first
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Error al cargar los pedidos.",
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
  }, []);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
      toast({
        title: "Estado actualizado",
        description: `El pedido fue marcado como ${statusConfig[newStatus].label}.`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el estado.",
        variant: "destructive",
      });
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeOrders = orders.filter(
    (o) => !["COMPLETED", "CANCELLED"].includes(o.status),
  ).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-56" />
            <Skeleton className="mt-2 h-4 w-40" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28 rounded-md" />
            <Skeleton className="h-10 w-36 rounded-md" />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-md" />
          ))}
        </div>

        <div className="relative max-w-md">
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-28" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <Skeleton className="h-3 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16 rounded-md" />
                  <Skeleton className="h-8 w-12 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Pedidos
          </h1>
          <p className="text-gray-500">{activeOrders} pedidos activos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchOrders()} disabled={isRefreshing}>
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Actualizar
          </Button>
          <Button onClick={() => navigate("/orders/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Pedido
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={statusFilter === "ALL" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("ALL")}
        >
          Todos
        </Button>
        {Object.entries(statusConfig).map(([status, config]) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status as OrderStatus)}
            className="flex items-center gap-2"
          >
            <config.icon className="w-4 h-4" />
            {config.label}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar por número de pedido..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          title="Aún no hay pedidos"
          description="Cuando crees un pedido, aparecerá aquí para gestionarlo."
          action={
            <Button onClick={() => navigate("/orders/new")}>Crear pedido</Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const config = statusConfig[order.status];
            const StatusIcon = config.icon;

            return (
              <Card
                key={order.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">
                        #{order.orderNumber || order.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {order.type === "DINE_IN"
                          ? order.table
                            ? `Mesa ${order.table.number}`
                            : "Mesa"
                          : order.type === "TAKEAWAY"
                            ? "Para llevar"
                            : "Delivery"}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                        config.color,
                      )}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {config.label}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal:</span>
                      <span className="tabular-nums">{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Impuesto:</span>
                      <span className="tabular-nums">{formatCurrency(order.tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-2 border-t">
                      <span>Total:</span>
                      <span className="text-primary-600 tabular-nums">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <span className="text-xs text-gray-400 tabular-nums">
                      {formatDate(order.createdAt)}
                    </span>
                    <div className="flex gap-2">
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
                        <Button
                          size="sm"
                          onClick={() => updateStatus(order.id, "READY")}
                        >
                          Listo
                        </Button>
                      )}
                      {order.status === "READY" && (
                        <Button
                          size="sm"
                          onClick={() => updateStatus(order.id, "SERVED")}
                        >
                          Servir
                        </Button>
                      )}
                      {order.status === "BILL_REQUESTED" && (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          Cobrar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        Ver
                      </Button>
                    </div>
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
