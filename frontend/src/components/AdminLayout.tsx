import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { LogOut, Package, Beaker, MenuSquare, LayoutDashboard } from 'lucide-react'

export default function AdminLayout() {
    const { user, logout } = useAuth()

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden relative">
            {/* Sidebar */}
            <aside className="w-64 flex flex-col border-r border-border/50 bg-card/50 backdrop-blur-xl z-20">
                <div className="h-16 flex items-center px-6 border-b border-border/50">
                    <h2 className="text-xl font-bold font-mono text-primary tracking-tight">Crave<span className="text-foreground">POS</span></h2>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    <Link to="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors group">
                        <LayoutDashboard className="w-5 h-5 group-hover:text-primary transition-colors" />
                        Dashboard
                    </Link>
                    <div className="pt-4 pb-2">
                        <p className="px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Inventory</p>
                    </div>
                    <Link to="/admin/categories" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors group">
                        <Package className="w-5 h-5 group-hover:text-primary transition-colors" />
                        Categories
                    </Link>
                    <Link to="/admin/ingredients" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors group">
                        <Beaker className="w-5 h-5 group-hover:text-primary transition-colors" />
                        Ingredients
                    </Link>
                    <Link to="/admin/menu-items" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors group">
                        <MenuSquare className="w-5 h-5 group-hover:text-primary transition-colors" />
                        Menu Items
                    </Link>
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

                <div className="h-16 flex items-center px-8 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
                    {/* Can add breadcrumbs or top right actions here later */}
                </div>

                <div className="flex-1 overflow-auto p-8">
                    <div className="max-w-6xl mx-auto w-full">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    )
}
