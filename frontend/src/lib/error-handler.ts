import { toast } from '@/components/ui/use-toast';
import { ApiError } from '@/lib/api';

/**
 * Handle API errors and display them as toast notifications.
 * Use this in catch blocks when calling the API.
 */
export function handleApiError(error: unknown, fallbackMessage = 'Ha ocurrido un error') {
    if (error instanceof ApiError) {
        const description = error.errors?.length
            ? error.errors.join(', ')
            : error.message;

        toast({
            title: getErrorTitle(error.statusCode),
            description,
            variant: 'destructive',
        });
    } else if (error instanceof Error) {
        toast({
            title: 'Error',
            description: error.message || fallbackMessage,
            variant: 'destructive',
        });
    } else {
        toast({
            title: 'Error',
            description: fallbackMessage,
            variant: 'destructive',
        });
    }
}

function getErrorTitle(statusCode: number): string {
    switch (statusCode) {
        case 400: return 'Datos inválidos';
        case 401: return 'No autorizado';
        case 403: return 'Acceso denegado';
        case 404: return 'No encontrado';
        case 409: return 'Conflicto';
        case 422: return 'Validación fallida';
        case 429: return 'Demasiadas solicitudes';
        case 500: return 'Error del servidor';
        default: return 'Error';
    }
}

/**
 * Show a success toast notification.
 */
export function showSuccess(title: string, description?: string) {
    toast({
        title,
        description,
    });
}
