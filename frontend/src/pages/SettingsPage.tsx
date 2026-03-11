import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Store, Receipt, Printer, Bell } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500">Ajustes del sistema POS</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Información del Negocio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Nombre del Negocio</Label>
              <Input id="businessName" defaultValue="Restaurante Ejemplo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" defaultValue="Av. Principal 123, Ciudad" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" defaultValue="555-123-4567" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">RFC/NIT</Label>
              <Input id="taxId" defaultValue="ABC123456789" />
            </div>
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </CardContent>
        </Card>

        {/* Tax Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Impuestos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tasa de IVA (%)</Label>
              <Input id="taxRate" type="number" defaultValue="16" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxIncluded">Impuesto incluido en precios</Label>
              <select 
                id="taxIncluded"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="no">No - Agregar al total</option>
                <option value="yes">Sí - Incluido en precio</option>
              </select>
            </div>
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </CardContent>
        </Card>

        {/* Printer Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Impresora de Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="printerName">Nombre de Impresora</Label>
              <Input id="printerName" placeholder="POS-58" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paperSize">Tamaño de Papel</Label>
              <select 
                id="paperSize"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="58">58mm</option>
                <option value="80">80mm</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="autoPrint" className="rounded" defaultChecked />
              <Label htmlFor="autoPrint">Imprimir automáticamente al cobrar</Label>
            </div>
            <Button variant="outline">Probar Impresión</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifyOrders">Nuevos pedidos</Label>
              <input type="checkbox" id="notifyOrders" className="rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifyKitchen">Pedidos listos</Label>
              <input type="checkbox" id="notifyKitchen" className="rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifyInventory">Stock bajo</Label>
              <input type="checkbox" id="notifyInventory" className="rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifyBill">Solicitud de cuenta</Label>
              <input type="checkbox" id="notifyBill" className="rounded" defaultChecked />
            </div>
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
