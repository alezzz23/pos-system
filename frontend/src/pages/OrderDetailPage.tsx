import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Clock,
  ChefHat,
  CheckCircle,
  XCircle,
  DollarSign,
  FileText,
  Loader2,
  Plus,
  Printer,
  Tag,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import type { Order, OrderStatus, PaymentMethod } from '@/lib/types';
import TicketPrint, { printTicket } from '@/components/print/TicketPrint';
import InvoicePrint from '@/components/print/InvoicePrint';

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  IN_PROGRESS: {
    label: 'En preparación',
    color: 'bg-blue-100 text-blue-700',
    icon: ChefHat,
  },
  READY: { label: 'Listo', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  SERVED: {
    label: 'Servido',
    color: 'bg-purple-100 text-purple-700',
    icon: CheckCircle,
  },
  BILL_REQUESTED: {
    label: 'Cuenta solicitada',
    color: 'bg-orange-100 text-orange-700',
    icon: Clock,
  },
  COMPLETED: {
    label: 'Completado',
    color: 'bg-gray-100 text-gray-700',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment form
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paymentReference, setPaymentReference] = useState('');

  // Invoice form
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerTaxId, setCustomerTaxId] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Discount form
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [discountReason, setDiscountReason] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    if (!id) return;
    try {
      const data = await api.get<Order>(`/orders/${id}`);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (newStatus: OrderStatus) => {
    if (!order) return;
    setIsProcessing(true);
    try {
      await api.patch(`/orders/${order.id}/status`, { status: newStatus });
      await fetchOrder();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado');
    } finally {
      setIsProcessing(false);
    }
  };

  const requestBill = async () => {
    if (!order) return;
    setIsProcessing(true);
    try {
      await api.post(`/orders/${order.id}/request-bill`, {});
      await fetchOrder();
    } catch (error) {
      console.error('Error requesting bill:', error);
      alert('Error al solicitar la cuenta');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddPayment = async () => {
    if (!order || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Ingresa un monto válido');
      return;
    }

    setIsProcessing(true);
    try {
      await api.post(`/orders/${order.id}/payments`, {
        amount,
        method: paymentMethod,
        reference: paymentReference || undefined,
      });
      await fetchOrder();
      setShowPaymentForm(false);
      setPaymentAmount('');
      setPaymentReference('');
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Error al registrar el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!order) return;

    setIsProcessing(true);
    try {
      await api.post(`/orders/${order.id}/invoice`, {
        name: customerName || undefined,
        taxId: customerTaxId || undefined,
        address: customerAddress || undefined,
      });
      await fetchOrder();
      setShowInvoiceForm(false);
      alert('Factura generada exitosamente');
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Error al generar la factura');
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelOrder = async () => {
    if (!order) return;
    if (!confirm('¿Estás seguro de cancelar este pedido?')) return;

    const reason = prompt('Motivo de cancelación (opcional):');
    setIsProcessing(true);
    try {
      await api.post(`/orders/${order.id}/cancel`, { reason: reason || undefined });
      await fetchOrder();
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Error al cancelar el pedido');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Pedido no encontrado</p>
        <Button onClick={() => navigate('/orders')} className="mt-4">
          Volver a pedidos
        </Button>
      </div>
    );
  }

  const config = statusConfig[order.status];
  const StatusIcon = config.icon;

  const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingBalance = order.total - totalPaid;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Pedido #{order.orderNumber || order.id.slice(0, 8)}
              </h1>
              <p className="text-gray-500">
                {order.table ? `Mesa ${order.table.number}` : order.type} •{' '}
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          <span
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2',
              config.color
            )}
          >
            <StatusIcon className="w-4 h-4" />
            {config.label}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items del pedido */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Items del Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                {order.items.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay items en este pedido
                  </p>
                ) : (
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.product?.name}</p>
                          {item.variant && (
                            <p className="text-sm text-gray-500">{item.variant.name}</p>
                          )}
                          {item.notes && (
                            <p className="text-sm text-gray-500">Nota: {item.notes}</p>
                          )}
                          <p className="text-sm text-gray-600 mt-1">
                            {formatCurrency(item.unitPrice)} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(item.totalPrice)}</p>
                          <span
                            className={cn(
                              'text-xs px-2 py-0.5 rounded-full',
                              item.status === 'ready'
                                ? 'bg-green-100 text-green-700'
                                : item.status === 'preparing'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-600'
                            )}
                          >
                            {item.status === 'ready'
                              ? 'Listo'
                              : item.status === 'preparing'
                                ? 'Preparando'
                                : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {order.notes && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Notas del pedido:</p>
                    <p className="text-sm text-blue-700">{order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pagos */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pagos</CardTitle>
                  {!showPaymentForm &&
                    order.status !== 'CANCELLED' &&
                    remainingBalance > 0 && (
                      <Button size="sm" onClick={() => setShowPaymentForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Pago
                      </Button>
                    )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showPaymentForm && (
                  <div className="p-4 border rounded-lg space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Monto</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="method">Método de pago</Label>
                      <select
                        id="method"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      >
                        <option value="CASH">Efectivo</option>
                        <option value="CARD">Tarjeta</option>
                        <option value="TRANSFER">Transferencia</option>
                        <option value="MIXED">Mixto</option>
                      </select>
                    </div>
                    {paymentMethod !== 'CASH' && (
                      <div className="space-y-2">
                        <Label htmlFor="reference">Referencia (opcional)</Label>
                        <Input
                          id="reference"
                          placeholder="Número de transacción..."
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button onClick={handleAddPayment} disabled={isProcessing}>
                        {isProcessing ? 'Procesando...' : 'Registrar Pago'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowPaymentForm(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {order.payments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No hay pagos registrados
                  </p>
                ) : (
                  <div className="space-y-2">
                    {order.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {payment.method === 'CASH'
                              ? 'Efectivo'
                              : payment.method === 'CARD'
                                ? 'Tarjeta'
                                : payment.method === 'TRANSFER'
                                  ? 'Transferencia'
                                  : 'Mixto'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(payment.createdAt)}
                          </p>
                          {payment.reference && (
                            <p className="text-xs text-gray-500">
                              Ref: {payment.reference}
                            </p>
                          )}
                        </div>
                        <p className="font-bold text-green-600">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total pagado:</span>
                    <span className="font-medium">{formatCurrency(totalPaid)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Saldo restante:</span>
                    <span
                      className={cn(
                        'font-bold',
                        remainingBalance > 0 ? 'text-red-600' : 'text-green-600'
                      )}
                    >
                      {formatCurrency(remainingBalance)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Factura */}
            {order.status !== 'CANCELLED' && (
              <Card>
                <CardHeader>
                  <CardTitle>Facturación</CardTitle>
                </CardHeader>
                <CardContent>
                  {order.invoice ? (
                    <div className="space-y-2">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-5 h-5 text-green-600" />
                          <p className="font-medium text-green-900">
                            Factura generada
                          </p>
                        </div>
                        <p className="text-sm text-green-700">
                          Folio: {order.invoice.invoiceNumber}
                        </p>
                        {order.invoice.customerName && (
                          <p className="text-sm text-green-700">
                            Cliente: {order.invoice.customerName}
                          </p>
                        )}
                        {order.invoice.customerTaxId && (
                          <p className="text-sm text-green-700">
                            RFC: {order.invoice.customerTaxId}
                          </p>
                        )}
                        <p className="text-sm text-green-700 mt-2">
                          Total: {formatCurrency(order.invoice.total)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="mt-3"
                        onClick={printTicket}
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimir Factura
                      </Button>
                    </div>
                  ) : (
                    <>
                      {!showInvoiceForm ? (
                        <Button onClick={() => setShowInvoiceForm(true)}>
                          <FileText className="w-4 h-4 mr-2" />
                          Generar Factura
                        </Button>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="customerName">Nombre del cliente</Label>
                            <Input
                              id="customerName"
                              placeholder="Nombre completo o razón social"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="taxId">RFC / NIT</Label>
                            <Input
                              id="taxId"
                              placeholder="ABC123456789"
                              value={customerTaxId}
                              onChange={(e) => setCustomerTaxId(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="address">Dirección fiscal</Label>
                            <Input
                              id="address"
                              placeholder="Calle, número, colonia, ciudad..."
                              value={customerAddress}
                              onChange={(e) => setCustomerAddress(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleCreateInvoice}
                              disabled={isProcessing}
                            >
                              {isProcessing ? 'Generando...' : 'Generar Factura'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowInvoiceForm(false)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Resumen y acciones */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal:</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">IVA (16%):</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Descuento:</span>
                    <span className="text-red-600">
                      -{formatCurrency(order.discount)}
                    </span>
                  </div>
                )}

                {/* Discount Button */}
                {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && order.discount === 0 && (
                  !showDiscountForm ? (
                    <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => setShowDiscountForm(true)}>
                      <Tag className="w-4 h-4 mr-2" />
                      Aplicar Descuento
                    </Button>
                  ) : (
                    <div className="mt-2 p-3 border rounded-lg space-y-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={discountType === 'PERCENTAGE' ? 'default' : 'outline'}
                          onClick={() => setDiscountType('PERCENTAGE')}
                          className="flex-1"
                        >
                          %
                        </Button>
                        <Button
                          size="sm"
                          variant={discountType === 'FIXED' ? 'default' : 'outline'}
                          onClick={() => setDiscountType('FIXED')}
                          className="flex-1"
                        >
                          $
                        </Button>
                      </div>
                      <Input
                        type="number"
                        placeholder={discountType === 'PERCENTAGE' ? '10' : '50.00'}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                      />
                      <Input
                        placeholder="Motivo (opcional)"
                        value={discountReason}
                        onChange={(e) => setDiscountReason(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={isProcessing || !discountValue}
                          onClick={async () => {
                            setIsProcessing(true);
                            try {
                              await api.post(`/orders/${order.id}/discount`, {
                                type: discountType,
                                value: parseFloat(discountValue),
                                reason: discountReason || undefined,
                              });
                              await fetchOrder();
                              setShowDiscountForm(false);
                              setDiscountValue('');
                              setDiscountReason('');
                            } catch (err) {
                              alert(err instanceof Error ? err.message : 'Error');
                            } finally {
                              setIsProcessing(false);
                            }
                          }}
                        >
                          Aplicar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowDiscountForm(false)}>Cancelar</Button>
                      </div>
                    </div>
                  )
                )}
                <div className="flex justify-between font-bold text-lg pt-3 border-t">
                  <span>Total:</span>
                  <span className="text-primary-600">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {order.status === 'PENDING' && (
                  <Button
                    className="w-full"
                    onClick={() => updateStatus('IN_PROGRESS')}
                    disabled={isProcessing}
                  >
                    <ChefHat className="w-4 h-4 mr-2" />
                    Iniciar Preparación
                  </Button>
                )}

                {order.status === 'IN_PROGRESS' && (
                  <Button
                    className="w-full"
                    onClick={() => updateStatus('READY')}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar como Listo
                  </Button>
                )}

                {order.status === 'READY' && (
                  <Button
                    className="w-full"
                    onClick={() => updateStatus('SERVED')}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar como Servido
                  </Button>
                )}

                {order.status === 'SERVED' && (
                  <Button
                    className="w-full"
                    onClick={requestBill}
                    disabled={isProcessing}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Solicitar Cuenta
                  </Button>
                )}

                {order.status !== 'COMPLETED' &&
                  order.status !== 'CANCELLED' && (
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={cancelOrder}
                      disabled={isProcessing}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancelar Pedido
                    </Button>
                  )}

                {order.status === 'COMPLETED' && (
                  <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-2" />
                    <p className="text-sm text-gray-500">Pedido completado</p>
                  </div>
                )}

                {/* Print buttons */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={printTicket}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir Ticket
                </Button>
              </CardContent>
            </Card>

            {order.waiter && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Atendido por</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">
                    {order.waiter.firstName} {order.waiter.lastName}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Hidden print components */}
      <TicketPrint order={order} />
      {order.invoice && <InvoicePrint order={order} invoice={order.invoice} />}
    </>
  );
}
