import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { PageHeader } from '../shared/PageHeader';
import { DataTableCard, DataTableHeader, DataTableHead, DataTableRow, DataTableCell, Table, TableBody } from '../shared/DataTable';
import { CatPill } from '../shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { AddCategoryModal, EditCategoryModal, type Category } from './CategoryModals';

const initialCategories: Category[] = [
    { id: 1, name: 'Main Course', itemCount: 4, created: '2025-01-10' },
    { id: 2, name: 'Drinks', itemCount: 2, created: '2025-01-10' },
    { id: 3, name: 'Desserts', itemCount: 1, created: '2025-01-12' },
    { id: 4, name: 'Starters', itemCount: 1, created: '2025-01-15' },
];

export function CategoriesView() {
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editCat, setEditCat] = useState<Category | null>(null);

    const handleAdd = (name: string) => {
        setCategories([...categories, {
            id: Date.now(),
            name: name,
            itemCount: 0,
            created: new Date().toISOString().split('T')[0]
        }]);
    };

    const handleEdit = (id: number, name: string) => {
        setCategories(categories.map(c => c.id === id ? { ...c, name } : c));
        setEditCat(null);
    };

    const handleDelete = (id: number) => {
        setCategories(categories.filter(c => c.id !== id));
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
                        {categories.length === 0 ? (
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
