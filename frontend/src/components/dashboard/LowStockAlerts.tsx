import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";

export interface StockAlert {
    id: string;
    name: string;
    quantity: string;
    min: string;
    level: 'critical' | 'warning';
}

interface LowStockAlertsProps {
    alerts?: StockAlert[];
    onManage?: () => void;
}

const defaultAlerts: StockAlert[] = [
    { id: '1', name: 'Mozzarella Cheese', quantity: '1.2 kg', min: '3', level: 'critical' },
    { id: '2', name: 'Ground Beef', quantity: '0.8 kg', min: '2', level: 'critical' },
    { id: '3', name: 'Heavy Cream', quantity: '1.5 L', min: '2', level: 'warning' },
    { id: '4', name: 'Burger Buns', quantity: '8 pcs', min: '20', level: 'warning' },
];

export function LowStockAlerts({ alerts = defaultAlerts, onManage }: LowStockAlertsProps) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-[18px] px-[22px] border-b space-y-0">
                <CardTitle className="text-base font-semibold font-serif flex items-center gap-[6px] leading-none text-foreground">
                    <AlertTriangle className="w-[18px] h-[18px] text-amber-500" />
                    Low Stock Alerts
                </CardTitle>
                <Button variant="secondary" size="sm" className="h-7 text-xs px-2.5" onClick={onManage}>
                    Manage
                </Button>
            </CardHeader>
            <CardContent className="p-[20px] px-[22px]">
                <div className="flex flex-col gap-[10px]">
                    {alerts.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">All items sufficiently stocked.</div>
                    ) : (
                        alerts.map(alert => (
                            <div key={alert.id} className="flex items-center gap-[14px] p-[12px] px-[14px] bg-secondary/30 rounded-md border">
                                <div className={cn(
                                    "w-2 h-2 rounded-full shrink-0",
                                    alert.level === 'critical' ? "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" : "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]"
                                )} />
                                <div className="flex-1 text-[14px] text-foreground">{alert.name}</div>
                                <div className="font-mono text-[12px] text-muted-foreground">
                                    <span className={cn("font-medium", alert.level === 'critical' ? "text-red-500" : "text-amber-500")}>{alert.quantity}</span> / min {alert.min}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
