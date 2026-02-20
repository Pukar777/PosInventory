
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export interface Recipe {
    id: number;
    menuName: string;
    emoji: string;
    ingredientsUsed: string;
}

interface ManageRecipeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: () => void; // Simplify for mock
}

export function ManageRecipeModal({ open, onOpenChange, onSave }: ManageRecipeModalProps) {
    const handleSave = () => {
        onSave();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button className="bg-amber-500 text-amber-950 hover:bg-amber-500/90" onClick={handleSave}>Save Recipe</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
