import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from 'lucide-react';

export interface StatCardProps {
    title: string;
    value: string | number;
    subtext?: React.ReactNode;
    icon: LucideIcon;
    className?: string;
    subtextVariant?: 'up' | 'down' | 'neutral';
}

export function StatCard({
    title,
    value,
    subtext,
    subtextVariant = 'neutral',
    icon: Icon,
    className
}: StatCardProps) {
    return (
        <Card className={cn("relative overflow-hidden transition-colors border group hover:border-amber-500/30 bg-card", className)}>
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            <CardContent className="p-5">
                <div className="text-[11px] tracking-[1.5px] uppercase text-muted-foreground mb-2.5">
                    {title}
                </div>
                <div className="font-mono text-3xl text-foreground font-medium leading-none">
                    {value}
                </div>
                {subtext && (
                    <div className={cn("text-xs mt-2",
                        subtextVariant === 'up' && "text-green-500",
                        subtextVariant === 'down' && "text-red-500",
                        subtextVariant === 'neutral' && "text-muted-foreground"
                    )}>
                        {subtext}
                    </div>
                )}
                <Icon className="absolute top-[18px] right-[18px] w-[22px] h-[22px] opacity-35 text-foreground" />
            </CardContent>
        </Card>
    );
}
