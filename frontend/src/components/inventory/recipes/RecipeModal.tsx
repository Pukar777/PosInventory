import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useApi } from '@/hooks/useApi';

export interface RecipeIngredient {
    id: number;
    name: string;
    unit: string | null;
    pivot: {
        quantity_required: number;
    }
}

export interface RecipeMenuItem {
    id: number;
    name: string;
    image: string | null;
    category_id: number;
    price: string | number;
    ingredients?: RecipeIngredient[];
}

export interface SaveIngredient {
    ingredient_id: number;
    quantity_required: number;
}

interface ManageRecipeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    recipe: RecipeMenuItem | null;
    allMenuItems: RecipeMenuItem[];
    onSave: (menuItemId: number, ingredients: SaveIngredient[]) => void;
}

export function ManageRecipeModal({ open, onOpenChange, recipe, allMenuItems, onSave }: ManageRecipeModalProps) {
    const { request } = useApi();
    const [selectedMenuId, setSelectedMenuId] = useState<string>('');
    const [ingredients, setIngredients] = useState<{ ingredient_id: number; quantity_required: number | string }[]>([]);
    const [allIngredients, setAllIngredients] = useState<any[]>([]);

    useEffect(() => {
        if (open) {
            // Fetch all ingredients to allow adding them
            fetchIngredients();

            if (recipe) {
                setSelectedMenuId(recipe.id.toString());
                const initialIngs = (recipe.ingredients || []).map(i => ({
                    ingredient_id: i.id,
                    quantity_required: Number(i.pivot?.quantity_required || 0)
                }));
                setIngredients(initialIngs);
            } else {
                setSelectedMenuId('');
                setIngredients([]);
            }
        }
    }, [open, recipe]);

    const fetchIngredients = async () => {
        try {
            const res = await request({ url: '/ingredients', method: 'GET' });
            if (res.data.success) {
                setAllIngredients(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch ingredients', err);
        }
    };

    const handleSave = () => {
        if (!selectedMenuId) return;
        const formattedIngredients = ingredients.map(inv => ({
            ingredient_id: inv.ingredient_id,
            quantity_required: Number(inv.quantity_required)
        })).filter(inv => inv.quantity_required > 0);

        onSave(Number(selectedMenuId), formattedIngredients);
        onOpenChange(false);
    };

    const handleAddIngredient = () => {
        // Find the first ingredient that isn't already added
        const unaddedIngredient = allIngredients.find(ai => !ingredients.some(inv => inv.ingredient_id === ai.id));
        if (unaddedIngredient) {
            setIngredients([...ingredients, { ingredient_id: unaddedIngredient.id, quantity_required: 0 }]);
        } else if (allIngredients.length > 0) {
            // fallback if all are added, just add the first one temporarily (though user should change it)
            setIngredients([...ingredients, { ingredient_id: allIngredients[0].id, quantity_required: 0 }]);
        }
    };

    const handleIngredientChange = (index: number, field: string, value: any) => {
        const newIngs = [...ingredients];
        newIngs[index] = { ...newIngs[index], [field]: value };
        setIngredients(newIngs);
    };

    const handleRemoveIngredient = (index: number) => {
        const newIngs = [...ingredients];
        newIngs.splice(index, 1);
        setIngredients(newIngs);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader><DialogTitle className="font-serif text-xl">{recipe ? 'Edit Recipe' : 'Add Recipe'}</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4 min-h-[300px]">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-wider text-muted-foreground">Menu Item</label>
                        <Select value={selectedMenuId} onValueChange={setSelectedMenuId} disabled={!!recipe}>
                            <SelectTrigger><SelectValue placeholder="Select menu item..." /></SelectTrigger>
                            <SelectContent>
                                {allMenuItems.map(mi => (
                                    <SelectItem key={mi.id} value={mi.id.toString()}>{mi.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedMenuId && (
                        <div className="mt-4 border-t border-border pt-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-muted-foreground">Recipe Ingredients</span>
                                <Button variant="secondary" size="sm" className="h-7 text-xs" onClick={handleAddIngredient}>+ Add Ingredient</Button>
                            </div>

                            <div className="space-y-2">
                                {ingredients.length === 0 ? (
                                    <div className="text-center text-xs text-muted-foreground italic py-4">No ingredients added yet.</div>
                                ) : (
                                    ingredients.map((ing, i) => {
                                        const selectedIngRef = allIngredients.find(ai => ai.id === ing.ingredient_id);
                                        const unit = selectedIngRef ? selectedIngRef.unit : '';

                                        return (
                                            <div key={i} className="flex items-center gap-3 py-2 border-b border-border">
                                                <div className="flex-1">
                                                    <Select
                                                        value={ing.ingredient_id.toString()}
                                                        onValueChange={(val) => handleIngredientChange(i, 'ingredient_id', Number(val))}
                                                    >
                                                        <SelectTrigger className="h-8 text-[13px] border-none shadow-none bg-transparent hover:bg-muted/50 p-0 focus:ring-0">
                                                            <SelectValue placeholder="Select ingredient" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {allIngredients.map(ai => (
                                                                <SelectItem key={ai.id} value={ai.id.toString()}>{ai.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={ing.quantity_required}
                                                    onChange={(e) => handleIngredientChange(i, 'quantity_required', parseFloat(e.target.value) || e.target.value)}
                                                    className="w-[90px] h-8 text-right font-mono"
                                                />
                                                <span className="text-xs text-muted-foreground w-10 font-mono">{unit}</span>
                                                <button onClick={() => handleRemoveIngredient(i)} className="text-red-500 opacity-60 hover:opacity-100 p-1 rounded hover:bg-red-500/10 transition-colors">✕</button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button className="bg-amber-500 text-amber-950 hover:bg-amber-500/90" onClick={handleSave} disabled={!selectedMenuId || ingredients.length === 0 || ingredients.some(i => Number(i.quantity_required) <= 0)}>Save Recipe</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
