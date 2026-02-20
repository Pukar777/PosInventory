import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FilterOption {
    value: string;
    label: string;
}

interface TableToolbarProps {
    searchQuery: string;
    onSearchChange: (val: string) => void;
    searchPlaceholder?: string;
    filterValue?: string;
    onFilterChange?: (val: string) => void;
    filterOptions?: FilterOption[];
    filterPlaceholder?: string;
}

export function TableToolbar({
    searchQuery,
    onSearchChange,
    searchPlaceholder = "Search...",
    filterValue,
    onFilterChange,
    filterOptions,
    filterPlaceholder = "All options"
}: TableToolbarProps) {
    return (
        <div className="flex items-center gap-[12px] mb-[16px]">
            <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="flex-1 h-[38px] bg-card"
            />
            {filterOptions && onFilterChange && (
                <Select value={filterValue} onValueChange={onFilterChange}>
                    <SelectTrigger className="w-[160px] h-[38px] bg-card">
                        <SelectValue placeholder={filterPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {filterOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    );
}
