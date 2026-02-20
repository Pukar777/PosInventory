import { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { PageHeader } from '../shared/PageHeader';
import { DataTableCard, DataTableHeader, DataTableHead, DataTableRow, DataTableCell, Table, TableBody } from '../shared/DataTable';
import { ImageThumb } from '../shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { ManageRecipeModal, type RecipeMenuItem } from './RecipeModal';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';

export function RecipesView() {
    const { request } = useApi();
    const [recipes, setRecipes] = useState<RecipeMenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isManageOpen, setIsManageOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<RecipeMenuItem | null>(null);

    const fetchRecipes = async () => {
        setIsLoading(true);
        try {
            const response = await request({ url: '/recipes', method: 'GET' });
            if (response.data.success) {
                setRecipes(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching recipes:', error);
            toast.error('Failed to fetch recipes');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipes();
    }, []);

    const handleEditRecipe = (recipe: RecipeMenuItem) => {
        setSelectedRecipe(recipe);
        setIsManageOpen(true);
    };

    const handleSaveRecipe = async (menuItemId: number, ingredients: any[]) => {
        try {
            const response = await request({
                url: `/recipes/${menuItemId}`,
                method: 'PUT',
                data: { ingredients }
            });
            if (response.data.success) {
                toast.success('Recipe updated successfully');
                fetchRecipes();
            }
        } catch (error: any) {
            console.error('Error saving recipe:', error);
            toast.error(error.response?.data?.message || 'Failed to save recipe');
        }
    };

    return (
        <div className="animate-in fade-in space-y-4">
            <PageHeader
                title="Recipes"
                actionLabel="Manage Recipe"
                onAction={() => { setSelectedRecipe(null); setIsManageOpen(true); }}
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
                        {isLoading ? (
                            <DataTableRow>
                                <DataTableCell colSpan={4} className="text-center text-muted-foreground italic py-10">Loading recipes...</DataTableCell>
                            </DataTableRow>
                        ) : recipes.length === 0 ? (
                            <DataTableRow>
                                <DataTableCell colSpan={4} className="text-center text-muted-foreground italic py-10">No menu items found</DataTableCell>
                            </DataTableRow>
                        ) : (
                            recipes.map((r) => {
                                const hasIngredients = r.ingredients && r.ingredients.length > 0;
                                const ingredientsText = hasIngredients
                                    ? (r.ingredients || []).map(i => `${i.name} (${Number(i.pivot?.quantity_required || 0).toString()} ${i.unit || 'unit'})`).join(', ')
                                    : 'No recipe defined';

                                const isEmoji = r.image ? /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(r.image) : false;

                                return (
                                    <DataTableRow key={r.id}>
                                        <DataTableCell>
                                            <ImageThumb
                                                emoji={isEmoji ? (r.image as string) : undefined}
                                                imageUrl={!isEmoji && r.image ? (r.image as string) : undefined}
                                            />
                                        </DataTableCell>
                                        <DataTableCell className="font-medium text-[14px]">{r.name}</DataTableCell>
                                        <DataTableCell className="text-xs text-muted-foreground w-[40%] leading-relaxed max-w-[280px]">
                                            {ingredientsText}
                                        </DataTableCell>
                                        <DataTableCell className="text-right space-x-2">
                                            <Button variant="secondary" size="sm" onClick={() => handleEditRecipe(r)}>
                                                <Pencil className="w-3.5 h-3.5 mr-1" /> {hasIngredients ? 'Edit Recipe' : 'Add Recipe'}
                                            </Button>
                                        </DataTableCell>
                                    </DataTableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </DataTableCard>

            <ManageRecipeModal
                open={isManageOpen}
                onOpenChange={setIsManageOpen}
                recipe={selectedRecipe}
                allMenuItems={recipes}
                onSave={handleSaveRecipe}
            />
        </div>
    );
}
