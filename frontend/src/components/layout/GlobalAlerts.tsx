import { useState, useEffect, useCallback } from 'react';
import { TriangleAlert, PackageSearch, Clock } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useSettingsStore } from '@/store/settingsStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';

type OrderStatus = 'pending' | 'preparing' | 'delivered' | 'cancelled';
interface Order {
    id: number;
    status: OrderStatus;
    created_at: string;
    table: { number: number } | null;
}

export function GlobalAlerts() {
    const navigate = useNavigate();
    const { request } = useApi();
    const { getSettingValue } = useSettingsStore();
    const { ingredients, fetchIngredients } = useInventoryStore();

    const [orders, setOrders] = useState<Order[]>([]);

    const defaultTimeFilter = getSettingValue('default_time_filter', '30mins') as string;

    const fetchAlertData = useCallback(async () => {
        try {
            const res = await request<Order[]>({ url: `/orders?time_filter=${defaultTimeFilter}`, method: 'GET' });
            // Only keeping pending and preparing orders
            setOrders(res.data.filter(o => o.status === 'pending' || o.status === 'preparing'));
        } catch (e) {
            // Silently fail if there's an issue fetching
        }
    }, [request, defaultTimeFilter]);

    useEffect(() => {
        fetchAlertData();
        fetchIngredients();
        const interval = setInterval(() => {
            fetchAlertData();
        }, 30000);
        return () => clearInterval(interval);
    }, [fetchAlertData, fetchIngredients]);

    const getElapsedMinutes = (dateStr: string) => {
        const createdTime = new Date(dateStr).getTime();
        const now = new Date().getTime();
        return Math.floor((now - createdTime) / 60000);
    };

    const getCriticalMinutes = (filter: string) => {
        if (filter.endsWith('mins')) return parseInt(filter);
        if (filter.endsWith('hrs')) return parseInt(filter) * 60;
        if (filter === 'Today') return 24 * 60;
        if (filter === 'Week') return 7 * 24 * 60;
        return 30;
    };

    const criticalMinutes = getCriticalMinutes(defaultTimeFilter);
    const overdueOrders = orders.filter(o =>
        getElapsedMinutes(o.created_at) >= criticalMinutes
    ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // Low stock / Critical stock ingredients
    const alertIngredients = ingredients.filter(i => i.status === 'low' || i.status === 'warn');

    const totalAlerts = overdueOrders.length + alertIngredients.length;

    // When everything is calm, button will be hidden
    if (totalAlerts === 0) return null;

    const hasCritical = overdueOrders.length > 0 || alertIngredients.some(i => i.status === 'low');

    // "yellow for warning and red for crtitical"
    const alertColor = hasCritical
        ? 'text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/20'
        : 'text-amber-500 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20';
    const badgeColor = hasCritical ? 'bg-red-500' : 'bg-amber-500';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={`relative gap-2 h-9 border transition-colors shrink-0 font-medium ${alertColor}`}
                    size="sm"
                >
                    <TriangleAlert className="h-4 w-4" />
                    <span className="hidden sm:inline">Alerts</span>
                    <span className={`absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white ${badgeColor}`}>
                        {totalAlerts}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex justify-between items-center">
                    <span>Active Alerts</span>
                    <span className="text-xs text-muted-foreground">{totalAlerts} items</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="max-h-[60vh]">
                    {overdueOrders.length > 0 && (
                        <div className="p-2">
                            <h4 className="text-xs font-semibold text-red-500/80 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                Overdue Orders
                            </h4>
                            <div className="space-y-1">
                                {overdueOrders.map(order => (
                                    <div
                                        key={order.id}
                                        className="flex items-center justify-between p-2 text-sm rounded-md hover:bg-accent cursor-pointer group"
                                        onClick={() => navigate('/operations/orders')}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium text-red-500 flex items-center gap-1">
                                                Order #{order.id}
                                                {order.table?.number && <span className="text-muted-foreground text-xs font-normal">· Table {order.table.number}</span>}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                Overdue by {getElapsedMinutes(order.created_at) - criticalMinutes}m
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {overdueOrders.length > 0 && alertIngredients.length > 0 && <DropdownMenuSeparator />}

                    {alertIngredients.length > 0 && (
                        <div className="p-2">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <PackageSearch className="w-3.5 h-3.5" />
                                Stock Alerts
                            </h4>
                            <div className="space-y-1">
                                {alertIngredients.map(ing => (
                                    <div
                                        key={ing.id}
                                        className="flex items-center justify-between p-2 text-sm rounded-md hover:bg-accent cursor-pointer group"
                                        onClick={() => navigate('/inventory/ingredients')}
                                    >
                                        <div className="flex flex-col">
                                            <span className={`font-medium ${ing.status === 'low' ? 'text-red-500' : 'text-amber-500'}`}>
                                                {ing.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {ing.current_stock} / {ing.minimum_stock} {ing.unit}
                                            </span>
                                        </div>
                                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${ing.status === 'low'
                                                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                            }`}>
                                            {ing.status === 'low' ? 'Critical' : 'Low Stock'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
