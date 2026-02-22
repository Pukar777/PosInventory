import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import { format } from 'date-fns';

export interface StockLogFilterState {
    start_date: string;
    end_date: string;
    ingredient_id: string;
    menu_item_id: string;
    movement_type: string;
    user_id: string;
}

interface StockLogFilterProps {
    onFilterChange: (filters: StockLogFilterState) => void;
}

interface CommonOption {
    id: number;
    name: string;
}

export function StockLogFilter({ onFilterChange }: StockLogFilterProps) {
    const { request } = useApi();

    // Options
    const [ingredients, setIngredients] = useState<CommonOption[]>([]);
    const [menuItems, setMenuItems] = useState<CommonOption[]>([]);
    const [users, setUsers] = useState<CommonOption[]>([]);

    // Filter State
    const today = format(new Date(), 'yyyy-MM-dd');
    const [filters, setFilters] = useState<StockLogFilterState>({
        start_date: today,
        end_date: today,
        ingredient_id: 'all',
        menu_item_id: 'all',
        movement_type: 'all',
        user_id: 'all'
    });

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [ingRes, menuRes, userRes] = await Promise.all([
                    request<{ data: CommonOption[] }>({ url: '/ingredients', method: 'GET' }),
                    request<{ data: CommonOption[] }>({ url: '/menu', method: 'GET' }),
                    request<CommonOption[]>({ url: '/users', method: 'GET' })
                ]);

                setIngredients(ingRes.data.data);
                setMenuItems(menuRes.data.data);
                setUsers(userRes.data); // users might be direct array depending on controller
            } catch (error) {
                console.error('Failed to load filter options', error);
            }
        };
        fetchOptions();
    }, [request]);

    const handleFilterChange = (key: keyof StockLogFilterState, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
    };

    const clearFilters = () => {
        const reset = {
            start_date: today,
            end_date: today,
            ingredient_id: 'all',
            menu_item_id: 'all',
            movement_type: 'all',
            user_id: 'all'
        };
        setFilters(reset);
        onFilterChange(reset);
    };

    const applyFilters = () => {
        onFilterChange(filters);
    };

    const hasActiveFilters =
        filters.start_date !== today ||
        filters.end_date !== today ||
        filters.ingredient_id !== 'all' ||
        filters.menu_item_id !== 'all' ||
        filters.movement_type !== 'all' ||
        filters.user_id !== 'all';

    return (
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-medium text-cream">
                    <Filter className="w-4 h-4 text-primary" />
                    Filter Logs
                </div>
                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs text-muted-foreground hover:text-foreground">
                            <X className="w-3 h-3 mr-1" /> Clear All
                        </Button>
                    )}
                    <Button variant="default" size="sm" onClick={applyFilters} className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
                        Apply Filters
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Date Filters */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Start Date</label>
                    <input
                        type="date"
                        value={filters.start_date}
                        className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        onChange={(e) => handleFilterChange('start_date', e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">End Date</label>
                    <input
                        type="date"
                        value={filters.end_date}
                        className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        onChange={(e) => handleFilterChange('end_date', e.target.value)}
                    />
                </div>

                {/* Dropdowns */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Ingredient</label>
                    <Select value={filters.ingredient_id} onValueChange={(val) => handleFilterChange('ingredient_id', val)}>
                        <SelectTrigger className="bg-background/50 border-input h-9">
                            <SelectValue placeholder="All Ingredients" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Ingredients</SelectItem>
                            {ingredients.map(ing => (
                                <SelectItem key={ing.id} value={ing.id.toString()}>{ing.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Menu Item</label>
                    <Select value={filters.menu_item_id} onValueChange={(val) => handleFilterChange('menu_item_id', val)}>
                        <SelectTrigger className="bg-background/50 border-input h-9">
                            <SelectValue placeholder="All Menu Items" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Menu Items</SelectItem>
                            {menuItems.map(item => (
                                <SelectItem key={item.id} value={item.id.toString()}>{item.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Type</label>
                    <Select value={filters.movement_type} onValueChange={(val) => handleFilterChange('movement_type', val)}>
                        <SelectTrigger className="bg-background/50 border-input h-9">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="in">Stock In (+)</SelectItem>
                            <SelectItem value="out">Stock Out (-)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Waiter / User</label>
                    <Select value={filters.user_id} onValueChange={(val) => handleFilterChange('user_id', val)}>
                        <SelectTrigger className="bg-background/50 border-input h-9">
                            <SelectValue placeholder="All Users" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            {Array.isArray(users) && users.map(u => (
                                <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
