import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface Ingredient {
    id: number;
    name: string;
    unit: string;
    current_stock: number;
    minimum_stock: number;
    status: 'good' | 'warn' | 'low';
}

interface AddIngredientModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (ingredient: Omit<Ingredient, 'id'>) => void;
}

export function AddIngredientModal({ open, onOpenChange, onAdd }: AddIngredientModalProps) {
    const [name, setName] = useState('');
    const [unit, setUnit] = useState('kg');
    const [stock, setStock] = useState('');
    const [min, setMin] = useState('');

    const handleAdd = () => {
        if (!name.trim() || !stock || !min) return;

        const stockNum = parseFloat(stock);
        const minNum = parseFloat(min);
        let status: 'good' | 'warn' | 'low' = 'good';

        if (stockNum <= minNum) {
            status = 'low';
        } else if (stockNum <= minNum * 1.5) {
            status = 'warn';
        }

        onAdd({
            name,
            unit,
            current_stock: stockNum,
            minimum_stock: minNum,
            status
        });

        // Reset
        setName('');
        setUnit('kg');
        setStock('');
        setMin('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader><DialogTitle className="font-serif text-xl">Add Ingredient</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Ingredient Name</Label>
                        <Input placeholder="e.g. Tomato" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Unit</Label>
                            <Select value={unit} onValueChange={setUnit}>
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
                            <Input type="number" placeholder="0" step="0.1" value={stock} onChange={(e) => setStock(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Minimum Stock Alert</Label>
                        <Input type="number" placeholder="0" step="0.1" value={min} onChange={(e) => setMin(e.target.value)} />
                        <p className="text-[11px] text-muted-foreground mt-1">System will alert when stock drops below this value</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button className="bg-amber-500 text-amber-950 hover:bg-amber-500/90" onClick={handleAdd}>Add Ingredient</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface EditIngredientModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ingredient: Ingredient | null;
    onEdit: (id: number, ingredient: Omit<Ingredient, 'id'>) => void;
}

export function EditIngredientModal({ open, onOpenChange, ingredient, onEdit }: EditIngredientModalProps) {
    const [name, setName] = useState(ingredient?.name || '');
    const [unit, setUnit] = useState(ingredient?.unit || 'kg');
    const [stock, setStock] = useState(ingredient?.current_stock?.toString() || '');
    const [min, setMin] = useState(ingredient?.minimum_stock?.toString() || '');

    // Reset state when ingredient changes
    useEffect(() => {
        if (ingredient) {
            setName(ingredient.name);
            setUnit(ingredient.unit);
            setStock(ingredient.current_stock.toString());
            setMin(ingredient.minimum_stock.toString());
        }
    }, [ingredient]);

    const handleEdit = () => {
        if (!ingredient || !name.trim() || !stock || !min) return;

        const stockNum = parseFloat(stock);
        const minNum = parseFloat(min);
        let status: 'good' | 'warn' | 'low' = 'good';

        if (stockNum <= minNum) {
            status = 'low';
        } else if (stockNum <= minNum * 1.5) {
            status = 'warn';
        }

        onEdit(ingredient.id, {
            name,
            unit,
            current_stock: stockNum,
            minimum_stock: minNum,
            status
        });

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader><DialogTitle className="font-serif text-xl">Edit Ingredient</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Ingredient Name</Label>
                        <Input placeholder="e.g. Tomato" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Unit</Label>
                            <Select value={unit} onValueChange={setUnit}>
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
                            <Input type="number" placeholder="0" step="0.1" value={stock} onChange={(e) => setStock(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Minimum Stock Alert</Label>
                        <Input type="number" placeholder="0" step="0.1" value={min} onChange={(e) => setMin(e.target.value)} />
                        <p className="text-[11px] text-muted-foreground mt-1">System will alert when stock drops below this value</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button className="bg-amber-500 text-amber-950 hover:bg-amber-500/90" onClick={handleEdit}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface StockInModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ingredients: Ingredient[];
    onStockIn: (ingredientId: number, quantity: number, note: string) => void;
}

export function StockInModal({ open, onOpenChange, ingredients, onStockIn }: StockInModalProps) {
    const [ingredientId, setIngredientId] = useState<string>('');
    const [quantity, setQuantity] = useState('');
    const [note, setNote] = useState('');

    const handleStockIn = () => {
        if (!ingredientId || !quantity) return;
        onStockIn(Number(ingredientId), parseFloat(quantity), note);
        setIngredientId('');
        setQuantity('');
        setNote('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader><DialogTitle className="font-serif text-xl">Manual Stock In</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Ingredient</Label>
                        <Select value={ingredientId} onValueChange={setIngredientId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select ingredient..." />
                            </SelectTrigger>
                            <SelectContent>
                                {ingredients.map(i => (
                                    <SelectItem key={i.id} value={i.id.toString()}>
                                        {i.name} ({i.current_stock} {i.unit})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Quantity to Add</Label>
                        <Input type="number" placeholder="0" step="0.1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Note (optional)</Label>
                        <Input type="text" placeholder="e.g. Supplier delivery" value={note} onChange={(e) => setNote(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button className="bg-amber-500 text-amber-950 hover:bg-amber-500/90" onClick={handleStockIn}>Add Stock</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
