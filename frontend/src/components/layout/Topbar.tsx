import { Menu, Search, Bell, Settings } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TopbarProps {
    setIsMobileMenuOpen: (open: boolean) => void;
}

export function Topbar({ setIsMobileMenuOpen }: TopbarProps) {
    const location = useLocation();

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('dashboard') && !path.includes('demo')) return <><span className="text-foreground font-semibold">Dashboard</span> <span className="text-primary italic">Overview</span></>;
        if (path.includes('categories')) return <><span className="text-foreground font-semibold">Categories</span> <span className="text-primary italic">Management</span></>;
        if (path.includes('menu-items') || path === '/menu') return <><span className="text-foreground font-semibold">Menu Items</span> <span className="text-primary italic">Management</span></>;
        if (path.includes('ingredients')) return <><span className="text-foreground font-semibold">Ingredients</span> <span className="text-primary italic">Management</span></>;
        if (path.includes('recipes')) return <><span className="text-foreground font-semibold">Recipes</span> <span className="text-primary italic">Management</span></>;
        if (path.includes('new-order')) return <><span className="text-foreground font-semibold">New Order</span> <span className="text-primary italic">Operations</span></>;
        if (path.includes('orders')) return <><span className="text-foreground font-semibold">Orders</span> <span className="text-primary italic">Operations</span></>;
        if (path.includes('stock-log')) return <><span className="text-foreground font-semibold">Stock Log</span> <span className="text-primary italic">Operations</span></>;
        if (path.includes('dashboard-demo')) return <><span className="text-foreground font-semibold">Demo Dashboard</span> <span className="text-primary italic">Overview</span></>;
        if (path.includes('inventory-demo')) return <><span className="text-foreground font-semibold">Demo Inventory</span> <span className="text-primary italic">Overview</span></>;
        return <><span className="text-foreground font-semibold">Mise en Place</span> <span className="text-primary italic">System</span></>;
    };

    return (
        <div className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-10 shadow-sm shrink-0">
            <div className="flex items-center gap-4">
                <button
                    className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="hidden md:block font-serif text-[22px] tracking-tight">
                    {getPageTitle()}
                </div>
                <span className="md:hidden font-serif font-bold tracking-tight text-foreground text-lg">
                    {import.meta.env.VITE_APP_NAME || 'Mise en Place'}
                </span>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden sm:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search anything..."
                        className="w-[200px] md:w-[260px] pl-9 bg-accent/50 border-border/50 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-colors h-9"
                    />
                </div>
                <Button variant="outline" size="icon" className="h-9 w-9 bg-accent/50 border-border/50 hover:border-primary/50 hover:text-primary transition-colors shrink-0">
                    <Bell className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9 bg-accent/50 border-border/50 hover:border-primary/50 hover:text-primary transition-colors shrink-0">
                    <Settings className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
