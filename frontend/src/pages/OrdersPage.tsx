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
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.get<Order[]>("/orders");
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
    } catch (error) {
      console.error("Error updating order status:", error);
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
        <Button onClick={() => navigate("/orders/new")}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Pedido
        </Button>
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
        <p className="text-gray-500 text-center py-8">No hay pedidos</p>
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
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Impuesto:</span>
                      <span>{formatCurrency(order.tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-2 border-t">
                      <span>Total:</span>
                      <span className="text-primary-600">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <span className="text-xs text-gray-400">
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
