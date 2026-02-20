import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Utensils, Tag, FlaskConical, X } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useApi } from '@/hooks/useApi'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

// Types
interface Category {
    id: number
    name: string
}

interface Ingredient {
    id: number
    name: string
    unit: string
}

interface RecipeIngredient {
    id: number
    name: string
    unit: string
    pivot: { quantity_required: number }
}

interface MenuItem {
    id: number
    name: string
    price: string
    is_available: boolean
    category_id: number
    category: Category
    ingredients: RecipeIngredient[]
    created_at: string
}

// Schema
const menuItemSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    category_id: z.coerce.number().min(1, 'Please select a category'),
    price: z.coerce.number().min(0, 'Price cannot be negative'),
    is_available: z.boolean().default(true),
})

type MenuItemFormValues = z.infer<typeof menuItemSchema>

interface RecipeEntry {
    id: number
    quantity: number
}

export default function MenuItemsPage() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [ingredients, setIngredients] = useState<Ingredient[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState<number | null>(null)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [recipe, setRecipe] = useState<RecipeEntry[]>([])
    const [recipeIngId, setRecipeIngId] = useState<string>('')
    const [recipeQty, setRecipeQty] = useState<string>('')

    const form = useForm<MenuItemFormValues>({
        resolver: zodResolver(menuItemSchema),
        defaultValues: { name: '', category_id: 0, price: 0, is_available: true },
    })

    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, watch, setValue } = form
    const isAvailable = watch('is_available')

    const { request } = useApi()

    const fetchAll = async () => {
        try {
            setIsLoading(true)
            const [itemsRes, catsRes, ingsRes] = await Promise.all([
                request<MenuItem[]>({ url: '/menu-items', method: 'GET' }),
                request<Category[]>({ url: '/categories', method: 'GET' }),
                request<Ingredient[]>({ url: '/ingredients', method: 'GET' }),
            ])
            setMenuItems(itemsRes.data)
            setCategories(catsRes.data)
            setIngredients(ingsRes.data)
        } catch {
            toast.error('Failed to load menu items')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { fetchAll() }, [])

    const handleOpenDialog = (item?: MenuItem) => {
        if (item) {
            setEditingId(item.id)
            reset({
                name: item.name,
                category_id: item.category_id,
                price: parseFloat(item.price),
                is_available: item.is_available,
            })
            setRecipe(item.ingredients.map((ing) => ({
                id: ing.id,
                quantity: ing.pivot.quantity_required,
            })))
        } else {
            setEditingId(null)
            reset({ name: '', category_id: 0, price: 0, is_available: true })
            setRecipe([])
        }
        setRecipeIngId('')
        setRecipeQty('')
        setIsDialogOpen(true)
    }

    const addRecipeRow = () => {
        const id = parseInt(recipeIngId)
        const qty = parseFloat(recipeQty)
        if (!id || isNaN(qty) || qty <= 0) {
            toast.error('Select an ingredient and enter a valid quantity')
            return
        }
        if (recipe.some((r) => r.id === id)) {
            toast.error('This ingredient is already in the recipe')
            return
        }
        setRecipe((prev) => [...prev, { id, quantity: qty }])
        setRecipeIngId('')
        setRecipeQty('')
    }

    const removeRecipeRow = (id: number) => {
        setRecipe((prev) => prev.filter((r) => r.id !== id))
    }

    const getIngredientById = (id: number) => ingredients.find((i) => i.id === id)

    const onSubmit = async (data: MenuItemFormValues) => {
        try {
            const payload = {
                ...data,
                ingredients: recipe.map((r) => ({ id: r.id, quantity: r.quantity })),
            }
            if (editingId) {
                await request({ url: `/menu-items/${editingId}`, method: 'PUT', data: payload })
                toast.success('Menu item updated successfully')
            } else {
                await request({ url: '/menu-items', method: 'POST', data: payload })
                toast.success('Menu item created successfully')
            }
            setIsDialogOpen(false)
            fetchAll()
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Action failed'
            form.setError('root', { message: msg })
            toast.error(msg)
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this menu item?')) return
        setIsDeleting(id)
        try {
            await request({ url: `/menu-items/${id}`, method: 'DELETE' })
            toast.success('Menu item deleted')
            fetchAll()
        } catch {
            toast.error('Failed to delete menu item')
        } finally {
            setIsDeleting(null)
        }
    }

    return (
        <div className="space-y-6 pt-4 md:pt-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-mono tracking-tight text-primary">Menu Items</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Manage your dishes, prices, and ingredient recipes.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="gap-2 sm:w-auto w-full">
                    <Plus className="w-4 h-4" />
                    Add Menu Item
                </Button>
            </div>

            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden shadow-sm overflow-x-auto">
                <Table className="min-w-[700px]">
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[60px]">ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead>Ingredients</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <Utensils className="w-8 h-8 opacity-40 animate-pulse" />
                                        Loading menu items...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : menuItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <Utensils className="w-8 h-8 opacity-40" />
                                        No menu items yet. Add one to get started.
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            menuItems.map((item) => (
                                <TableRow key={item.id} className="group">
                                    <TableCell className="font-mono text-muted-foreground">{item.id}</TableCell>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-secondary text-secondary-foreground">
                                            <Tag className="w-3 h-3" />
                                            {item.category?.name ?? 'N/A'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-semibold text-primary">
                                        Rs {parseFloat(item.price).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {item.ingredients.length === 0 ? (
                                                <span className="text-xs text-muted-foreground">none</span>
                                            ) : (
                                                item.ingredients.slice(0, 3).map((ing) => (
                                                    <span
                                                        key={ing.id}
                                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-accent/50 text-accent-foreground"
                                                    >
                                                        <FlaskConical className="w-2.5 h-2.5" />
                                                        {ing.name}
                                                    </span>
                                                ))
                                            )}
                                            {item.ingredients.length > 3 && (
                                                <span className="text-xs text-muted-foreground">
                                                    +{item.ingredients.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${item.is_available
                                            ? 'bg-green-500/15 text-green-500'
                                            : 'bg-muted text-muted-foreground'
                                            }`}>
                                            {item.is_available ? 'Available' : 'Unavailable'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                                                <Edit2 className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(item.id)}
                                                disabled={isDeleting === item.id}
                                            >
                                                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add / Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
                            <DialogDescription>
                                {editingId
                                    ? "Update this dish's details and recipe."
                                    : 'Add a new dish to your menu with pricing and ingredients.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            {/* Name */}
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="mi-name" className="text-right mt-3">Name</Label>
                                <div className="col-span-3 space-y-1">
                                    <Input
                                        id="mi-name"
                                        {...register('name')}
                                        placeholder="e.g. Grilled Chicken, Pasta Primavera"
                                        autoFocus
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                                </div>
                            </div>

                            {/* Category */}
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="mi-category" className="text-right mt-3">Category</Label>
                                <div className="col-span-3 space-y-1">
                                    <select
                                        id="mi-category"
                                        {...register('category_id')}
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value={0}>Select a category...</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {errors.category_id && <p className="text-sm text-destructive">{errors.category_id.message}</p>}
                                </div>
                            </div>

                            {/* Price */}
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="mi-price" className="text-right mt-3">Price (Rs)</Label>
                                <div className="col-span-3 space-y-1">
                                    <Input
                                        id="mi-price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        {...register('price')}
                                        placeholder="0.00"
                                    />
                                    {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                                </div>
                            </div>

                            {/* Availability */}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Available</Label>
                                <div className="col-span-3 flex items-center gap-3">
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={isAvailable}
                                        onClick={() => setValue('is_available', !isAvailable)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isAvailable ? 'bg-primary' : 'bg-muted-foreground/30'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${isAvailable ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                    <span className="text-sm text-muted-foreground">
                                        {isAvailable ? 'Item will appear on the menu' : 'Item is hidden from the menu'}
                                    </span>
                                </div>
                            </div>

                            {/* Recipe / Ingredients */}
                            <div className="col-span-4">
                                <div className="border border-border/60 rounded-lg p-4 space-y-3 mt-1 bg-muted/20">
                                    <div className="flex items-center gap-2 mb-1">
                                        <FlaskConical className="w-4 h-4 text-primary" />
                                        <span className="font-semibold text-sm">Recipe Ingredients</span>
                                        <span className="text-xs text-muted-foreground">(optional)</span>
                                    </div>

                                    {recipe.length > 0 && (
                                        <div className="space-y-2">
                                            {recipe.map((row) => {
                                                const ing = getIngredientById(row.id)
                                                return (
                                                    <div key={row.id} className="flex items-center gap-2 bg-background/60 rounded-md px-3 py-2 text-sm">
                                                        <FlaskConical className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                        <span className="flex-1 font-medium">{ing?.name ?? `Ingredient #${row.id}`}</span>
                                                        <span className="font-mono text-xs text-muted-foreground">
                                                            {row.quantity} {ing?.unit}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRecipeRow(row.id)}
                                                            className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <select
                                            value={recipeIngId}
                                            onChange={(e) => setRecipeIngId(e.target.value)}
                                            className="flex-1 h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            <option value="">Select ingredient...</option>
                                            {ingredients
                                                .filter((ing) => !recipe.some((r) => r.id === ing.id))
                                                .map((ing) => (
                                                    <option key={ing.id} value={ing.id}>
                                                        {ing.name} ({ing.unit})
                                                    </option>
                                                ))}
                                        </select>
                                        <Input
                                            type="number"
                                            step="0.001"
                                            min="0.001"
                                            value={recipeQty}
                                            onChange={(e) => setRecipeQty(e.target.value)}
                                            placeholder="Qty"
                                            className="w-24"
                                        />
                                        <Button type="button" variant="outline" size="sm" onClick={addRecipeRow} className="gap-1 shrink-0">
                                            <Plus className="w-3.5 h-3.5" />
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {errors.root && (
                                <div className="text-destructive text-sm font-medium text-center">
                                    {errors.root.message}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Item'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
