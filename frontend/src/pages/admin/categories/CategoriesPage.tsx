import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
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

const categorySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface Category {
    id: number
    name: string
    created_at: string
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState<number | null>(null)

    const [editingId, setEditingId] = useState<number | null>(null)

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: { name: '' },
    })

    const { register, handleSubmit, reset, formState: { errors } } = form

    const { request } = useApi()

    const fetchCategories = async () => {
        try {
            setIsLoading(true)
            const res = await request<Category[]>({ url: '/categories', method: 'GET' })
            setCategories(res.data)
        } catch (err) {
            console.error('Failed to fetch categories', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleOpenDialog = (category?: Category) => {
        if (category) {
            setEditingId(category.id)
            reset({ name: category.name })
        } else {
            setEditingId(null)
            reset({ name: '' })
        }
        setIsDialogOpen(true)
    }

    const onSubmit = async (data: CategoryFormValues) => {
        try {
            if (editingId) {
                await request({
                    url: `/categories/${editingId}`,
                    method: 'PUT',
                    data: { name: data.name },
                })
            } else {
                await request({
                    url: '/categories',
                    method: 'POST',
                    data: { name: data.name },
                })
            }
            setIsDialogOpen(false)
            fetchCategories()
        } catch (err: any) {
            form.setError('root', { message: err.response?.data?.message || 'Action failed' })
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return
        setIsDeleting(id)
        try {
            await request({ url: `/categories/${id}`, method: 'DELETE' })
            fetchCategories()
        } catch (err) {
            console.error('Failed to delete category', err)
        } finally {
            setIsDeleting(null)
        }
    }

    return (
        <div className="space-y-6 pt-4 md:pt-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-mono tracking-tight text-primary">Categories</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Manage your menu categories here.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="gap-2 sm:w-auto w-full">
                    <Plus className="w-4 h-4" />
                    Add Category
                </Button>
            </div>

            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden shadow-sm overflow-x-auto">
                <Table className="min-w-[400px]">
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                    Loading categories...
                                </TableCell>
                            </TableRow>
                        ) : categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                    No categories found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((cat) => (
                                <TableRow key={cat.id} className="group">
                                    <TableCell className="font-mono text-muted-foreground">{cat.id}</TableCell>
                                    <TableCell className="font-medium">{cat.name}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(cat)}>
                                                <Edit2 className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(cat.id)}
                                                disabled={isDeleting === cat.id}
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
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Category' : 'Create Category'}</DialogTitle>
                            <DialogDescription>
                                {editingId
                                    ? "Update the details of this category."
                                    : "Add a new category to organize your menu items."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="name" className="text-right mt-3">
                                    Name
                                </Label>
                                <div className="col-span-3 space-y-2">
                                    <Input
                                        id="name"
                                        {...register("name")}
                                        placeholder="e.g. Appetizers, Mains, Drinks"
                                        autoFocus
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                                </div>
                            </div>
                            {errors.root && (
                                <div className="text-destructive text-sm font-medium text-center">{errors.root.message}</div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingId ? 'Save Changes' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
