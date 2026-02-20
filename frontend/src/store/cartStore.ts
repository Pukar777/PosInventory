import { create } from 'zustand'

export interface CartItem {
    menu_item_id: number
    name: string
    price: number
    quantity: number
    custom_note?: string
    image?: string | null
}

interface CartStore {
    items: CartItem[]
    tableId: number | null
    setTable: (id: number | null) => void
    addItem: (item: Omit<CartItem, 'quantity'>) => void
    removeItem: (menu_item_id: number) => void
    updateQuantity: (menu_item_id: number, quantity: number) => void
    updateNote: (menu_item_id: number, note: string) => void
    clearCart: () => void
    total: () => number
    itemCount: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],
    tableId: null,

    setTable: (id) => set({ tableId: id }),

    addItem: (item) => {
        set((state) => {
            const existing = state.items.find((i) => i.menu_item_id === item.menu_item_id)
            if (existing) {
                return {
                    items: state.items.map((i) =>
                        i.menu_item_id === item.menu_item_id
                            ? { ...i, quantity: i.quantity + 1 }
                            : i
                    ),
                }
            }
            return { items: [...state.items, { ...item, quantity: 1 }] }
        })
    },

    removeItem: (menu_item_id) =>
        set((state) => ({
            items: state.items.filter((i) => i.menu_item_id !== menu_item_id),
        })),

    updateQuantity: (menu_item_id, quantity) => {
        if (quantity <= 0) {
            get().removeItem(menu_item_id)
            return
        }
        set((state) => ({
            items: state.items.map((i) =>
                i.menu_item_id === menu_item_id ? { ...i, quantity } : i
            ),
        }))
    },

    updateNote: (menu_item_id, note) =>
        set((state) => ({
            items: state.items.map((i) =>
                i.menu_item_id === menu_item_id ? { ...i, custom_note: note } : i
            ),
        })),

    clearCart: () => set({ items: [], tableId: null }),

    total: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

    itemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
}))
