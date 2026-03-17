import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface SalesData {
  day: string;
  sales: number;
}

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
  trend: "up" | "down";
}

interface TopWaiter {
  name: string;
  orders: number;
  revenue: number;
}

interface SummaryReport {
  totalSales: number;
  totalOrders: number;
  totalItems: number;
  totalCustomers: number;
  averageTicket: number;
}

const CHART_COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
  "hsl(262, 83%, 58%)",
  "hsl(199, 89%, 48%)",
];

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topWaiters, setTopWaiters] = useState<TopWaiter[]>([]);
  const [summary, setSummary] = useState<SummaryReport | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [salesRes, productsRes, waitersRes, summaryRes] =
          await Promise.all([
            api.get<SalesData[]>("/orders/reports/weekly"),
            api.get<TopProduct[]>("/orders/reports/top-products?limit=6"),
            api.get<TopWaiter[]>("/orders/reports/top-waiters?limit=4"),
            api.get<SummaryReport>("/orders/reports/summary"),
          ]);
        setSalesData(salesRes);
        setTopProducts(productsRes);
        setTopWaiters(waitersRes);
        setSummary(summaryRes);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleExportCSV = () => {
    if (!salesData.length) return;

    const headers = ["Día,Ventas"];
    const rows = salesData.map((d) => `${d.day},${d.sales}`);
    const csv = [...headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte_ventas_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const pieData = topProducts.map((p) => ({
    name: p.name,
    value: p.revenue,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reportes</h1>
          <p className="text-muted-foreground">
            Análisis de ventas y rendimiento
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Última semana
          </Button>
          <Button onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ventas Totales</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary?.totalSales || 0)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Últimos 7 días
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pedidos</p>
                <p className="text-2xl font-bold">
                  {summary?.totalOrders || 0}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Completados
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-full">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes</p>
                <p className="text-2xl font-bold">
                  {summary?.totalCustomers || 0}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Mesas únicas
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ticket Promedio</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary?.averageTicket || 0)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Por pedido</p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-full">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas de la Semana</CardTitle>
          </CardHeader>
          <CardContent>
            {salesData.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay datos de ventas
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      "Ventas",
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                      color: "hsl(var(--card-foreground))",
                    }}
                  />
                  <Bar
                    dataKey="sales"
                    fill="hsl(221, 83%, 53%)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Products Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay datos de productos
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name || ''} (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {pieData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      "Ingresos",
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                      color: "hsl(var(--card-foreground))",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Products List */}
        <Card>
          <CardHeader>
            <CardTitle>Ranking de Productos</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay datos de productos
              </p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{
                          background:
                            CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.quantity} vendidos
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {formatCurrency(product.revenue)}
                      </span>
                      {product.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Waiters */}
        <Card>
          <CardHeader>
            <CardTitle>Meseros con Más Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            {topWaiters.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay datos de meseros
              </p>
            ) : (
              <div className="space-y-4">
                {topWaiters.map((waiter, index) => {
                  const maxRevenue = Math.max(
                    ...topWaiters.map((w) => w.revenue),
                    1
                  );
                  const barWidth = (waiter.revenue / maxRevenue) * 100;
                  return (
                    <div key={waiter.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{
                              background:
                                CHART_COLORS[index % CHART_COLORS.length],
                            }}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{waiter.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {waiter.orders} pedidos
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-green-600">
                          {formatCurrency(waiter.revenue)}
                        </p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 ml-11">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${barWidth}%`,
                            background:
                              CHART_COLORS[index % CHART_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
