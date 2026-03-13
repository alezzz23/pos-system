import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Store, Receipt, Printer, Bell, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { Setting } from '@/lib/types';

type SettingMap = Record<string, string>;

const getSetting = (map: SettingMap, key: string, fallback = '') => map[key] ?? fallback;

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<SettingMap>({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.get<Setting[]>('/settings');
        const map: SettingMap = {};
        data.forEach((s) => {
          map[s.key] = s.value;
        });
        setSettings(map);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateLocal = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveKeys = async (keys: string[]) => {
    setIsSaving(true);
    try {
      await api.put('/settings', {
        items: keys.map((k) => ({ key: k, value: settings[k] ?? '' })),
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
              <Input
                id="businessName"
                value={getSetting(settings, 'business.name')}
                onChange={(e) => updateLocal('business.name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={getSetting(settings, 'business.address')}
                onChange={(e) => updateLocal('business.address', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={getSetting(settings, 'business.phone')}
                onChange={(e) => updateLocal('business.phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">RFC/NIT</Label>
              <Input
                id="taxId"
                value={getSetting(settings, 'business.taxId')}
                onChange={(e) => updateLocal('business.taxId', e.target.value)}
              />
            </div>
            <Button
              disabled={isSaving}
              onClick={() =>
                saveKeys(['business.name', 'business.address', 'business.phone', 'business.taxId'])
              }
            >
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
              <Input
                id="taxRate"
                type="number"
                value={getSetting(settings, 'tax.rate', '16')}
                onChange={(e) => updateLocal('tax.rate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxIncluded">Impuesto incluido en precios</Label>
              <select 
                id="taxIncluded"
                value={getSetting(settings, 'tax.included', 'no')}
                onChange={(e) => updateLocal('tax.included', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="no">No - Agregar al total</option>
                <option value="yes">Sí - Incluido en precio</option>
              </select>
            </div>
            <Button
              disabled={isSaving}
              onClick={() => saveKeys(['tax.rate', 'tax.included'])}
            >
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
              <Input
                id="printerName"
                placeholder="POS-58"
                value={getSetting(settings, 'printer.name')}
                onChange={(e) => updateLocal('printer.name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paperSize">Tamaño de Papel</Label>
              <select 
                id="paperSize"
                value={getSetting(settings, 'printer.paperSize', '58')}
                onChange={(e) => updateLocal('printer.paperSize', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="58">58mm</option>
                <option value="80">80mm</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoPrint"
                className="rounded"
                checked={getSetting(settings, 'printer.autoPrint', 'true') === 'true'}
                onChange={(e) => updateLocal('printer.autoPrint', String(e.target.checked))}
              />
              <Label htmlFor="autoPrint">Imprimir automáticamente al cobrar</Label>
            </div>
            <div className="flex gap-2">
              <Button
                disabled={isSaving}
                onClick={() => saveKeys(['printer.name', 'printer.paperSize', 'printer.autoPrint'])}
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
              <Button variant="outline">Probar Impresión</Button>
            </div>
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
              <input
                type="checkbox"
                id="notifyOrders"
                className="rounded"
                checked={getSetting(settings, 'notify.orders', 'true') === 'true'}
                onChange={(e) => updateLocal('notify.orders', String(e.target.checked))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifyKitchen">Pedidos listos</Label>
              <input
                type="checkbox"
                id="notifyKitchen"
                className="rounded"
                checked={getSetting(settings, 'notify.kitchen', 'true') === 'true'}
                onChange={(e) => updateLocal('notify.kitchen', String(e.target.checked))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifyInventory">Stock bajo</Label>
              <input
                type="checkbox"
                id="notifyInventory"
                className="rounded"
                checked={getSetting(settings, 'notify.inventory', 'true') === 'true'}
                onChange={(e) => updateLocal('notify.inventory', String(e.target.checked))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifyBill">Solicitud de cuenta</Label>
              <input
                type="checkbox"
                id="notifyBill"
                className="rounded"
                checked={getSetting(settings, 'notify.bill', 'true') === 'true'}
                onChange={(e) => updateLocal('notify.bill', String(e.target.checked))}
              />
            </div>
            <Button
              disabled={isSaving}
              onClick={() => saveKeys(['notify.orders', 'notify.kitchen', 'notify.inventory', 'notify.bill'])}
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
