import { Utensils, Archive, ClipboardList, CircleDollarSign } from 'lucide-react';
import { StatCard } from './StatCard';
import { RecentOrders } from './RecentOrders';
import type { DashboardOrder } from './RecentOrders';
import { LowStockAlerts } from './LowStockAlerts';
import type { StockAlert } from './LowStockAlerts';
import { useSettingsStore } from '@/store/settingsStore';
import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
    cards: {
        menuItems: { total: number; addedThisWeek: number };
        ingredients: { total: number; lowStock: number };
        orders: { today: number; growth: number };
        revenue: { today: number; growth: number };
    };
    recentOrders: DashboardOrder[];
    lowStockAlerts: StockAlert[];
}

export function DashboardGrid() {
    const { getSettingValue } = useSettingsStore();
    const currency = getSettingValue('currency_symbol', '$');
    const { request } = useApi();
    const navigate = useNavigate();

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState<string>(getSettingValue('default_time_filter', '30mins') as string);

    useEffect(() => {
        setTimeFilter(getSettingValue('default_time_filter', '30mins') as string);
    }, [getSettingValue]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await request<any, { data: DashboardStats }>({ url: `/dashboard?time_filter=${timeFilter}`, method: 'GET' });
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [request, timeFilter]);

    if (loading || !stats) {
        return (
            <div className="animate-in fade-in space-y-7">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
                    <div className="h-[400px] rounded-xl bg-muted animate-pulse" />
                    <div className="h-[400px] rounded-xl bg-muted animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-[8px] duration-250">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
                <StatCard
                    title="Menu Items"
                    value={stats.cards.menuItems.total.toString()}
                    subtext={
                        <>
                            <span className={stats.cards.menuItems.addedThisWeek > 0 ? "text-green-500" : "text-muted-foreground"}>
                                +{stats.cards.menuItems.addedThisWeek}
                            </span> this week
                        </>
                    }
                    icon={Utensils}
                />
                <StatCard
                    title="Ingredients"
                    value={stats.cards.ingredients.total.toString()}
                    subtext={
                        stats.cards.ingredients.lowStock > 0 ? (
                            <><span className="text-red-500">{stats.cards.ingredients.lowStock} low stock</span></>
                        ) : (
                            <><span className="text-muted-foreground">All stocked up</span></>
                        )
                    }
                    icon={Archive}
                />
                <StatCard
                    title="Orders Today"
                    value={stats.cards.orders.today.toString()}
                    subtext={
                        <>
                            <span className={stats.cards.orders.growth >= 0 ? "text-green-500" : "text-red-500"}>
                                {stats.cards.orders.growth >= 0 ? '+' : ''}{stats.cards.orders.growth}%
                            </span> vs yesterday
                        </>
                    }
                    icon={ClipboardList}
                />
                <StatCard
                    title="Today's Revenue"
                    value={`${currency}${stats.cards.revenue.today.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subtext={
                        <>
                            <span className={stats.cards.revenue.growth >= 0 ? "text-green-500" : "text-red-500"}>
                                {stats.cards.revenue.growth >= 0 ? '+' : ''}{stats.cards.revenue.growth}%
                            </span> vs yesterday
                        </>
                    }
                    icon={CircleDollarSign}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
                <RecentOrders
                    orders={stats.recentOrders}
                    onViewAll={() => navigate('/operations/orders')}
                    timeFilter={timeFilter}
                    onTimeFilterChange={setTimeFilter}
                />
                <LowStockAlerts
                    alerts={stats.lowStockAlerts}
                    onManage={() => navigate('/management/ingredients?filter=alerts')}
                />
            </div>
        </div>
    );
}
