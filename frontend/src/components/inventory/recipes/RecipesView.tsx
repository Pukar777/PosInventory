import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { PageHeader } from '../shared/PageHeader';
import { DataTableCard, DataTableHeader, DataTableHead, DataTableRow, DataTableCell, Table, TableBody } from '../shared/DataTable';
import { ImageThumb } from '../shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { ManageRecipeModal, type Recipe } from './RecipeModal';

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

            <ManageRecipeModal
                open={isManageOpen}
                onOpenChange={setIsManageOpen}
                onSave={() => console.log('Mock save recipe')}
            />
        </div>
    );
}
