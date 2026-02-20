import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard, MonitorPlay, Package, Beaker, MenuSquare,
    BookText, UtensilsCrossed, ClipboardList, History, LogOut, ChefHat, X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface SidebarProps {
    isMobileMenuOpen: boolean;
    closeMobileMenu: () => void;
}

export function Sidebar({ isMobileMenuOpen, closeMobileMenu }: SidebarProps) {
    const { user, logout } = useAuth();

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors group ${isActive
            ? 'bg-primary/10 text-primary border border-primary/20'
            : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground border border-transparent'
        }`;

    const iconClass = (isActive: boolean) =>
        `w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'}`;

    return (
        <aside className={`fixed inset-y-0 left-0 w-64 flex flex-col border-r border-border/50 bg-card/95 md:bg-card/50 backdrop-blur-xl z-30 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
            <div className="p-6 pb-4 border-b border-border/50 flex justify-between items-center md:block">
                <div>
                    <div className="font-serif text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-amber-200 tracking-tight leading-tight">
                        Mise en Place
                    </div>
                    <div className="text-[11px] text-primary tracking-[0.2em] uppercase mt-1 font-medium">
                        Inventory System
                    </div>
                </div>
                <button
                    className="md:hidden p-1 text-muted-foreground hover:text-foreground"
                    onClick={closeMobileMenu}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
                <div className="mb-2 mt-4 px-3 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase first:mt-0">
                    Overview
                </div>
                <NavLink to="/overview/dashboard" onClick={closeMobileMenu} className={navLinkClass}>
                    {({ isActive }) => (
                        <>
                            <LayoutDashboard className={iconClass(isActive)} />
                            Dashboard
                        </>
                    )}
                </NavLink>
                <NavLink to="/dashboard-demo" onClick={closeMobileMenu} className={navLinkClass}>
                    {({ isActive }) => (
                        <>
                            <MonitorPlay className={iconClass(isActive)} />
                            Demo Dashboard
                        </>
                    )}
                </NavLink>
                <NavLink to="/inventory-demo" onClick={closeMobileMenu} className={navLinkClass}>
                    {({ isActive }) => (
                        <>
                            <MonitorPlay className={iconClass(isActive)} />
                            Demo Inventory
                        </>
                    )}
                </NavLink>

                <div className="mb-2 mt-6 px-3 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                    Management
                </div>
                <NavLink to="/management/categories" onClick={closeMobileMenu} className={navLinkClass}>
                    {({ isActive }) => (
                        <>
                            <Package className={iconClass(isActive)} />
                            Categories
                        </>
                    )}
                </NavLink>
                <NavLink to="/management/menu-items" onClick={closeMobileMenu} className={navLinkClass}>
                    {({ isActive }) => (
                        <>
                            <MenuSquare className={iconClass(isActive)} />
                            Menu Items
                        </>
                    )}
                </NavLink>
                <NavLink to="/management/ingredients" onClick={closeMobileMenu} className={navLinkClass}>
                    {({ isActive }) => (
                        <>
                            <Beaker className={iconClass(isActive)} />
                            <span className="flex-1">Ingredients</span>
                            <Badge variant="destructive" className="ml-auto text-[10px] h-5 px-1.5 font-mono rounded-full leading-none flex items-center justify-center">3</Badge>
                        </>
                    )}
                </NavLink>
                <NavLink to="/management/recipes" onClick={closeMobileMenu} className={navLinkClass}>
                    {({ isActive }) => (
                        <>
                            <BookText className={iconClass(isActive)} />
                            Recipes
                        </>
                    )}
                </NavLink>

                <div className="mb-2 mt-6 px-3 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                    Operations
                </div>
                <NavLink to="/operations/new-order" onClick={closeMobileMenu} className={navLinkClass}>
                    {({ isActive }) => (
                        <>
                            <UtensilsCrossed className={iconClass(isActive)} />
                            New Order
                        </>
                    )}
                </NavLink>
                <NavLink to="/operations/orders" onClick={closeMobileMenu} className={navLinkClass}>
                    {({ isActive }) => (
                        <>
                            <ClipboardList className={iconClass(isActive)} />
                            All Orders
                        </>
                    )}
                </NavLink>
                <NavLink to="/operations/stock-log" onClick={closeMobileMenu} className={navLinkClass}>
                    {({ isActive }) => (
                        <>
                            <History className={iconClass(isActive)} />
                            Stock Log
                        </>
                    )}
                </NavLink>
            </nav>

            <div className="p-4 border-t border-border/50">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <Avatar className="h-8 w-8 bg-primary/10 border border-primary/30 text-primary flex items-center justify-center overflow-hidden">
                        <AvatarFallback className="bg-transparent text-primary"><ChefHat className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{user?.name || 'Admin'}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[140px]">{user?.email || 'Kitchen Manager'}</span>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-md text-sm font-medium transition-colors border border-transparent hover:border-destructive/20"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
