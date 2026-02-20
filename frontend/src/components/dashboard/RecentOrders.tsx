import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DashboardOrder {
    id: string;
    itemsConfig: string;
    amount: string;
    status: 'Delivered' | 'Preparing' | 'Pending';
}

interface RecentOrdersProps {
    orders?: DashboardOrder[];
    onViewAll?: () => void;
}

const defaultOrders: DashboardOrder[] = [
    { id: '#1042', itemsConfig: 'Burger ×2, Pasta ×1', amount: '$42.50', status: 'Delivered' },
    { id: '#1041', itemsConfig: 'Pizza ×1, Coke ×2', amount: '$27.00', status: 'Preparing' },
    { id: '#1040', itemsConfig: 'Salad ×3', amount: '$36.00', status: 'Delivered' },
    { id: '#1039', itemsConfig: 'Tiramisu ×2, Coffee ×2', amount: '$29.50', status: 'Pending' },
    { id: '#1038', itemsConfig: 'Burger ×1, Fries ×1', amount: '$22.00', status: 'Delivered' },
];

export function RecentOrders({ orders = defaultOrders, onViewAll }: RecentOrdersProps) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-[18px] px-[22px] border-b space-y-0">
                <CardTitle className="text-base font-semibold font-serif leading-none">Recent Orders</CardTitle>
                <Button variant="secondary" size="sm" className="h-7 text-xs px-2.5" onClick={onViewAll}>
                    View All
                </Button>
            </CardHeader>
            <CardContent className="p-0 px-[22px]">
                <div className="flex flex-col">
                    {orders.map((order, i) => (
                        <div key={order.id} className={cn(
                            "flex items-center gap-[14px] py-[13px] text-[13px]",
                            i !== orders.length - 1 && "border-b"
                        )}>
                            <span className="font-mono text-amber-500 text-xs w-[60px]">{order.id}</span>
                            <span className="flex-1 text-foreground">{order.itemsConfig}</span>
                            <span className="font-mono text-foreground text-[13px] w-[70px] text-right">{order.amount}</span>
                            <span className={cn(
                                "text-[10px] font-semibold tracking-[0.5px] px-[8px] py-[3px] rounded-full uppercase",
                                order.status === 'Delivered' && "bg-green-500/15 text-green-500",
                                order.status === 'Preparing' && "bg-amber-500/15 text-amber-500",
                                order.status === 'Pending' && "bg-blue-500/15 text-blue-500"
                            )}>
                                {order.status}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
