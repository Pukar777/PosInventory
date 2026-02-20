import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { PageHeader } from '../shared/PageHeader';
import { DataTableCard, DataTableHeader, DataTableHead, DataTableRow, DataTableCell, Table, TableBody } from '../shared/DataTable';
import { CatPill } from '../shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { AddCategoryModal, EditCategoryModal, type Category } from './CategoryModals';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';

export function CategoriesView() {
    const { request } = useApi();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editCat, setEditCat] = useState<Category | null>(null);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const response = await request({ url: '/categories', method: 'GET' });
            if (response.data.success) {
                // Map backend keys to frontend expected ones, if needed
                const fetched = response.data.data.map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    itemCount: c.menu_items_count || 0,
                    created: new Date(c.created_at).toISOString().split('T')[0]
                }));
                setCategories(fetched);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAdd = async (name: string) => {
        try {
            const response = await request({
                url: '/categories',
                method: 'POST',
                data: { name }
            });
            if (response.data.success) {
                fetchCategories();
                toast.success('Category created successfully');
            }
        } catch (error: any) {
            console.error('Error creating category:', error);
            toast.error(error.response?.data?.message || 'Failed to create category');
        }
    };

    const handleEdit = async (id: number, name: string) => {
        try {
            const response = await request({
                url: `/categories/${id}`,
                method: 'PUT',
                data: { name }
            });
            if (response.data.success) {
                fetchCategories();
                setEditCat(null);
                toast.success('Category updated successfully');
            }
        } catch (error: any) {
            console.error('Error updating category:', error);
            toast.error(error.response?.data?.message || 'Failed to update category');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            const response = await request({
                url: `/categories/${id}`,
                method: 'DELETE'
            });
            if (response.data.success) {
                fetchCategories();
                toast.success('Category deleted successfully');
            }
        } catch (error: any) {
            console.error('Error deleting category:', error);
            toast.error(error.response?.data?.message || 'Failed to delete category');
        }
    };

    return (
        <div className="animate-in fade-in space-y-4">
            <PageHeader
                title="Categories"
                actionLabel="Add Category"
                onAction={() => setIsAddModalOpen(true)}
                icon={<Plus className="w-4 h-4" />}
            />

            <DataTableCard>
                <Table>
                    <DataTableHeader>
                        <DataTableHead className="w-[80px]">#</DataTableHead>
                        <DataTableHead>Category Name</DataTableHead>
                        <DataTableHead>Menu Items</DataTableHead>
                        <DataTableHead>Created</DataTableHead>
                        <DataTableHead className="text-right">Actions</DataTableHead>
                    </DataTableHeader>
                    <TableBody>
                        {isLoading ? (
                            <DataTableRow>
                                <DataTableCell colSpan={5} className="text-center text-muted-foreground italic py-10">Loading categories...</DataTableCell>
                            </DataTableRow>
                        ) : categories.length === 0 ? (
                            <DataTableRow>
                                <DataTableCell colSpan={5} className="text-center text-muted-foreground italic py-10">No categories yet</DataTableCell>
                            </DataTableRow>
                        ) : (
                            categories.map((c, i) => (
                                <DataTableRow key={c.id}>
                                    <DataTableCell className="font-mono text-muted-foreground text-xs">{i + 1}</DataTableCell>
                                    <DataTableCell className="font-medium">{c.name}</DataTableCell>
                                    <DataTableCell><CatPill label={`${c.itemCount} items`} /></DataTableCell>
                                    <DataTableCell className="text-muted-foreground text-xs">{c.created}</DataTableCell>
                                    <DataTableCell className="text-right space-x-2">
                                        <Button variant="secondary" size="sm" onClick={() => { setEditCat(c); setIsEditModalOpen(true); }}>
                                            <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                                        </Button>
                                        <Button variant="destructive" size="sm" className="bg-red-500/15 text-red-500 hover:bg-red-500/25 border border-red-500/20" onClick={() => handleDelete(c.id)}>
                                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                                        </Button>
                                    </DataTableCell>
                                </DataTableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </DataTableCard>

            <AddCategoryModal
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onAdd={handleAdd}
            />

            <EditCategoryModal
                open={isEditModalOpen}
                onOpenChange={(open) => {
                    setIsEditModalOpen(open);
                    if (!open) setEditCat(null);
                }}
                category={editCat}
                onEdit={handleEdit}
            />
        </div>
    );
}
