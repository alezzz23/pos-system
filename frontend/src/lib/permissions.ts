import type { UserRole } from './types';

// Define which routes each role can access
export const rolePermissions: Record<UserRole, string[]> = {
    ADMIN: ['/', '/tables', '/orders', '/orders/new', '/kitchen', '/menu', '/inventory', '/reports', '/users', '/settings'],
    MANAGER: ['/', '/tables', '/orders', '/orders/new', '/kitchen', '/menu', '/inventory', '/reports', '/settings'],
    WAITER: ['/', '/tables', '/orders', '/orders/new', '/menu'],
    KITCHEN: ['/', '/kitchen'],
    CASHIER: ['/', '/orders', '/reports'],
};

// Define which nav items each role can see (by route path)
export const navPermissions: Record<UserRole, string[]> = {
    ADMIN: ['/', '/tables', '/orders', '/kitchen', '/menu', '/inventory', '/reports', '/users', '/settings'],
    MANAGER: ['/', '/tables', '/orders', '/kitchen', '/menu', '/inventory', '/reports', '/settings'],
    WAITER: ['/', '/tables', '/orders', '/menu'],
    KITCHEN: ['/', '/kitchen'],
    CASHIER: ['/', '/orders', '/reports'],
};

// Default landing page per role after login
export const defaultRouteByRole: Record<UserRole, string> = {
    ADMIN: '/',
    MANAGER: '/',
    WAITER: '/tables',
    KITCHEN: '/kitchen',
    CASHIER: '/orders',
};

/**
 * Check if a role has access to a specific route
 */
export function hasRouteAccess(role: UserRole, path: string): boolean {
    const allowedRoutes = rolePermissions[role];
    if (!allowedRoutes) return false;

    // Check exact match first
    if (allowedRoutes.includes(path)) return true;

    // Check if path starts with any allowed route (for nested routes like /orders/:id)
    return allowedRoutes.some(route => {
        if (route === '/') return path === '/';
        return path.startsWith(route);
    });
}

/**
 * Check if a role can see a nav item
 */
export function canSeeNavItem(role: UserRole, navPath: string): boolean {
    const allowedNav = navPermissions[role];
    if (!allowedNav) return false;
    return allowedNav.includes(navPath);
}
