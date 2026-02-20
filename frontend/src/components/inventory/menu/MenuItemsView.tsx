import { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../shared/PageHeader';
import { TableToolbar } from '../shared/TableToolbar';
import { DataTableCard, DataTableHeader, DataTableHead, DataTableRow, DataTableCell, Table, TableBody } from '../shared/DataTable';
import { CatPill, ImageThumb } from '../shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { AddMenuItemModal, type MenuItem } from './MenuItemModals';

const initialMenuItems: MenuItem[] = [
    { id: 1, name: 'Burger', catId: 1, catName: 'Main Course', price: 12.50, emoji: '🍔', recipeCount: 3 },
    { id: 2, name: 'Pasta', catId: 1, catName: 'Main Course', price: 14.00, emoji: '🍝', recipeCount: 3 },
    { id: 3, name: 'Pizza', catId: 1, catName: 'Main Course', price: 15.00, emoji: '🍕', recipeCount: 3 },
    { id: 4, name: 'Grilled Salmon', catId: 1, catName: 'Main Course', price: 22.00, emoji: '🐟', recipeCount: 2 },
    { id: 5, name: 'Coke', catId: 2, catName: 'Drinks', price: 3.50, emoji: '🥤', recipeCount: 0 },
    { id: 6, name: 'Lemonade', catId: 2, catName: 'Drinks', price: 4.00, emoji: '🍋', recipeCount: 0 },
    { id: 7, name: 'Tiramisu', catId: 3, catName: 'Desserts', price: 8.50, emoji: '🍮', recipeCount: 0 },
    { id: 8, name: 'Bruschetta', catId: 4, catName: 'Starters', price: 7.50, emoji: '🥖', recipeCount: 3 },
];

export function MenuItemsView() {
    const [items, setItems] = useState<MenuItem[]>(initialMenuItems);
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('all');

    const [isAddOpen, setIsAddOpen] = useState(false);

    const handleAdd = (newItem: Omit<MenuItem, 'id' | 'recipeCount'>) => {
        setItems([{ ...newItem, id: Date.now(), recipeCount: 0 }, ...items]);
    };

    const filtered = items.filter(i => {
        const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
        const matchesCat = filterCat === 'all' || i.catId.toString() === filterCat;
        return matchesSearch && matchesCat;
    });

    return (
        <div className="animate-in fade-in space-y-4">
            <PageHeader
                title="Menu Items"
                actionLabel="Add Menu Item"
                onAction={() => setIsAddOpen(true)}
                icon={<Plus className="w-4 h-4" />}
            />

            <TableToolbar
                searchQuery={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search menu items..."
                filterValue={filterCat}
                onFilterChange={setFilterCat}
                filterOptions={[
                    { value: 'all', label: 'All Categories' },
                    { value: '1', label: 'Main Course' },
                    { value: '2', label: 'Drinks' },
                    { value: '3', label: 'Desserts' },
                    { value: '4', label: 'Starters' }
                ]}
            />

            <DataTableCard>
                <Table>
                    <DataTableHeader>
                        <DataTableHead className="w-[60px]"></DataTableHead>
                        <DataTableHead>Name</DataTableHead>
                        <DataTableHead>Category</DataTableHead>
                        <DataTableHead>Price</DataTableHead>
                        <DataTableHead>Recipe</DataTableHead>
                        <DataTableHead className="text-right">Actions</DataTableHead>
                    </DataTableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <DataTableRow>
                                <DataTableCell colSpan={6} className="text-center text-muted-foreground italic py-10">No items found</DataTableCell>
                            </DataTableRow>
                        ) : (
                            filtered.map((item) => (
                                <DataTableRow key={item.id}>
                                    <DataTableCell><ImageThumb emoji={item.emoji} /></DataTableCell>
                                    <DataTableCell className="font-medium text-[14px]">{item.name}</DataTableCell>
                                    <DataTableCell><CatPill label={item.catName} /></DataTableCell>
                                    <DataTableCell className="font-mono text-[14px] text-cream">${item.price.toFixed(2)}</DataTableCell>
                                    <DataTableCell>
                                        {item.recipeCount > 0 ? (
                                            <span className="flex items-center text-green-500 text-xs gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> {item.recipeCount} ingredients
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground text-xs italic">No recipe</span>
                                        )}
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
                            ))
                        )}
                    </TableBody>
                </Table>
            </DataTableCard>

            <AddMenuItemModal
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                onAdd={handleAdd}
            />
        </div>
    );
}
