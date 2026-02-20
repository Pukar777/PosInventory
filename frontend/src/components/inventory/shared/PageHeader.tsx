import { Button } from "@/components/ui/button";

interface PageHeaderProps {
    title: string;
    actionLabel?: string;
    onAction?: () => void;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
    icon?: React.ReactNode;
}

export function PageHeader({ title, actionLabel, onAction, secondaryActionLabel, onSecondaryAction, icon }: PageHeaderProps) {
    return (
        <div className="flex items-center gap-[12px] mb-[22px]">
            <h2 className="font-serif text-[20px] text-foreground font-semibold flex-1 flex items-center gap-2">
                {title}
            </h2>
            <div className="flex gap-[10px]">
                {secondaryActionLabel && (
                    <Button variant="secondary" onClick={onSecondaryAction} className="h-9 px-4 flex items-center gap-[7px]">
                        {icon} {secondaryActionLabel}
                    </Button>
                )}
                {actionLabel && (
                    <Button onClick={onAction} className="h-9 px-4 bg-amber-500 hover:bg-[#f0b840] text-[#1a1300] shadow-[0_4px_16px_rgba(232,168,56,0.3)] hover:-translate-y-[1px] transition-all">
                        {actionLabel}
                    </Button>
                )}
            </div>
        </div>
    );
}
