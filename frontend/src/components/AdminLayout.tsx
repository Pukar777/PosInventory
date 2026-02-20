import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { LogOut, Package, Beaker, MenuSquare, LayoutDashboard, Menu, X, UtensilsCrossed, ClipboardList } from 'lucide-react'

export default function AdminLayout() {
    const { user, logout } = useAuth()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const closeMobileMenu = () => setIsMobileMenuOpen(false)

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden relative">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-20 md:hidden"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-64 flex flex-col border-r border-border/50 bg-card/95 md:bg-card/50 backdrop-blur-xl z-30 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-border/50">
                    <span
                        className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-amber-200 drop-shadow-md"
                        style={{ fontFamily: "'Dancing Script', 'Pacifico', cursive" }}
                    >
                        {import.meta.env.VITE_APP_NAME || 'Digital Waiter!'}
                    </span>
                    <button
                        className="md:hidden p-1 text-muted-foreground hover:text-foreground"
                        onClick={closeMobileMenu}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    <NavLink to="/" end onClick={closeMobileMenu} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors group ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'}`}>
                        {({ isActive }) => (
                            <>
                                <LayoutDashboard className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'}`} />
                                Dashboard
                            </>
                        )}
                    </NavLink>
                    <div className="pt-4 pb-2">
                        <p className="px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Inventory</p>
                    </div>
                    <NavLink to="/admin/categories" onClick={closeMobileMenu} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors group ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'}`}>
                        {({ isActive }) => (
                            <>
                                <Package className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'}`} />
                                Categories
                            </>
                        )}
                    </NavLink>
                    <NavLink to="/admin/ingredients" onClick={closeMobileMenu} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors group ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'}`}>
                        {({ isActive }) => (
                            <>
                                <Beaker className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'}`} />
                                Ingredients
                            </>
                        )}
                    </NavLink>
                    <NavLink to="/admin/menu-items" onClick={closeMobileMenu} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors group ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'}`}>
                        {({ isActive }) => (
                            <>
                                <MenuSquare className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'}`} />
                                Menu Items
                            </>
                        )}
                    </NavLink>
                    <div className="pt-4 pb-2">
                        <p className="px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Orders</p>
                    </div>
                    <NavLink to="/new-order" onClick={closeMobileMenu} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors group ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'}`}>
                        {({ isActive }) => (
                            <>
                                <UtensilsCrossed className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'}`} />
                                New Order
                            </>
                        )}
                    </NavLink>
                    <NavLink to="/admin/orders" onClick={closeMobileMenu} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors group ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'}`}>
                        {({ isActive }) => (
                            <>
                                <ClipboardList className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'}`} />
                                All Orders
                            </>
                        )}
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-border/50">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">{user?.name}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[140px]">{user?.email}</span>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-md text-sm font-medium transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
                {/* Ambient background for main area */}
                <div className="absolute top-[-20%] right-[-10%] w-[50rem] h-[50rem] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="h-16 flex items-center px-4 md:px-8 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-10 shadow-sm shrink-0">
                    <button
                        className="md:hidden mr-4 p-2 text-muted-foreground hover:text-foreground"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    {/* Can add breadcrumbs or top right actions here later */}
                    <span className="md:hidden font-bold tracking-tight text-foreground">
                        {import.meta.env.VITE_APP_NAME || 'Digital Waiter!'}
                    </span>
                </div>

                <div className="flex-1 overflow-auto px-4 md:px-8 pb-8" id="page-scroll-container">
                    <div className="w-full min-h-full flex flex-col">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    )
}
