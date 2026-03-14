import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, ShoppingCart, Users, TrendingUp, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import type { Order, Table } from '@/lib/types';

interface DailySummary {
  date: string;
  totalSales: number;
  totalOrders: number;
  totalItems: number;
  averageTicket: number;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, ordersData, tablesData] = await Promise.all([
          api.get<DailySummary>('/orders/daily-summary'),
          api.get<Order[]>('/orders?status=PENDING,IN_PROGRESS,READY'),
          api.get<Table[]>('/tables'),
        ]);
        setSummary(summaryData);
        setOrders(ordersData);
        setTables(tablesData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-44" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-52" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-accent/30 p-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="space-y-2 text-right">
                      <Skeleton className="h-4 w-20 ml-auto" />
                      <Skeleton className="h-5 w-16 ml-auto rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-44" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const occupiedTables = tables.filter(t => t.status === 'OCCUPIED').length;
  const totalTables = tables.length;
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;

  const stats = [
    {
      title: 'Ventas Hoy',
      value: formatCurrency(summary?.totalSales || 0),
      change: `${summary?.totalOrders || 0} pedidos`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pedidos Activos',
      value: String(orders.length),
      change: `${pendingOrders} pendientes`,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Mesas Ocupadas',
      value: `${occupiedTables}/${totalTables}`,
      change: `${Math.round((occupiedTables / totalTables) * 100)}%`,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Ticket Promedio',
      value: formatCurrency(summary?.averageTicket || 0),
      change: `${summary?.totalItems || 0} items`,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de actividades del día</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1 tabular-nums">{stat.value}</p>
                  <p className={`text-sm mt-1 ${stat.color}`}>{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Pedidos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No hay pedidos activos</p>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-accent/40 rounded-lg hover:bg-accent/60 transition-colors"
                  >
                    <div>
                      <p className="font-medium">#{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.table ? `Mesa ${order.table.number}` : order.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium tabular-nums">{formatCurrency(order.total)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                        }`}>
                        {order.status === 'PENDING' ? 'Pendiente' :
                          order.status === 'IN_PROGRESS' ? 'En preparación' :
                            order.status === 'READY' ? 'Listo' : order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tables Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Estado de Mesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {tables.slice(0, 12).map((table) => (
                <div
                  key={table.id}
                  className={`p-3 rounded-lg text-center transition-transform hover:-translate-y-1 hover:shadow-sm ${table.status === 'AVAILABLE' ? 'bg-green-50 border border-green-200' :
                      table.status === 'OCCUPIED' ? 'bg-red-50 border border-red-200' :
                        table.status === 'RESERVED' ? 'bg-yellow-50 border border-yellow-200' :
                          'bg-gray-50 border border-gray-200'
                    }`}
                >
                  <p className="font-medium">Mesa {table.number}</p>
                  <p className="text-xs text-muted-foreground">{table.capacity} personas</p>
                </div>
              ))}
            </div>
            {tables.length > 12 && (
              <p className="text-sm text-muted-foreground text-center mt-4">
                Y {tables.length - 12} mesas más...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
