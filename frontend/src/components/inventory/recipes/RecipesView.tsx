import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { PageHeader } from '../shared/PageHeader';
import { DataTableCard, DataTableHeader, DataTableHead, DataTableRow, DataTableCell, Table, TableBody } from '../shared/DataTable';
import { ImageThumb } from '../shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface Recipe {
    id: number;
    menuName: string;
    emoji: string;
    ingredientsUsed: string;
}

const initialRecipes: Recipe[] = [
    { id: 1, menuName: 'Burger', emoji: '🍔', ingredientsUsed: 'Ground Beef (0.15 kg), Burger Buns (1 piece), Lettuce (0.05 kg)' },
    { id: 2, menuName: 'Pasta', emoji: '🍝', ingredientsUsed: 'Spaghetti (0.12 kg), Tomato (0.08 kg), Heavy Cream (0.05 liter)' },
    { id: 3, menuName: 'Pizza', emoji: '🍕', ingredientsUsed: 'Tomato (0.15 kg), Mozzarella Cheese (0.1 kg), Bread (1 piece)' },
    { id: 4, menuName: 'Grilled Salmon', emoji: '🐟', ingredientsUsed: 'Salmon Fillet (0.2 kg), Tomato (0.06 kg)' },
    { id: 8, menuName: 'Bruschetta', emoji: '🥖', ingredientsUsed: 'Tomato (0.08 kg), Bread (2 piece), Mozzarella Cheese (0.04 kg)' },
];

export function RecipesView() {
    const [recipes] = useState<Recipe[]>(initialRecipes);
    const [isManageOpen, setIsManageOpen] = useState(false);

    return (
        <div className="animate-in fade-in space-y-4">
            <PageHeader
                title="Recipes"
                actionLabel="Manage Recipe"
                onAction={() => setIsManageOpen(true)}
                icon={<Pencil className="w-4 h-4" />}
            />

            <DataTableCard>
                <Table>
                    <DataTableHeader>
                        <DataTableHead className="w-[60px]"></DataTableHead>
                        <DataTableHead>Menu Item</DataTableHead>
                        <DataTableHead>Ingredients Used</DataTableHead>
                        <DataTableHead className="text-right">Actions</DataTableHead>
                    </DataTableHeader>
                    <TableBody>
                        {recipes.length === 0 ? (
                            <DataTableRow>
                                <DataTableCell colSpan={4} className="text-center text-muted-foreground italic py-10">No recipes defined yet</DataTableCell>
                            </DataTableRow>
                        ) : (
                            recipes.map((r) => (
                                <DataTableRow key={r.id}>
                                    <DataTableCell><ImageThumb emoji={r.emoji} /></DataTableCell>
                                    <DataTableCell className="font-medium text-[14px]">{r.menuName}</DataTableCell>
                                    <DataTableCell className="text-xs text-muted-foreground w-[40%] leading-relaxed max-w-[280px]">
                                        {r.ingredientsUsed}
                                    </DataTableCell>
                                    <DataTableCell className="text-right space-x-2">
                                        <Button variant="secondary" size="sm" onClick={() => setIsManageOpen(true)}>
                                            <Pencil className="w-3.5 h-3.5 mr-1" /> Edit Recipe
                                        </Button>
                                    </DataTableCell>
                                </DataTableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </DataTableCard>

            <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader><DialogTitle className="font-serif text-xl">Manage Recipe</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4 min-h-[300px]">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-wider text-muted-foreground">Menu Item</label>
                            <Select>
                                <SelectTrigger><SelectValue placeholder="Select menu item..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Burger</SelectItem>
                                    <SelectItem value="2">Pasta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="mt-4 border-t border-border pt-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-muted-foreground">Recipe Ingredients</span>
                                <Button variant="secondary" size="sm" className="h-7 text-xs">+ Add Ingredient</Button>
                            </div>

                            <div className="space-y-2">
                                {/* Mock ingredient rows */}
                                <div className="flex items-center gap-3 py-2 border-b border-border">
                                    <span className="flex-1 text-[13px]">Ground Beef</span>
                                    <Input type="number" defaultValue={0.15} className="w-[90px] h-8 text-right font-mono" />
                                    <span className="text-xs text-muted-foreground w-10 font-mono">kg</span>
                                    <button className="text-red-500 opacity-60 hover:opacity-100 p-1 rounded hover:bg-red-500/10 transition-colors">✕</button>
                                </div>
                                <div className="flex items-center gap-3 py-2 border-b border-border">
                                    <span className="flex-1 text-[13px]">Burger Buns</span>
                                    <Input type="number" defaultValue={1} className="w-[90px] h-8 text-right font-mono" />
                                    <span className="text-xs text-muted-foreground w-10 font-mono">piece</span>
                                    <button className="text-red-500 opacity-60 hover:opacity-100 p-1 rounded hover:bg-red-500/10 transition-colors">✕</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsManageOpen(false)}>Cancel</Button>
                        <Button className="bg-amber-500 text-amber-950 hover:bg-amber-500/90">Save Recipe</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
