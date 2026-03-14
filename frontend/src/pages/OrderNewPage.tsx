import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Minus, Trash2, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import type { Product, Category, Table } from '@/lib/types';

interface OrderItem {
  productId: string;
  product: Product;
  quantity: number;
  notes?: string;
}

export default function OrderNewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('tableId');
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [table, setTable] = useState<Table | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'>('DINE_IN');
  const [orderNotes, setOrderNotes] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, productsData] = await Promise.all([
          api.get<Category[]>('/products/categories'),
          api.get<Product[]>('/products/available'),
        ]);
        setCategories(categoriesData);
        setProducts(productsData);

        if (tableId) {
          const tableData = await api.get<Table>(`/tables/${tableId}`);
          setTable(tableData);
          setOrderType('DINE_IN');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tableId]);

  const addProductToOrder = (product: Product) => {
    const existingItem = orderItems.find((item) => item.productId === product.id);

    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrderItems([...orderItems, { productId: product.id, product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setOrderItems(
      orderItems
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId: string) => {
    setOrderItems(orderItems.filter((item) => item.productId !== productId));
  };

  const calculateTotal = () => {
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const tax = subtotal * 0.16;
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleCreateOrder = async () => {
    if (orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Agrega al menos un producto al pedido.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Crear el pedido
      const order = await api.post<any>('/orders', {
        type: orderType,
        tableId: tableId || undefined,
        notes: orderNotes || undefined,
      });

      // Agregar los items
      await Promise.all(
        orderItems.map((item) =>
          api.post(`/orders/${order.id}/items`, {
            productId: item.productId,
            quantity: item.quantity,
            notes: item.notes,
          })
        )
      );

      toast({
        title: "Pedido creado",
        description: `El pedido se ha creado exitosamente.`,
      });

      // Navegar al detalle del pedido o volver a mesas
      navigate(tableId ? '/tables' : '/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al crear el pedido.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter(
    (product) => !selectedCategory || product.categoryId === selectedCategory
  );

  const totals = calculateTotal();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Pedido</h1>
          <p className="text-gray-500">
            {table ? `Mesa ${table.number}` : 'Para llevar / Delivery'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menú de productos */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tipo de pedido */}
          {!tableId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tipo de Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant={orderType === 'DINE_IN' ? 'default' : 'outline'}
                    onClick={() => setOrderType('DINE_IN')}
                  >
                    Para comer aquí
                  </Button>
                  <Button
                    variant={orderType === 'TAKEAWAY' ? 'default' : 'outline'}
                    onClick={() => setOrderType('TAKEAWAY')}
                  >
                    Para llevar
                  </Button>
                  <Button
                    variant={orderType === 'DELIVERY' ? 'default' : 'outline'}
                    onClick={() => setOrderType('DELIVERY')}
                  >
                    Delivery
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Categorías */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categorías</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex gap-2 p-4 overflow-x-auto">
                <Button
                  variant={!selectedCategory ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(null)}
                  size="sm"
                >
                  Todas
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category.id)}
                    size="sm"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Productos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Productos</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay productos disponibles
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addProductToOrder(product)}
                      className="p-3 border rounded-lg hover:border-primary hover:bg-primary-50 transition-colors text-left"
                    >
                      <p className="font-medium">{product.name}</p>
                      {product.description && (
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {product.description}
                        </p>
                      )}
                      <p className="text-primary-600 font-bold mt-1">
                        {formatCurrency(product.price)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumen del pedido */}
        <div className="space-y-4">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              {orderItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Agrega productos al pedido
                </p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {orderItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-start justify-between gap-2 pb-3 border-b"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{item.product.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(item.product.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.productId, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.productId, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-600"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="tabular-nums">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Impuesto (16%)</span>
                    <span className="tabular-nums">{formatCurrency(totals.tax)}</span>
                  </div>

                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary-600 tabular-nums">{formatCurrency(totals.total)}</span>
                  </div>

                  <div>
                    <Input
                      id="notes"
                      placeholder="Instrucciones especiales..."
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                    />
                  </div>

                  {/* Botón crear */}
                  <Button
                    className="w-full"
                    onClick={handleCreateOrder}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      'Crear Pedido'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
