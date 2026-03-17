import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search, X, ClipboardList, Table2, UtensilsCrossed, Package, Users } from 'lucide-react';
import { api } from '@/lib/api';

interface SearchResult {
    id: string;
    type: 'order' | 'product' | 'table' | 'user';
    title: string;
    subtitle?: string;
    route: string;
}

export default function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Keyboard shortcut: Ctrl+K
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
                setIsOpen(true);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
                inputRef.current?.blur();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Close on click outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const searchResults: SearchResult[] = [];

                // Search orders by orderNumber
                try {
                    const orders = await api.get<any[]>(`/orders?limit=5`);
                    orders
                        .filter((o) =>
                            o.orderNumber?.toLowerCase().includes(query.toLowerCase()) ||
                            o.id?.toLowerCase().includes(query.toLowerCase())
                        )
                        .forEach((o) =>
                            searchResults.push({
                                id: o.id,
                                type: 'order',
                                title: `Pedido #${o.orderNumber || o.id.slice(0, 8)}`,
                                subtitle: o.status,
                                route: `/orders/${o.id}`,
                            })
                        );
                } catch { /* ignore */ }

                // Search products
                try {
                    const products = await api.get<any[]>(`/products?search=${query}&limit=5`);
                    products.forEach((p: any) =>
                        searchResults.push({
                            id: p.id,
                            type: 'product',
                            title: p.name,
                            subtitle: `$${p.price}`,
                            route: '/menu',
                        })
                    );
                } catch { /* ignore */ }

                setResults(searchResults.slice(0, 8));
            } catch {
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const iconForType = (type: string) => {
        switch (type) {
            case 'order': return ClipboardList;
            case 'product': return UtensilsCrossed;
            case 'table': return Table2;
            case 'user': return Users;
            default: return Package;
        }
    };

    const handleSelect = (result: SearchResult) => {
        navigate(result.route);
        setQuery('');
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className="relative flex-1 max-w-md">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    placeholder="Buscar... (Ctrl+K)"
                    className="pl-9 pr-9 h-9"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            setResults([]);
                            setIsOpen(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {isOpen && (query.length >= 2) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                    {isSearching ? (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            Buscando...
                        </div>
                    ) : results.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            Sin resultados para "{query}"
                        </div>
                    ) : (
                        <div className="py-1">
                            {results.map((result) => {
                                const Icon = iconForType(result.type);
                                return (
                                    <button
                                        key={`${result.type}-${result.id}`}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-accent transition-colors"
                                        onClick={() => handleSelect(result)}
                                    >
                                        <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{result.title}</p>
                                            {result.subtitle && (
                                                <p className="text-xs text-muted-foreground">{result.subtitle}</p>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-muted rounded uppercase">
                                            {result.type === 'order' ? 'pedido' : result.type === 'product' ? 'producto' : result.type}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
