import { useState, useEffect, useRef, useCallback } from 'react'
import { ShoppingCart, Plus, Minus, Trash2, ChefHat, CheckCircle2, X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { useApi } from '@/hooks/useApi'
import { useCartStore } from '@/store/cartStore'
import { toast } from 'sonner'

interface MenuItem {
    id: number
    name: string
    price: number
    image: string | null
    is_available: boolean
    category: { id: number; name: string }
}

interface Category {
    id: number
    name: string
}

interface RestaurantTable {
    id: number
    number: number
    status: 'available' | 'occupied'
}

// Scroll the nearest overflow-auto ancestor
function getScrollContainer(el: HTMLElement | null): HTMLElement | null {
    let node = el?.parentElement ?? null
    while (node) {
        const style = getComputedStyle(node)
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') return node
        node = node.parentElement
    }
    return document.documentElement
}

export default function NewOrderPage() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [tables, setTables] = useState<RestaurantTable[]>([])
    const [activeCategory, setActiveCategory] = useState<number | null>(null)
    const [search, setSearch] = useState('')
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isTableDialogOpen, setIsTableDialogOpen] = useState(false)
    const [isPlacing, setIsPlacing] = useState(false)
    const [orderSuccess, setOrderSuccess] = useState(false)

    const rootRef = useRef<HTMLDivElement>(null)
    const stickyHeaderRef = useRef<HTMLDivElement>(null)
    const categoryTagsRef = useRef<HTMLDivElement>(null)
    const isUserClickingRef = useRef(false)
    const observerRef = useRef<IntersectionObserver | null>(null)

    const { request } = useApi()
    const { items, tableId, setTable, addItem, removeItem, updateQuantity, updateNote, clearCart, total, itemCount } = useCartStore()

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        try {
            const [menuRes, catRes, tablesRes] = await Promise.all([
                request<MenuItem[]>({ url: '/menu', method: 'GET' }),
                request<Category[]>({ url: '/categories', method: 'GET' }),
                request<RestaurantTable[]>({ url: '/tables', method: 'GET' }),
            ])
            setMenuItems(menuRes.data)
            setCategories(catRes.data)
            setTables(tablesRes.data)
        } catch {
            toast.error('Failed to load menu data')
        }
    }

    const selectedTable = tables.find((t) => t.id === tableId)

    const searchFilteredItems = menuItems.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) && item.is_available
    )

    const visibleCategories = categories.filter(cat =>
        searchFilteredItems.some(item => item.category?.id === cat.id)
    )

    // ─── IntersectionObserver: auto-highlight active tag while scrolling ─────
    const setupObserver = useCallback(() => {
        if (observerRef.current) observerRef.current.disconnect()

        const scrollContainer = getScrollContainer(rootRef.current)
        const headerEl = stickyHeaderRef.current
        if (!scrollContainer || !headerEl) return

        const headerH = headerEl.offsetHeight
        const margin = `-${headerH + 4}px 0px -55% 0px`

        observerRef.current = new IntersectionObserver((entries) => {
            if (isUserClickingRef.current) return
            // Pick the first entry that is entering the viewport
            const intersecting = entries.filter(e => e.isIntersecting)
            if (intersecting.length === 0) return
            // Use the topmost one
            intersecting.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
            const topEntry = intersecting[0]
            const rawId = topEntry.target.getAttribute('data-category-id')
            const catId = rawId === null || rawId === 'null' ? null : Number(rawId)
            setActiveCategory(catId)

            // Scroll tag into view horizontally
            if (categoryTagsRef.current) {
                const tagEl = categoryTagsRef.current.querySelector(
                    `[data-tag-id="${rawId ?? 'null'}"]`
                ) as HTMLElement | null
                tagEl?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
            }
        }, {
            root: scrollContainer === document.documentElement ? null : scrollContainer,
            rootMargin: margin,
            threshold: 0,
        })

        const sections = document.querySelectorAll('[data-category-id]')
        sections.forEach(el => observerRef.current!.observe(el))
    }, [])

    useEffect(() => {
        // Small delay so DOM has rendered sections
        const id = setTimeout(setupObserver, 100)
        return () => clearTimeout(id)
    }, [searchFilteredItems, categories, setupObserver])

    useEffect(() => () => observerRef.current?.disconnect(), [])

    const scrollToCategory = useCallback((categoryId: number | null) => {
        setActiveCategory(categoryId)
        isUserClickingRef.current = true

        const scrollContainer = getScrollContainer(rootRef.current)
        const headerEl = stickyHeaderRef.current
        if (!scrollContainer) return

        if (categoryId === null) {
            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
            const section = document.querySelector(`[data-category-id="${categoryId}"]`) as HTMLElement | null
            if (section && scrollContainer) {
                const containerRect = scrollContainer.getBoundingClientRect()
                const sectionRect = section.getBoundingClientRect()
                const headerH = headerEl?.offsetHeight ?? 0
                const offset = sectionRect.top - containerRect.top + scrollContainer.scrollTop - headerH - 12
                scrollContainer.scrollTo({ top: offset, behavior: 'smooth' })
            }
        }

        setTimeout(() => { isUserClickingRef.current = false }, 800)
    }, [])

    const getCartQty = (id: number) =>
        items.find((i) => i.menu_item_id === id)?.quantity ?? 0

    const handlePlaceOrder = async () => {
        if (!tableId) { setIsTableDialogOpen(true); return }
        if (items.length === 0) { toast.error('Cart is empty!'); return }
        setIsPlacing(true)
        try {
            await request({
                url: '/orders',
                method: 'POST',
                data: {
                    table_id: tableId,
                    items: items.map((i) => ({
                        menu_item_id: i.menu_item_id,
                        quantity: i.quantity,
                        custom_note: i.custom_note,
                    })),
                },
            })
            setOrderSuccess(true)
            clearCart()
            setIsCartOpen(false)
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to place order')
        } finally {
            setIsPlacing(false)
        }
    }

    // ─── Menu Item Card (extracted to avoid re-defining inline) ─────────────
    const MenuCard = ({ item }: { item: MenuItem }) => {
        const qty = getCartQty(item.id)
        return (
            <div
                className={`group relative rounded-xl border bg-card/60 backdrop-blur-sm overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-lg hover:border-primary/40 hover:scale-[1.02] ${qty > 0 ? 'border-primary/50 shadow-primary/10 shadow-md' : 'border-border/50'}`}
                onClick={() => addItem({ menu_item_id: item.id, name: item.name, price: item.price, image: item.image })}
            >
                <div className="aspect-square bg-muted/30 overflow-hidden">
                    {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ChefHat className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                    )}
                </div>
                <div className="p-3">
                    <p className="font-semibold text-sm leading-tight line-clamp-2">{item.name}</p>
                    <p className="text-primary font-bold mt-1">Rs. {Number(item.price).toFixed(2)}</p>
                </div>
                {qty > 0 && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                        {qty}
                    </div>
                )}
            </div>
        )
    }

    if (orderSuccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="rounded-full bg-green-500/20 p-6 border border-green-500/30">
                    <CheckCircle2 className="w-16 h-16 text-green-400" />
                </div>
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-green-400 mb-2">Order Placed!</h2>
                    <p className="text-muted-foreground">Table {selectedTable?.number} — Kitchen has been notified.</p>
                </div>
                <Button onClick={() => setOrderSuccess(false)} size="lg" className="gap-2">
                    <Plus className="w-4 h-4" /> New Order
                </Button>
            </div>
        )
    }

    return (
        <div ref={rootRef} className="relative">
            {/* ── STICKY HEADER ──────────────────────────────────────────────
                sticky top-0 sticks to the nearest overflow-auto ancestor (the
                AdminLayout content wrapper). Negative mx/mt pulls it to the
                edges of the padded container so it spans full width. px/pt
                compensates with the same padding values so content is correct.
            ─────────────────────────────────────────────────────────────────── */}
            <div
                ref={stickyHeaderRef}
                className="sticky top-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 pt-4 md:pt-6 pb-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50"
            >
                {/* Title row */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-3">
                    <div>
                        <h1 className="text-2xl font-bold font-mono tracking-tight text-primary leading-none">New Order</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {selectedTable
                                ? <span className="text-primary font-medium">Table {selectedTable.number} selected</span>
                                : <button onClick={() => setIsTableDialogOpen(true)} className="text-amber-400 hover:text-amber-300 underline underline-offset-2">Select a table to begin</button>
                            }
                        </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => setIsTableDialogOpen(true)}>
                            {selectedTable ? `Table ${selectedTable.number}` : 'Select Table'}
                        </Button>
                        <Button size="sm" onClick={() => setIsCartOpen(true)} className="gap-2 relative">
                            <ShoppingCart className="w-4 h-4" />
                            Cart
                            {itemCount() > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {itemCount()}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Search + Category tags row */}
                <div className="flex items-center gap-3">
                    <div className="relative w-52 shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            className="pl-9 h-9"
                            placeholder="Search menu..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Horizontally scrollable category tabs */}
                    <div
                        ref={categoryTagsRef}
                        className="flex gap-2 overflow-x-auto pb-2 flex-1"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <Button
                            data-tag-id="null"
                            variant={activeCategory === null ? 'default' : 'outline'}
                            size="sm"
                            className="shrink-0"
                            onClick={() => scrollToCategory(null)}
                        >
                            All
                        </Button>
                        {visibleCategories.map((cat) => (
                            <Button
                                key={cat.id}
                                data-tag-id={`${cat.id}`}
                                variant={activeCategory === cat.id ? 'default' : 'outline'}
                                size="sm"
                                className="shrink-0"
                                onClick={() => scrollToCategory(cat.id)}
                            >
                                {cat.name}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── MENU SECTIONS ──────────────────────────────────────────────── */}
            <div className="space-y-8 mt-6 pb-20">
                {searchFilteredItems.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No items found.</p>
                    </div>
                ) : (
                    <>
                        {categories.map(cat => {
                            const catItems = searchFilteredItems.filter(item => item.category?.id === cat.id)
                            if (catItems.length === 0) return null
                            return (
                                <div key={cat.id} data-category-id={`${cat.id}`} className="space-y-4">
                                    <h2 className="text-xl font-bold flex items-center gap-2 text-foreground/90">
                                        {cat.name}
                                        <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{catItems.length}</span>
                                    </h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                        {catItems.map((item) => <MenuCard key={item.id} item={item} />)}
                                    </div>
                                </div>
                            )
                        })}

                        {(() => {
                            const uncatItems = searchFilteredItems.filter(item => !item.category || !categories.some(c => c.id === item.category.id))
                            if (uncatItems.length === 0) return null
                            return (
                                <div data-category-id="uncategorized" className="space-y-4">
                                    <h2 className="text-xl font-bold flex items-center gap-2 text-foreground/90">
                                        Uncategorized
                                        <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{uncatItems.length}</span>
                                    </h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                        {uncatItems.map((item) => <MenuCard key={item.id} item={item} />)}
                                    </div>
                                </div>
                            )
                        })()}
                    </>
                )}
            </div>

            {/* ── FLOATING CART BUTTON (mobile) ─────────────────────────────── */}
            {itemCount() > 0 && (
                <div className="fixed bottom-6 right-6 z-50 sm:hidden">
                    <Button onClick={() => setIsCartOpen(true)} size="lg" className="rounded-full gap-2 shadow-xl">
                        <ShoppingCart className="w-5 h-5" />
                        {itemCount()} items · Rs. {total().toFixed(2)}
                    </Button>
                </div>
            )}

            {/* ── TABLE SELECTION DIALOG ─────────────────────────────────────── */}
            <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Select Table</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 py-4">
                        {tables.map((table) => (
                            <button
                                key={table.id}
                                onClick={() => { setTable(table.id); setIsTableDialogOpen(false) }}
                                className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-1 font-bold text-lg transition-all
                                    ${tableId === table.id ? 'border-primary bg-primary/20 text-primary' : ''}
                                    ${table.status === 'occupied' && tableId !== table.id
                                        ? 'border-destructive/40 bg-destructive/10 text-destructive cursor-default opacity-60'
                                        : tableId !== table.id ? 'border-border/50 hover:border-primary/50 hover:bg-primary/10' : ''
                                    }`}
                            >
                                <span className="text-xl">🪑</span>
                                <span>{table.number}</span>
                                <span className="text-[10px] font-normal text-muted-foreground capitalize">{table.status}</span>
                            </button>
                        ))}
                        {tables.length === 0 && (
                            <p className="col-span-4 text-center text-muted-foreground py-4">
                                No tables configured yet. Ask an admin to add tables.
                            </p>
                        )}
                    </div>
                    {tableId && (
                        <DialogFooter>
                            <Button variant="ghost" size="sm" onClick={() => { setTable(null); setIsTableDialogOpen(false) }}>
                                Clear Selection
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>

            {/* ── CART DIALOG ────────────────────────────────────────────────── */}
            <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5" />
                            Cart
                            {selectedTable && <span className="text-sm font-normal text-muted-foreground">— Table {selectedTable.number}</span>}
                        </DialogTitle>
                    </DialogHeader>

                    {items.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
                            <ShoppingCart className="w-12 h-12 opacity-30" />
                            <p>Your cart is empty.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                            {items.map((item) => (
                                <div key={item.menu_item_id} className="rounded-lg border border-border/50 bg-card/50 p-3 space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{item.name}</p>
                                            <p className="text-primary text-sm">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}>
                                                <Minus className="w-3 h-3" />
                                            </Button>
                                            <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}>
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(item.menu_item_id)}>
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <Input
                                        placeholder="Special note (optional)"
                                        className="h-7 text-xs"
                                        value={item.custom_note || ''}
                                        onChange={(e) => updateNote(item.menu_item_id, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {items.length > 0 && (
                        <div className="border-t border-border/50 pt-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total</span>
                                <span className="text-xl font-bold text-primary">Rs. {total().toFixed(2)}</span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 gap-2" onClick={() => { clearCart(); setIsCartOpen(false) }}>
                                    <X className="w-4 h-4" /> Clear
                                </Button>
                                <Button className="flex-1 gap-2" onClick={handlePlaceOrder} disabled={isPlacing || !tableId}>
                                    {isPlacing ? 'Placing...' : !tableId ? 'Select Table First' : 'Place Order'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
