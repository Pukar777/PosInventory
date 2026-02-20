import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { PageHeader } from '../shared/PageHeader';
import { TableToolbar } from '../shared/TableToolbar';
import { DataTableCard, DataTableHeader, DataTableHead, DataTableRow, DataTableCell, Table, TableBody } from '../shared/DataTable';
import { StatusBadge, UnitTag } from '../shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { AddIngredientModal, StockInModal, EditIngredientModal, type Ingredient } from './IngredientModals';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';
import { useInventoryStore } from '@/store/inventoryStore';

export function IngredientsView() {
    const { ingredients, isLoading, fetchIngredients } = useInventoryStore();
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isStockInOpen, setIsStockInOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

    const { request } = useApi();

    useEffect(() => {
        if (ingredients.length === 0) {
            fetchIngredients();
        }
    }, [ingredients.length, fetchIngredients]);

    const handleAdd = async (newIng: Omit<Ingredient, 'id'>) => {
        try {
            const response = await request({
                url: '/ingredients',
                method: 'POST',
                data: newIng
            });
            if (response.data.success) {
                toast.success('Ingredient added successfully!');
                fetchIngredients();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add ingredient');
        }
    };

    const handleEdit = async (id: number, updatedIng: Omit<Ingredient, 'id'>) => {
        try {
            const response = await request({
                url: `/ingredients/${id}`,
                method: 'PUT',
                data: updatedIng
            });
            if (response.data.success) {
                toast.success('Ingredient updated successfully!');
                fetchIngredients();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update ingredient');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this ingredient?')) return;
        try {
            const response = await request({
                url: `/ingredients/${id}`,
                method: 'DELETE'
            });
            if (response.data.success) {
                toast.success('Ingredient deleted successfully!');
                fetchIngredients();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete ingredient');
        }
    };

    const handleStockIn = async (id: number, quantity: number, _note: string) => {
        const ingredient = ingredients.find(i => i.id === id);
        if (!ingredient) return;

        const newStock = Number(ingredient.current_stock) + quantity;
        try {
            const response = await request({
                url: `/ingredients/${id}`,
                method: 'PUT',
                data: { current_stock: newStock }
            });
            if (response.data.success) {
                toast.success('Stock added successfully!');
                fetchIngredients();
                // Optionally log the note somewhere if you have a stock_movements table
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add stock');
        }
    };

    const filtered = ingredients.filter(i => {
        const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filterStatus === 'all' || i.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="animate-in fade-in space-y-4">
            <PageHeader
                title="Ingredients & Stock"
                actionLabel="Add Ingredient"
                onAction={() => setIsAddOpen(true)}
                icon={<Plus className="w-4 h-4" />}
                secondaryActionLabel="Stock In"
                onSecondaryAction={() => setIsStockInOpen(true)}
            />

            <TableToolbar
                searchQuery={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search ingredients..."
                filterValue={filterStatus}
                onFilterChange={setFilterStatus}
                filterOptions={[
                    { value: 'all', label: 'All Status' },
                    { value: 'good', label: 'In Stock' },
                    { value: 'warn', label: 'Low Stock' },
                    { value: 'low', label: 'Critical' }
                ]}
            />

            <DataTableCard>
                <Table>
                    <DataTableHeader>
                        <DataTableHead>Name</DataTableHead>
                        <DataTableHead>Unit</DataTableHead>
                        <DataTableHead>Current Stock</DataTableHead>
                        <DataTableHead>Min. Alert</DataTableHead>
                        <DataTableHead>Status</DataTableHead>
                        <DataTableHead className="text-right">Actions</DataTableHead>
                    </DataTableHeader>
                    <TableBody>
                        {isLoading ? (
                            <DataTableRow>
                                <DataTableCell colSpan={6} className="text-center text-muted-foreground italic py-10">Loading ingredients...</DataTableCell>
                            </DataTableRow>
                        ) : filtered.length === 0 ? (
                            <DataTableRow>
                                <DataTableCell colSpan={6} className="text-center text-muted-foreground italic py-10">No ingredients found</DataTableCell>
                            </DataTableRow>
                        ) : (
                            filtered.map((ing) => {
                                const pct = Math.min(100, (ing.current_stock / Math.max(ing.minimum_stock * 2, 1)) * 100);
                                return (
                                    <DataTableRow key={ing.id}>
                                        <DataTableCell className="font-medium">{ing.name}</DataTableCell>
                                        <DataTableCell><UnitTag unit={ing.unit} /></DataTableCell>
                                        <DataTableCell>
                                            <div className={`font-mono text-[14px] ${ing.status === 'low' ? 'text-red-500' : ing.status === 'warn' ? 'text-amber-500' : 'text-cream'}`}>
                                                {ing.current_stock}
                                            </div>
                                            <div className="w-full h-1 bg-secondary/50 rounded-full mt-1.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${ing.status === 'low' ? 'bg-red-500' : ing.status === 'warn' ? 'bg-amber-500' : 'bg-green-500'}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </DataTableCell>
                                        <DataTableCell className="font-mono text-muted-foreground text-[13px]">{ing.minimum_stock}</DataTableCell>
                                        <DataTableCell>
                                            <StatusBadge
                                                variant={ing.status}
                                                label={ing.status === 'low' ? 'Critical' : ing.status === 'warn' ? 'Low Stock' : 'In Stock'}
                                            />
                                        </DataTableCell>
                                        <DataTableCell className="text-right space-x-2">
                                            <Button variant="secondary" size="sm" onClick={() => {
                                                setEditingIngredient(ing);
                                                setIsEditOpen(true);
                                            }}>
                                                <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                                            </Button>
                                            <Button variant="destructive" size="sm" className="bg-red-500/15 text-red-500 hover:bg-red-500/25 border border-red-500/20" onClick={() => handleDelete(ing.id)}>
                                                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                                            </Button>
                                        </DataTableCell>
                                    </DataTableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </DataTableCard>

            <AddIngredientModal
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                onAdd={handleAdd}
            />

            <StockInModal
                open={isStockInOpen}
                onOpenChange={setIsStockInOpen}
                ingredients={ingredients}
                onStockIn={handleStockIn}
            />

            <EditIngredientModal
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                ingredient={editingIngredient}
                onEdit={handleEdit}
            />
        </div>
    );
}
