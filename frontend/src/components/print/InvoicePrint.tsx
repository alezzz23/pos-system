import type { Order, Invoice } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface InvoicePrintProps {
    order: Order;
    invoice: Invoice;
    businessName?: string;
    businessAddress?: string;
    businessPhone?: string;
    businessRfc?: string;
}

export default function InvoicePrint({
    order,
    invoice,
    businessName = 'Mi Restaurante',
    businessAddress = '',
    businessPhone = '',
    businessRfc = '',
}: InvoicePrintProps) {
    return (
        <div className="invoice-print hidden print:block print:fixed print:inset-0 print:z-[9999] bg-white text-black p-8 font-sans text-sm">
            <div className="max-w-[700px] mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-gray-900 pb-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold uppercase tracking-wide">{businessName}</h1>
                        {businessAddress && <p className="text-gray-600 text-xs mt-1">{businessAddress}</p>}
                        {businessPhone && <p className="text-gray-600 text-xs">Tel: {businessPhone}</p>}
                        {businessRfc && <p className="text-gray-600 text-xs">RFC: {businessRfc}</p>}
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold text-red-600">FACTURA</h2>
                        <p className="text-lg font-mono font-bold mt-1">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-gray-500 mt-1">Fecha: {formatDate(invoice.createdAt)}</p>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 p-4 rounded">
                        <h3 className="font-bold text-xs uppercase text-gray-500 mb-2">Facturar a:</h3>
                        <p className="font-semibold">{invoice.customerName || 'Cliente General'}</p>
                        {invoice.customerTaxId && <p className="text-xs text-gray-600">RFC: {invoice.customerTaxId}</p>}
                        {invoice.customerAddress && <p className="text-xs text-gray-600">{invoice.customerAddress}</p>}
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                        <h3 className="font-bold text-xs uppercase text-gray-500 mb-2">Detalles del Pedido:</h3>
                        <p className="text-xs">Pedido: <span className="font-semibold">#{order.orderNumber?.slice(-6)}</span></p>
                        {order.table && <p className="text-xs">Mesa: {order.table.number}</p>}
                        {order.waiter && <p className="text-xs">Atendido por: {order.waiter.firstName} {order.waiter.lastName}</p>}
                        <p className="text-xs">Tipo: {order.type === 'DINE_IN' ? 'En mesa' : order.type === 'TAKEAWAY' ? 'Para llevar' : 'Delivery'}</p>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-6">
                    <thead>
                        <tr className="border-b-2 border-gray-900">
                            <th className="text-left py-2 text-xs uppercase font-bold">Descripción</th>
                            <th className="text-center py-2 text-xs uppercase font-bold w-20">Cant.</th>
                            <th className="text-right py-2 text-xs uppercase font-bold w-28">P. Unitario</th>
                            <th className="text-right py-2 text-xs uppercase font-bold w-28">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items?.map((item) => (
                            <tr key={item.id} className="border-b border-gray-200">
                                <td className="py-2">
                                    <p className="font-medium">{item.product?.name || 'Producto'}</p>
                                    {item.notes && <p className="text-xs text-gray-500 italic">{item.notes}</p>}
                                </td>
                                <td className="text-center py-2">{item.quantity}</td>
                                <td className="text-right py-2">{formatCurrency(item.unitPrice)}</td>
                                <td className="text-right py-2 font-medium">{formatCurrency(item.totalPrice)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-64">
                        <div className="flex justify-between py-1 text-sm">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(invoice.subtotal)}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="flex justify-between py-1 text-sm text-green-600">
                                <span>Descuento:</span>
                                <span>-{formatCurrency(order.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between py-1 text-sm">
                            <span>IVA ({(invoice.taxRate * 100).toFixed(0)}%):</span>
                            <span>{formatCurrency(invoice.taxAmount)}</span>
                        </div>
                        <div className="flex justify-between py-2 text-lg font-bold border-t-2 border-gray-900 mt-1">
                            <span>TOTAL:</span>
                            <span>{formatCurrency(invoice.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Info */}
                {order.payments && order.payments.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <h3 className="font-bold text-xs uppercase text-gray-500 mb-2">Método de Pago:</h3>
                        <div className="flex gap-4">
                            {order.payments.map((p) => (
                                <span key={p.id} className="text-sm">
                                    {p.method === 'CASH' ? 'Efectivo' : p.method === 'CARD' ? 'Tarjeta' : p.method === 'TRANSFER' ? 'Transferencia' : p.method}: {formatCurrency(p.amount)}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Notes */}
                {invoice.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">Notas: {invoice.notes}</p>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-400">
                    <p>Este documento es una representación impresa de un comprobante fiscal digital.</p>
                    <p className="mt-1">¡Gracias por su preferencia!</p>
                </div>
            </div>
        </div>
    );
}
