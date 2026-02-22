import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { StockLogFilter } from '@/components/operations/StockLogFilter';
import type { StockLogFilterState } from '@/components/operations/StockLogFilter';

interface Ingredient {
    id: number;
    name: string;
    unit: string;
}

interface User {
    id: number;
    name: string;
}

interface Order {
    id: number;
}

interface StockMovement {
    id: number;
    ingredient_id: number;
    order_id: number | null;
    quantity_change: string;
    type: string;
    note: string | null;
    created_by: number | null;
    created_at: string;
    ingredient: Ingredient | null;
    order: Order | null;
    created_by_user: User | null;
}

interface PaginatedResponse {
    current_page: number;
    data: StockMovement[];
    last_page: number;
    total: number;
}

export default function StockLogPage() {
    const { request } = useApi();
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    // Store active filters
    const today = format(new Date(), 'yyyy-MM-dd');
    const [activeFilters, setActiveFilters] = useState<StockLogFilterState>({
        start_date: today,
        end_date: today,
        ingredient_id: 'all',
        menu_item_id: 'all',
        movement_type: 'all',
        user_id: 'all'
    });

    const fetchLogs = async (page: number, filters = activeFilters) => {
        setIsLoading(true);
        try {
            // Build query params
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('per_page', '20');

            if (filters.start_date) params.append('start_date', filters.start_date);
            if (filters.end_date) params.append('end_date', filters.end_date);
            if (filters.ingredient_id && filters.ingredient_id !== 'all') params.append('ingredient_id', filters.ingredient_id);
            if (filters.menu_item_id && filters.menu_item_id !== 'all') params.append('menu_item_id', filters.menu_item_id);
            if (filters.movement_type && filters.movement_type !== 'all') params.append('movement_type', filters.movement_type);
            if (filters.user_id && filters.user_id !== 'all') params.append('user_id', filters.user_id);

            const res = await request<PaginatedResponse>({ url: `/stock-movements?${params.toString()}`, method: 'GET' });
            // Note: PHP backend `createdBy` relation is returned as `created_by` in JSON depending on model setup,
            // we'll safely handle both `created_by` or `created_by_user` keys if needed.
            setMovements(res.data.data);
            setCurrentPage(res.data.current_page);
            setLastPage(res.data.last_page);
        } catch (error) {
            console.error('Failed to fetch stock logs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(currentPage, activeFilters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, activeFilters]);

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(p => p - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < lastPage) {
            setCurrentPage(p => p + 1);
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-2">
                <h1 className="font-serif text-2xl text-cream font-semibold flex-1">
                    Stock Movement <span className="text-primary italic">Log</span>
                </h1>
            </div>

            <StockLogFilter onFilterChange={(newFilters) => {
                setActiveFilters(newFilters);
                setCurrentPage(1);
            }} />

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
                    <CardTitle className="font-serif text-lg text-cream">Activity History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-12 text-muted-foreground">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" />
                            Loading logs...
                        </div>
                    ) : movements.length === 0 ? (
                        <div className="text-center p-12 text-muted-foreground italic text-sm">
                            No stock movements recorded yet.
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {movements.map((log) => {
                                const isPos = parseFloat(log.quantity_change) > 0;
                                const isDeduction = log.type === 'deduction' || parseFloat(log.quantity_change) < 0;
                                // PHP relation "createdBy" becomes "created_by" in json typically
                                const logData = log as unknown as Record<string, unknown>;
                                const user = logData.current_user || logData.created_by || log.created_by_user || logData.createdBy;
                                const userName = typeof user === 'object' && user ? (user as Record<string, string>).name : ((user as Record<string, string>)?.name || 'System');

                                let titleSuffix = '';
                                if (log.order_id) {
                                    titleSuffix = `Order #${log.order_id}`;
                                } else if (log.type === 'manual_add' || log.type === 'manual') {
                                    titleSuffix = 'Manual Stock In';
                                } else if (log.type === 'adjustment') {
                                    titleSuffix = 'Manual Adjustment';
                                } else {
                                    titleSuffix = log.type || 'Movement';
                                }

                                const qtyLabel = `${isPos ? '+' : ''}${parseFloat(log.quantity_change).toString()} ${log.ingredient?.unit || ''}`;

                                return (
                                    <div key={log.id} className="flex items-start gap-4 p-4 border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
                                        <div className="pt-1.5 shrink-0">
                                            <div className={`w-2.5 h-2.5 rounded-full ${isDeduction ? 'bg-destructive shadow-[0_0_6px_rgba(224,92,74,0.6)]' : 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[14px] text-foreground font-medium mb-1">
                                                {log.ingredient?.name || 'Unknown Ingredient'} <span className="text-muted-foreground font-normal">— {titleSuffix}</span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground font-mono">
                                                <span>{format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}</span>
                                                {userName && (
                                                    <>
                                                        <span className="text-border/50">•</span>
                                                        <span className="flex items-center gap-1">
                                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-sans">By</span> {userName}
                                                        </span>
                                                    </>
                                                )}
                                                {log.note && (
                                                    <>
                                                        <span className="text-border/50">•</span>
                                                        <span className="text-primary/70 italic font-sans px-1.5 py-0.5 bg-primary/5 rounded border border-primary/10">"{log.note}"</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`font-mono text-[14px] font-medium shrink-0 pt-0.5 ${isPos ? 'text-green-500' : 'text-destructive'}`}>
                                            {qtyLabel}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>

                {lastPage > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-border/50 bg-muted/10">
                        <div className="text-[12px] text-muted-foreground font-mono">
                            Page {currentPage} of {lastPage}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrevPage}
                                disabled={currentPage === 1 || isLoading}
                                className="h-8 px-3 border-border/50 hover:border-primary/50 hover:text-primary transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" /> Prev
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={currentPage === lastPage || isLoading}
                                className="h-8 px-3 border-border/50 hover:border-primary/50 hover:text-primary transition-colors"
                            >
                                Next <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
