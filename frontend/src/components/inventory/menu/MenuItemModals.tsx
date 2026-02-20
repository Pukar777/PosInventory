import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface MenuItem {
    id: number;
    name: string;
    catId: number;
    catName: string;
    price: number;
    emoji: string;
    recipeCount: number;
}

interface AddMenuItemModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (item: Omit<MenuItem, 'id' | 'recipeCount'>) => void;
}

export function AddMenuItemModal({ open, onOpenChange, onAdd }: AddMenuItemModalProps) {
    const [name, setName] = useState('');
    const [catId, setCatId] = useState('');
    const [price, setPrice] = useState('');
    const [emoji, setEmoji] = useState('');

    const handleAdd = () => {
        if (!name.trim() || !catId || !price) return;

        // Map basic category names for mock purposes
        const catNames: Record<string, string> = {
            '1': 'Main Course',
            '2': 'Drinks',
            '3': 'Desserts',
            '4': 'Starters'
        };

        onAdd({
            name,
            catId: Number(catId),
            catName: catNames[catId] || 'Main Course',
            price: parseFloat(price),
            emoji: emoji || '🍽️'
        });

        // Reset
        setName('');
        setCatId('');
        setPrice('');
        setEmoji('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader><DialogTitle className="font-serif text-xl">Add Menu Item</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Item Name</Label>
                        <Input placeholder="e.g. Grilled Salmon" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Category</Label>
                            <Select value={catId} onValueChange={setCatId}>
                                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Main Course</SelectItem>
                                    <SelectItem value="2">Drinks</SelectItem>
                                    <SelectItem value="3">Desserts</SelectItem>
                                    <SelectItem value="4">Starters</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Price ($)</Label>
                            <Input type="number" placeholder="0.00" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Emoji / Image</Label>
                        <Input type="text" placeholder="🍕" maxLength={4} value={emoji} onChange={(e) => setEmoji(e.target.value)} />
                        <p className="text-[11px] text-muted-foreground mt-1">Enter an emoji to represent this item</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button className="bg-amber-500 text-amber-950 hover:bg-amber-500/90" onClick={handleAdd}>Add Item</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
