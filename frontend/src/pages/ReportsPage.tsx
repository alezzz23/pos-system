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
            api.get<TopProduct[]>("/orders/reports/top-products?limit=5"),
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const maxSales = Math.max(...salesData.map((d) => d.sales), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-500">Análisis de ventas y rendimiento</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Última semana
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ventas Totales</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary?.totalSales || 0)}
                </p>
                <p className="text-sm text-gray-500 mt-1">Últimos 7 días</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pedidos</p>
                <p className="text-2xl font-bold">
                  {summary?.totalOrders || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">Completados</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Clientes</p>
                <p className="text-2xl font-bold">
                  {summary?.totalCustomers || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">Mesas únicas</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ticket Promedio</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary?.averageTicket || 0)}
                </p>
                <p className="text-sm text-gray-500 mt-1">Por pedido</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-full">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas de la Semana</CardTitle>
          </CardHeader>
          <CardContent>
            {salesData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay datos de ventas
              </p>
            ) : (
              <div className="flex items-end gap-2 h-48">
                {salesData.map((day) => (
                  <div
                    key={day.day}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className="w-full bg-primary-500 rounded-t transition-all hover:bg-primary-600"
                      style={{ height: `${(day.sales / maxSales) * 100}%` }}
                      title={formatCurrency(day.sales)}
                    />
                    <span className="text-xs mt-2 text-gray-500">
                      {day.day}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
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
                      <span className="w-6 h-6 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Meseros con Más Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            {topWaiters.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay datos de meseros
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {topWaiters.map((waiter, index) => (
                  <div key={waiter.name} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="font-medium text-primary-700">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{waiter.name}</p>
                        <p className="text-sm text-gray-500">
                          {waiter.orders} pedidos
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(waiter.revenue)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
