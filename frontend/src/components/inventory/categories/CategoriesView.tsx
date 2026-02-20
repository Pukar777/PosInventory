import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { PageHeader } from '../shared/PageHeader';
import { DataTableCard, DataTableHeader, DataTableHead, DataTableRow, DataTableCell, Table, TableBody } from '../shared/DataTable';
import { CatPill } from '../shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Category {
    id: number;
    name: string;
    itemCount: number;
    created: string;
}

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

    const [newName, setNewName] = useState('');

    const handleAdd = () => {
        if (!newName.trim()) return;
        setCategories([...categories, {
            id: Date.now(),
            name: newName,
            itemCount: 0,
            created: new Date().toISOString().split('T')[0]
        }]);
        setNewName('');
        setIsAddModalOpen(false);
    };

    const handleEdit = () => {
        if (!editCat || !editCat.name.trim()) return;
        setCategories(categories.map(c => c.id === editCat.id ? editCat : c));
        setEditCat(null);
        setIsEditModalOpen(false);
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

            {/* Add Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-xl">Add Category</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Category Name</Label>
                            <Input
                                id="name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. Main Course"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button className="bg-amber-500 text-amber-950 hover:bg-amber-500/90" onClick={handleAdd}>Save Category</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-xl">Edit Category</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="edit-name" className="text-xs uppercase tracking-wider text-muted-foreground">Category Name</Label>
                            <Input
                                id="edit-name"
                                value={editCat?.name || ''}
                                onChange={(e) => setEditCat(prev => prev ? { ...prev, name: e.target.value } : null)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button className="bg-amber-500 text-amber-950 hover:bg-amber-500/90" onClick={handleEdit}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
