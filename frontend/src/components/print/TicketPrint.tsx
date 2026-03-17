import type { Order, OrderItem } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface TicketPrintProps {
    order: Order;
    businessName?: string;
    businessAddress?: string;
    businessPhone?: string;
    businessRfc?: string;
}

export default function TicketPrint({
    order,
    businessName = 'Mi Restaurante',
    businessAddress = '',
    businessPhone = '',
    businessRfc = '',
}: TicketPrintProps) {
    return (
        <div className="ticket-print hidden print:block print:fixed print:inset-0 print:z-[9999] bg-white text-black font-mono text-xs">
            <div className="w-[280px] mx-auto p-2">
                {/* Header */}
                <div className="text-center border-b border-dashed border-gray-400 pb-2 mb-2">
                    <p className="font-bold text-sm uppercase">{businessName}</p>
                    {businessAddress && <p className="text-[10px]">{businessAddress}</p>}
                    {businessPhone && <p className="text-[10px]">Tel: {businessPhone}</p>}
                    {businessRfc && <p className="text-[10px]">RFC: {businessRfc}</p>}
                </div>

                {/* Order Info */}
                <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
                    <div className="flex justify-between">
                        <span>Pedido:</span>
                        <span className="font-bold">#{order.orderNumber?.slice(-6)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Fecha:</span>
                        <span>{formatDate(order.createdAt)}</span>
                    </div>
                    {order.table && (
                        <div className="flex justify-between">
                            <span>Mesa:</span>
                            <span>{order.table.number}</span>
                        </div>
                    )}
                    {order.waiter && (
                        <div className="flex justify-between">
                            <span>Mesero:</span>
                            <span>{order.waiter.firstName}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span>Tipo:</span>
                        <span>{order.type === 'DINE_IN' ? 'En mesa' : order.type === 'TAKEAWAY' ? 'Para llevar' : 'Delivery'}</span>
                    </div>
                </div>

                {/* Items */}
                <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
                    <div className="flex justify-between font-bold mb-1">
                        <span className="flex-1">Artículo</span>
                        <span className="w-8 text-center">Qty</span>
                        <span className="w-16 text-right">Total</span>
                    </div>
                    {order.items?.map((item: OrderItem) => (
                        <div key={item.id} className="flex justify-between text-[11px] leading-tight py-0.5">
                            <span className="flex-1 pr-1">{item.product?.name || 'Producto'}</span>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <span className="w-16 text-right">{formatCurrency(item.totalPrice)}</span>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div className="border-b border-dashed border-gray-400 pb-2 mb-2 space-y-0.5">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    {order.discount > 0 && (
                        <div className="flex justify-between">
                            <span>Descuento:</span>
                            <span>-{formatCurrency(order.discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span>IVA (16%):</span>
                        <span>{formatCurrency(order.tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm mt-1">
                        <span>TOTAL:</span>
                        <span>{formatCurrency(order.total)}</span>
                    </div>
                </div>

                {/* Payment Info */}
                {order.payments && order.payments.length > 0 && (
                    <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
                        <p className="font-bold mb-1">Pagos:</p>
                        {order.payments.map((payment) => (
                            <div key={payment.id} className="flex justify-between text-[11px]">
                                <span>{payment.method}</span>
                                <span>{formatCurrency(payment.amount)}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="text-center mt-4">
                    <p className="text-[10px]">¡Gracias por su preferencia!</p>
                    <p className="text-[10px] text-gray-500 mt-2">
                        {new Date().toLocaleString('es-MX')}
                    </p>
                </div>
            </div>
        </div>
    );
}

export function printTicket() {
    window.print();
}
