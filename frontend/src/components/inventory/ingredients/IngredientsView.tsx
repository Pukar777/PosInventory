import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { PageHeader } from '../shared/PageHeader';
import { TableToolbar } from '../shared/TableToolbar';
import { DataTableCard, DataTableHeader, DataTableHead, DataTableRow, DataTableCell, Table, TableBody } from '../shared/DataTable';
import { StatusBadge, UnitTag } from '../shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { AddIngredientModal, StockInModal, type Ingredient } from './IngredientModals';

const initialIngredients: Ingredient[] = [
    { id: 1, name: 'Tomato', unit: 'kg', stock: 20, min: 5, status: 'good' },
    { id: 2, name: 'Mozzarella Cheese', unit: 'kg', stock: 1.2, min: 3, status: 'low' },
    { id: 3, name: 'Chicken Breast', unit: 'kg', stock: 8, min: 4, status: 'good' },
    { id: 4, name: 'Ground Beef', unit: 'kg', stock: 0.8, min: 2, status: 'low' },
    { id: 5, name: 'Burger Buns', unit: 'piece', stock: 8, min: 20, status: 'warn' },
];

export function IngredientsView() {
    const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isStockInOpen, setIsStockInOpen] = useState(false);

    const handleAdd = (newIng: Omit<Ingredient, 'id'>) => {
        setIngredients([...ingredients, { ...newIng, id: Date.now() }]);
    };

    const handleStockIn = (id: number, quantity: number, _note: string) => {
        setIngredients(ingredients.map(ing => {
            if (ing.id !== id) return ing;
            const newStock = ing.stock + quantity;
            let status = ing.status;
            if (newStock <= ing.min) status = 'low';
            else if (newStock <= ing.min * 1.5) status = 'warn';
            else status = 'good';

            return { ...ing, stock: newStock, status };
        }));
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
                        {filtered.length === 0 ? (
                            <DataTableRow>
                                <DataTableCell colSpan={6} className="text-center text-muted-foreground italic py-10">No ingredients found</DataTableCell>
                            </DataTableRow>
                        ) : (
                            filtered.map((ing) => {
                                const pct = Math.min(100, (ing.stock / Math.max(ing.min * 2, 1)) * 100);
                                return (
                                    <DataTableRow key={ing.id}>
                                        <DataTableCell className="font-medium">{ing.name}</DataTableCell>
                                        <DataTableCell><UnitTag unit={ing.unit} /></DataTableCell>
                                        <DataTableCell>
                                            <div className={`font-mono text-[14px] ${ing.status === 'low' ? 'text-red-500' : ing.status === 'warn' ? 'text-amber-500' : 'text-cream'}`}>
                                                {ing.stock}
                                            </div>
                                            <div className="w-full h-1 bg-secondary/50 rounded-full mt-1.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${ing.status === 'low' ? 'bg-red-500' : ing.status === 'warn' ? 'bg-amber-500' : 'bg-green-500'}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </DataTableCell>
                                        <DataTableCell className="font-mono text-muted-foreground text-[13px]">{ing.min}</DataTableCell>
                                        <DataTableCell>
                                            <StatusBadge
                                                variant={ing.status}
                                                label={ing.status === 'low' ? 'Critical' : ing.status === 'warn' ? 'Low Stock' : 'In Stock'}
                                            />
                                        </DataTableCell>
                                        <DataTableCell className="text-right space-x-2">
                                            <Button variant="secondary" size="sm">
                                                <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                                            </Button>
                                            <Button variant="destructive" size="sm" className="bg-red-500/15 text-red-500 hover:bg-red-500/25 border border-red-500/20">
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
        </div>
    );
}
