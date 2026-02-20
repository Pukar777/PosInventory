import { cn, getStorageUrl } from "@/lib/utils";

type BadgeVariant = 'good' | 'warn' | 'low' | 'neutral' | 'delivered' | 'preparing' | 'pending';

interface StatusBadgeProps {
    label: string;
    variant: BadgeVariant;
    className?: string;
}

export function StatusBadge({ label, variant, className }: StatusBadgeProps) {
    return (
        <span className={cn(
            "text-[10px] sm:text-[11px] font-semibold px-[8px] py-[3px] rounded-full uppercase tracking-[0.5px]",
            variant === 'good' && "bg-green-500/15 text-green-500",
            variant === 'low' && "bg-red-500/15 text-red-500",
            variant === 'warn' && "bg-amber-500/15 text-amber-500",
            variant === 'delivered' && "bg-green-500/15 text-green-500",
            variant === 'preparing' && "bg-amber-500/15 text-amber-500",
            variant === 'pending' && "bg-blue-500/15 text-blue-500",
            variant === 'neutral' && "bg-secondary text-muted-foreground border border-border",
            className
        )}>
            {label}
        </span>
    );
}

export function UnitTag({ unit, className }: { unit: string; className?: string }) {
    return (
        <span className={cn(
            "font-mono text-[11px] text-muted-foreground bg-secondary/80 border border-border px-[7px] py-[2px] rounded uppercase",
            className
        )}>
            {unit}
        </span>
    );
}

export function CatPill({ label, className }: { label: string; className?: string }) {
    return (
        <span className={cn(
            "inline-flex items-center bg-secondary/80 border border-border rounded-full px-[10px] py-[3px] text-[12px] text-muted-foreground",
            className
        )}>
            {label}
        </span>
    );
}

export function ImageThumb({ emoji, imageUrl, className }: { emoji?: string; imageUrl?: string; className?: string }) {
    if (imageUrl) {
        return (
            <div className={cn(
                "w-[38px] h-[38px] rounded-md border border-border flex items-center justify-center shrink-0 overflow-hidden bg-white/5",
                className
            )}>
                <img src={getStorageUrl(imageUrl)} alt="thumbnail" className="w-full h-full object-cover" />
            </div>
        );
    }

    return (
        <div className={cn(
            "w-[38px] h-[38px] rounded-md bg-secondary/80 border border-border flex items-center justify-center text-[18px] shrink-0 overflow-hidden",
            className
        )}>
            {emoji || '🍽️'}
        </div>
    );
}
