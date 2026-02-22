import { useState, useEffect, useRef, useCallback } from 'react'
import { ChefHat, Search, Plus, Minus, Trash2, UtensilsCrossed, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useApi } from '@/hooks/useApi'
import { useSettingsStore } from '@/store/settingsStore'
import { useCartStore } from '@/store/cartStore'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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

interface Table {
    id: number
    number: number
    status: 'available' | 'occupied' | 'reserved'
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
    const [tables, setTables] = useState<Table[]>([])
    const [activeCategory, setActiveCategory] = useState<number | null>(null)
    const [search, setSearch] = useState('')
    const [isTableModalOpen, setIsTableModalOpen] = useState(false)

    const rootRef = useRef<HTMLDivElement>(null)
    const stickyHeaderRef = useRef<HTMLDivElement>(null)
    const categoryTagsRef = useRef<HTMLDivElement>(null)
    const isUserClickingRef = useRef(false)
    const observerRef = useRef<IntersectionObserver | null>(null)

    const { request } = useApi()
    const { getSettingValue } = useSettingsStore()
    const currency = getSettingValue('currency_symbol', '$')

    const { items, addItem, removeItem, updateQuantity, total, tableId, setTable, clearCart } = useCartStore()
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => { fetchData() }, [])

    const handlePlaceOrder = async () => {
        if (!tableId || items.length === 0) return

        setIsSubmitting(true)
        try {
            const payload = {
                table_id: tableId,
                items: items.map(item => ({
                    menu_item_id: item.menu_item_id,
                    quantity: item.quantity,
                    custom_note: item.custom_note
                }))
            }

            await request<any>({ url: '/orders', method: 'POST', data: payload })
            toast.success('Order placed successfully!')
            clearCart()
            fetchData() // to refresh tables status
        } catch (error) {
            toast.error('Failed to place order.')
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const fetchData = async () => {
        try {
            const [menuRes, catRes, tablesRes] = await Promise.all([
                request<any>({ url: '/menu', method: 'GET' }),
                request<any>({ url: '/categories', method: 'GET' }),
                request<any>({ url: '/tables', method: 'GET' }),
            ])
            setMenuItems(menuRes.data.data || [])
            setCategories(catRes.data.data || [])
            setTables(tablesRes.data.data || [])
        } catch {
            toast.error('Failed to load menu data')
        }
    }

    const searchFilteredItems = menuItems.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) && item.is_available
    )

    const visibleCategories = categories.filter(cat =>
        searchFilteredItems.some(item => item.category?.id === cat.id)
    )

    const currentTable = tables.find(t => t.id === tableId)

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

    // ─── Menu Item Card (extracted to avoid re-defining inline) ─────────────
    const MenuCard = ({ item }: { item: MenuItem }) => {
        return (
            <div
                onClick={() => addItem({ menu_item_id: item.id, name: item.name, price: Number(item.price), image: item.image })}
                className="group relative rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-lg hover:border-primary/40 hover:scale-[1.02]"
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
                    <p className="text-primary font-bold mt-1">{currency}{Number(item.price).toFixed(2)}</p>
                </div>
            </div>
        )
    }

    return (
        <div ref={rootRef} className="relative">
            {/* ── STICKY HEADER ────────────────────────────────────────────── */}
            <div
                ref={stickyHeaderRef}
                className="sticky top-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 pt-4 md:pt-6 pb-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50"
            >
                {/* Title row */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-3">
                    <div>
                        <h1 className="text-2xl font-bold font-mono tracking-tight text-primary leading-none">Menu</h1>
                    </div>
                </div>

                {/* Search + Category tags column */}
                <div className="flex flex-col gap-4">
                    <div className="relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            className="pl-12 h-12 text-base shadow-sm"
                            placeholder="Search menu..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Horizontally scrollable category tabs */}
                    <div
                        ref={categoryTagsRef}
                        className="flex gap-2 overflow-x-auto w-full pb-2 -mb-2"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >

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

            {/* ── TWO COLUMN LAYOUT (Menu + Cart) ────────────────────────── */}
            <div className="flex flex-col xl:flex-row gap-6 mt-6 pb-20 items-start">
                {/* ── MENU SECTIONS ──────────────────────────────────────── */}
                <div className="flex-1 min-w-0 space-y-8 w-full">
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
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                            {uncatItems.map((item) => <MenuCard key={item.id} item={item} />)}
                                        </div>
                                    </div>
                                )
                            })()}
                        </>
                    )}
                </div>

                {/* ── CURRENT ORDER PANEL ────────────────────────────────── */}
                <div className="w-full xl:w-[340px] shrink-0 sticky top-[140px] z-20">
                    <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm flex flex-col max-h-[calc(100vh-160px)]">
                        <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
                            <h2 className="font-serif text-lg font-medium text-foreground">Current Order</h2>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            {items.length === 0 ? (
                                <div className="text-center text-muted-foreground italic py-10 px-4 text-sm">
                                    No items added yet.<br />Click menu items to add.
                                </div>
                            ) : (
                                <div className="px-3">
                                    {items.map(item => (
                                        <div key={item.menu_item_id} className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0 group">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-foreground truncate">{item.name}</p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <div className="flex items-center gap-px bg-muted/40 rounded border border-border/30">
                                                        <button
                                                            onClick={e => { e.stopPropagation(); updateQuantity(item.menu_item_id, item.quantity - 1) }}
                                                            className="w-7 h-7 flex items-center justify-center rounded-l hover:bg-muted/80 hover:text-primary transition-colors text-muted-foreground"
                                                        >
                                                            <Minus className="w-3.5 h-3.5" />
                                                        </button>
                                                        <div className="w-8 text-center text-xs font-mono font-medium bg-background/50 h-7 flex items-center justify-center">
                                                            {item.quantity}
                                                        </div>
                                                        <button
                                                            onClick={e => { e.stopPropagation(); updateQuantity(item.menu_item_id, item.quantity + 1) }}
                                                            className="w-7 h-7 flex items-center justify-center rounded-r hover:bg-muted/80 hover:text-primary transition-colors text-muted-foreground"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                <div className="w-16 text-right font-mono text-sm text-primary">
                                                    {currency}{(item.price * item.quantity).toFixed(2)}
                                                </div>
                                                <button
                                                    onClick={e => { e.stopPropagation(); removeItem(item.menu_item_id) }}
                                                    className="text-destructive/40 hover:text-destructive flex items-center justify-center w-7 h-7 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-border/50 bg-background/50">
                            <div className="flex items-center justify-between mb-4 px-1">
                                <span className="text-sm text-muted-foreground">Total Amount</span>
                                <span className="text-xl font-mono font-medium text-primary">{currency}{total().toFixed(2)}</span>
                            </div>

                            <Dialog open={isTableModalOpen} onOpenChange={setIsTableModalOpen}>
                                {items.length === 0 ? (
                                    <Button
                                        className="w-full text-primary-foreground font-medium shadow-sm"
                                        size="lg"
                                        disabled={true}
                                    >
                                        Place Order
                                    </Button>
                                ) : !tableId ? (
                                    <DialogTrigger asChild>
                                        <Button
                                            className="w-full text-primary-foreground font-medium shadow-sm hover:shadow-md transition-shadow"
                                            size="lg"
                                        >
                                            <UtensilsCrossed className="w-5 h-5 mr-2" />
                                            Select Table
                                        </Button>
                                    </DialogTrigger>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between bg-muted/50 p-2 rounded-lg border border-border/50">
                                            <div className="flex items-center gap-2 text-primary">
                                                <UtensilsCrossed className="w-4 h-4" />
                                                <span className="text-sm font-medium">Table {currentTable?.number}</span>
                                            </div>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-7 text-xs">Change</Button>
                                            </DialogTrigger>
                                        </div>
                                        <Button
                                            className="w-full font-medium shadow-sm hover:shadow-md transition-shadow bg-green-600 hover:bg-green-700 text-white"
                                            size="lg"
                                            disabled={isSubmitting}
                                            onClick={handlePlaceOrder}
                                        >
                                            {isSubmitting ? 'Placing Order...' : 'Place Order'}
                                        </Button>
                                    </div>
                                )}

                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle className="font-serif text-xl border-b pb-4 mb-2">Select a Table</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid grid-cols-2 gap-3 py-2 max-h-[60vh] overflow-y-auto px-1">
                                        {tables.map(table => (
                                            <button
                                                key={table.id}
                                                disabled={table.status !== 'available' && table.id !== tableId}
                                                onClick={() => {
                                                    setTable(table.id)
                                                    setIsTableModalOpen(false)
                                                }}
                                                className={cn(
                                                    "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
                                                    table.id === tableId
                                                        ? "border-primary bg-primary/10 shadow-sm"
                                                        : table.status !== 'available'
                                                            ? "border-muted bg-muted/30 opacity-60 cursor-not-allowed"
                                                            : "border-border/50 hover:border-primary/40 hover:bg-card hover:shadow-sm"
                                                )}
                                            >
                                                {/* Status indicator pip */}
                                                <div className={cn(
                                                    "absolute top-3 right-3 w-2.5 h-2.5 rounded-full shadow-sm",
                                                    table.status === 'available' ? "bg-green-500" :
                                                        table.status === 'occupied' ? "bg-red-500" : "bg-amber-500"
                                                )} />

                                                <UtensilsCrossed className={cn(
                                                    "w-8 h-8 mb-2",
                                                    table.id === tableId ? "text-primary" : "text-muted-foreground/60"
                                                )} />
                                                <span className="font-mono text-lg font-semibold leading-none">{table.number}</span>
                                            </button>
                                        ))}
                                        {tables.length === 0 && (
                                            <div className="col-span-2 text-center py-8 text-muted-foreground italic">
                                                No tables available.
                                            </div>
                                        )}
                                    </div>
                                    {tableId && (
                                        <div className="pt-4 mt-2 border-t flex justify-end">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => { setTable(null); setIsTableModalOpen(false) }}
                                                className="w-full sm:w-auto"
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                Clear Selection
                                            </Button>
                                        </div>
                                    )}
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

