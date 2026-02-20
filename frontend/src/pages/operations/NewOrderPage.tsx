import { useState, useEffect, useRef, useCallback } from 'react'
import { ChefHat, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useApi } from '@/hooks/useApi'
import { useSettingsStore } from '@/store/settingsStore'
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
    const [activeCategory, setActiveCategory] = useState<number | null>(null)
    const [search, setSearch] = useState('')

    const rootRef = useRef<HTMLDivElement>(null)
    const stickyHeaderRef = useRef<HTMLDivElement>(null)
    const categoryTagsRef = useRef<HTMLDivElement>(null)
    const isUserClickingRef = useRef(false)
    const observerRef = useRef<IntersectionObserver | null>(null)

    const { request } = useApi()
    const { getSettingValue } = useSettingsStore()
    const currency = getSettingValue('currency_symbol', '$')

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        try {
            const [menuRes, catRes] = await Promise.all([
                request<any>({ url: '/menu', method: 'GET' }),
                request<any>({ url: '/categories', method: 'GET' }),
            ])
            setMenuItems(menuRes.data.data || [])
            setCategories(catRes.data.data || [])
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
            <div className="group relative rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden transition-all duration-200 cursor-default hover:shadow-lg hover:border-primary/40 hover:scale-[1.02]">
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
                        <h1 className="text-2xl font-bold font-mono tracking-tight text-primary leading-none">Menu</h1>
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

        </div>
    )
}
