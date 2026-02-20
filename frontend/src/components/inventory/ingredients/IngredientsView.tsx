import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { PageHeader } from '../shared/PageHeader';
import { TableToolbar } from '../shared/TableToolbar';
import { DataTableCard, DataTableHeader, DataTableHead, DataTableRow, DataTableCell, Table, TableBody } from '../shared/DataTable';
import { StatusBadge, UnitTag } from '../shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Ingredient {
    id: number;
    name: string;
    unit: string;
    stock: number;
    min: number;
    status: 'good' | 'warn' | 'low';
}

const initialIngredients: Ingredient[] = [
    { id: 1, name: 'Tomato', unit: 'kg', stock: 20, min: 5, status: 'good' },
    { id: 2, name: 'Mozzarella Cheese', unit: 'kg', stock: 1.2, min: 3, status: 'low' },
    { id: 3, name: 'Chicken Breast', unit: 'kg', stock: 8, min: 4, status: 'good' },
    { id: 4, name: 'Ground Beef', unit: 'kg', stock: 0.8, min: 2, status: 'low' },
    { id: 5, name: 'Burger Buns', unit: 'piece', stock: 8, min: 20, status: 'warn' },
];

export function IngredientsView() {
    const [ingredients] = useState<Ingredient[]>(initialIngredients);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isStockInOpen, setIsStockInOpen] = useState(false);

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

            {/* Modals will be similar to Categories, just keeping UI structural for now */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader><DialogTitle className="font-serif text-xl">Add Ingredient</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Ingredient Name</Label>
                            <Input placeholder="e.g. Tomato" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Unit</Label>
                                <Select defaultValue="kg">
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="kg">kg</SelectItem>
                                        <SelectItem value="gram">gram</SelectItem>
                                        <SelectItem value="piece">piece</SelectItem>
                                        <SelectItem value="liter">liter</SelectItem>
                                        <SelectItem value="ml">ml</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Current Stock</Label>
                                <Input type="number" placeholder="0" step="0.1" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Minimum Stock Alert</Label>
                            <Input type="number" placeholder="0" step="0.1" />
                            <p className="text-[11px] text-muted-foreground mt-1">System will alert when stock drops below this value</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                        <Button className="bg-amber-500 text-amber-950 hover:bg-amber-500/90">Add Ingredient</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isStockInOpen} onOpenChange={setIsStockInOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader><DialogTitle className="font-serif text-xl">Manual Stock In</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Ingredient</Label>
                            <Select>
                                <SelectTrigger><SelectValue placeholder="Select ingredient..." /></SelectTrigger>
                                <SelectContent>
                                    {ingredients.map(i => <SelectItem key={i.id} value={i.id.toString()}>{i.name} ({i.stock} {i.unit})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Quantity to Add</Label>
                            <Input type="number" placeholder="0" step="0.1" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Note (optional)</Label>
                            <Input type="text" placeholder="e.g. Supplier delivery" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsStockInOpen(false)}>Cancel</Button>
                        <Button className="bg-amber-500 text-amber-950 hover:bg-amber-500/90">Add Stock</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
