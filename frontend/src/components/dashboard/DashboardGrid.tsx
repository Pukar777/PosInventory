import { Utensils, Archive, ClipboardList, CircleDollarSign } from 'lucide-react';
import { StatCard } from './StatCard';
import { RecentOrders } from './RecentOrders';
import { LowStockAlerts } from './LowStockAlerts';

export function DashboardGrid() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-[8px] duration-250">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
                <StatCard
                    title="Menu Items"
                    value="12"
                    subtext={<><span className="text-green-500">+2</span> this week</>}
                    icon={Utensils}
                />
                <StatCard
                    title="Ingredients"
                    value="18"
                    subtext={<><span className="text-red-500">3 low stock</span></>}
                    icon={Archive}
                />
                <StatCard
                    title="Orders Today"
                    value="47"
                    subtext={<><span className="text-green-500">+12%</span> vs yesterday</>}
                    icon={ClipboardList}
                />
                <StatCard
                    title="Today's Revenue"
                    value="$2,341"
                    subtext={<><span className="text-green-500">+8.4%</span> vs yesterday</>}
                    icon={CircleDollarSign}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
                <RecentOrders />
                <LowStockAlerts />
            </div>
        </div>
    );
}
