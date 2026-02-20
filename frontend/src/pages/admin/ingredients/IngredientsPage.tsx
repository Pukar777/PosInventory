import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, AlertTriangle, PackageOpen } from 'lucide-react'
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

const UNIT_OPTIONS = ['kg', 'gram', 'piece', 'liter', 'ml'] as const
type Unit = typeof UNIT_OPTIONS[number]

const ingredientSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    unit: z.enum(UNIT_OPTIONS, { errorMap: () => ({ message: 'Please select a valid unit' }) }),
    current_stock: z.coerce.number().min(0, 'Stock cannot be negative').default(0),
    minimum_stock: z.coerce.number().min(0, 'Minimum stock cannot be negative').default(0),
})

type IngredientFormValues = z.infer<typeof ingredientSchema>

interface Ingredient {
    id: number
    name: string
    unit: Unit
    current_stock: number
    minimum_stock: number
    created_at: string
}

export default function IngredientsPage() {
    const [ingredients, setIngredients] = useState<Ingredient[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState<number | null>(null)
    const [editingId, setEditingId] = useState<number | null>(null)

    const form = useForm<IngredientFormValues>({
        resolver: zodResolver(ingredientSchema),
        defaultValues: { name: '', unit: 'kg', current_stock: 0, minimum_stock: 0 },
    })

    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setValue, watch } = form
    const selectedUnit = watch('unit')

    const { request } = useApi()

    const fetchIngredients = async () => {
        try {
            setIsLoading(true)
            const res = await request<Ingredient[]>({ url: '/ingredients', method: 'GET' })
            setIngredients(res.data)
        } catch {
            toast.error('Failed to load ingredients')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchIngredients()
    }, [])

    const handleOpenDialog = (ingredient?: Ingredient) => {
        if (ingredient) {
            setEditingId(ingredient.id)
            reset({
                name: ingredient.name,
                unit: ingredient.unit,
                current_stock: ingredient.current_stock,
                minimum_stock: ingredient.minimum_stock,
            })
        } else {
            setEditingId(null)
            reset({ name: '', unit: 'kg', current_stock: 0, minimum_stock: 0 })
        }
        setIsDialogOpen(true)
    }

    const onSubmit = async (data: IngredientFormValues) => {
        try {
            if (editingId) {
                await request({ url: `/ingredients/${editingId}`, method: 'PUT', data })
                toast.success('Ingredient updated successfully')
            } else {
                await request({ url: '/ingredients', method: 'POST', data })
                toast.success('Ingredient created successfully')
            }
            setIsDialogOpen(false)
            fetchIngredients()
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Action failed'
            form.setError('root', { message: msg })
            toast.error(msg)
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this ingredient?')) return
        setIsDeleting(id)
        try {
            await request({ url: `/ingredients/${id}`, method: 'DELETE' })
            toast.success('Ingredient deleted')
            fetchIngredients()
        } catch {
            toast.error('Failed to delete ingredient')
        } finally {
            setIsDeleting(null)
        }
    }

    const isLowStock = (ing: Ingredient) =>
        ing.minimum_stock > 0 && ing.current_stock <= ing.minimum_stock

    return (
        <div className="space-y-6 pt-4 md:pt-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-mono tracking-tight text-primary">Ingredients</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Manage raw ingredients and track stock levels.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="gap-2 sm:w-auto w-full">
                    <Plus className="w-4 h-4" />
                    Add Ingredient
                </Button>
            </div>

            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden shadow-sm overflow-x-auto">
                <Table className="min-w-[600px]">
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[60px]">ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead className="text-right">Current Stock</TableHead>
                            <TableHead className="text-right">Min. Stock</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <PackageOpen className="w-8 h-8 opacity-40 animate-pulse" />
                                        Loading ingredients...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : ingredients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <PackageOpen className="w-8 h-8 opacity-40" />
                                        No ingredients found. Add one to get started.
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            ingredients.map((ing) => (
                                <TableRow key={ing.id} className="group">
                                    <TableCell className="font-mono text-muted-foreground">{ing.id}</TableCell>
                                    <TableCell className="font-medium">{ing.name}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono bg-secondary text-secondary-foreground">
                                            {ing.unit}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                        {ing.current_stock}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-muted-foreground">
                                        {ing.minimum_stock}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {isLowStock(ing) ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-destructive/15 text-destructive">
                                                <AlertTriangle className="w-3 h-3" />
                                                Low Stock
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/15 text-green-500">
                                                OK
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(ing)}>
                                                <Edit2 className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(ing.id)}
                                                disabled={isDeleting === ing.id}
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Ingredient' : 'Add Ingredient'}</DialogTitle>
                            <DialogDescription>
                                {editingId
                                    ? 'Update the details of this ingredient.'
                                    : 'Add a new ingredient to your inventory.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {/* Name */}
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="ing-name" className="text-right mt-3">Name</Label>
                                <div className="col-span-3 space-y-1">
                                    <Input
                                        id="ing-name"
                                        {...register('name')}
                                        placeholder="e.g. Tomato, Chicken Breast"
                                        autoFocus
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                                </div>
                            </div>

                            {/* Unit picker */}
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label className="text-right mt-3">Unit</Label>
                                <div className="col-span-3 space-y-1">
                                    <div className="flex flex-wrap gap-2">
                                        {UNIT_OPTIONS.map((unit) => (
                                            <button
                                                key={unit}
                                                type="button"
                                                onClick={() => setValue('unit', unit)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-mono font-medium border transition-all ${selectedUnit === unit
                                                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                                    : 'bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                                                    }`}
                                            >
                                                {unit}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.unit && <p className="text-sm text-destructive">{errors.unit.message}</p>}
                                </div>
                            </div>

                            {/* Current Stock */}
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="current-stock" className="text-right mt-3">Current Stock</Label>
                                <div className="col-span-3 space-y-1">
                                    <Input
                                        id="current-stock"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        {...register('current_stock')}
                                        placeholder="0"
                                    />
                                    {errors.current_stock && <p className="text-sm text-destructive">{errors.current_stock.message}</p>}
                                </div>
                            </div>

                            {/* Minimum Stock */}
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="min-stock" className="text-right mt-3">Min. Stock</Label>
                                <div className="col-span-3 space-y-1">
                                    <Input
                                        id="min-stock"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        {...register('minimum_stock')}
                                        placeholder="0"
                                    />
                                    <p className="text-xs text-muted-foreground">Alert threshold for low stock warnings</p>
                                    {errors.minimum_stock && <p className="text-sm text-destructive">{errors.minimum_stock.message}</p>}
                                </div>
                            </div>

                            {errors.root && (
                                <div className="text-destructive text-sm font-medium text-center col-span-4">
                                    {errors.root.message}
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add Ingredient'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
