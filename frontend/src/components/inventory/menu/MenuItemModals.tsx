import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettingsStore } from '@/store/settingsStore';
import { Image as ImageIcon } from 'lucide-react';
import { getStorageUrl } from '@/lib/utils';

export interface Category {
    id: number;
    name: string;
}

export interface MenuItem {
    id: number;
    name: string;
    category_id: number;
    price: number;
    image: string | null;
    is_available: boolean;
    category?: Category;
    ingredients?: Array<any>;
}

interface AddMenuItemModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: Category[];
    onAdd: (item: any) => Promise<void>;
}

export function AddMenuItemModal({ open, onOpenChange, categories, onAdd }: AddMenuItemModalProps) {
    const [name, setName] = useState('');
    const [catId, setCatId] = useState('');
    const [price, setPrice] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { getSettingValue } = useSettingsStore();
    const currency = getSettingValue('currency_symbol', '$');

    useEffect(() => {
        if (open) {
            setName('');
            setCatId('');
            setPrice('');
            setImageFile(null);
            setImagePreview(null);
        }
    }, [open]);

    const handleAdd = async () => {
        if (!name.trim() || !catId || !price) return;

        setLoading(true);
        await onAdd({
            name,
            category_id: Number(catId),
            price: parseFloat(price),
            image: imageFile
        });
        setLoading(false);
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
                                    {categories.map(c => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Price ({currency})</Label>
                            <Input type="number" placeholder="0.00" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Image</Label>
                        <div className="flex items-center gap-4">
                            {imagePreview ? (
                                <div className="relative w-16 h-16 rounded-md border border-border overflow-hidden shrink-0">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-md border border-dashed border-border flex items-center justify-center shrink-0 bg-secondary/50 text-muted-foreground">
                                    <ImageIcon className="w-6 h-6" />
                                </div>
                            )}
                            <div className="flex-1 space-y-2">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className="cursor-pointer file:cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 text-xs"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setImageFile(file);
                                            setImagePreview(URL.createObjectURL(file));
                                        } else {
                                            setImageFile(null);
                                            setImagePreview(null);
                                        }
                                    }}
                                />
                                <p className="text-[11px] text-muted-foreground">Upload an image file</p>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                    <Button className="bg-amber-500 text-amber-950 hover:bg-amber-500/90" onClick={handleAdd} disabled={loading}>
                        {loading ? 'Adding...' : 'Add Item'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface EditMenuItemModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: Category[];
    menuItem: MenuItem | null;
    onEdit: (id: number, data: any) => Promise<void>;
}

export function EditMenuItemModal({ open, onOpenChange, categories, menuItem, onEdit }: EditMenuItemModalProps) {
    const [name, setName] = useState('');
    const [catId, setCatId] = useState('');
    const [price, setPrice] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { getSettingValue } = useSettingsStore();
    const currency = getSettingValue('currency_symbol', '$');

    useEffect(() => {
        if (open && menuItem) {
            setName(menuItem.name);
            setCatId(menuItem.category_id.toString());
            setPrice(menuItem.price.toString());
            setImageFile(null);

            if (menuItem.image) {
                // Check if it's an emoji or a path
                const isEmoji = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(menuItem.image);
                setImagePreview(isEmoji ? null : getStorageUrl(menuItem.image));
            } else {
                setImagePreview(null);
            }
        }
    }, [open, menuItem]);

    const handleEdit = async () => {
        if (!menuItem || !name.trim() || !catId || !price) return;

        setLoading(true);
        const updateData: any = {
            name,
            category_id: Number(catId),
            price: parseFloat(price)
        };
        if (imageFile) {
            updateData.image = imageFile;
        }

        await onEdit(menuItem.id, updateData);
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader><DialogTitle className="font-serif text-xl">Edit Menu Item</DialogTitle></DialogHeader>
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
                                    {categories.map(c => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Price ({currency})</Label>
                            <Input type="number" placeholder="0.00" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Image</Label>
                        <div className="flex items-center gap-4">
                            {imagePreview ? (
                                <div className="relative w-16 h-16 rounded-md border border-border overflow-hidden shrink-0">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-md border border-dashed border-border flex items-center justify-center shrink-0 bg-secondary/50 text-muted-foreground">
                                    <ImageIcon className="w-6 h-6" />
                                </div>
                            )}
                            <div className="flex-1 space-y-2">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className="cursor-pointer file:cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 text-xs"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setImageFile(file);
                                            setImagePreview(URL.createObjectURL(file));
                                        } else {
                                            setImageFile(null);
                                            // Fall back to original image preview if they cancel file selection
                                            if (menuItem?.image) {
                                                const isEmoji = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(menuItem.image);
                                                setImagePreview(isEmoji ? null : getStorageUrl(menuItem.image));
                                            } else {
                                                setImagePreview(null);
                                            }
                                        }
                                    }}
                                />
                                <p className="text-[11px] text-muted-foreground">Select a new image to replace</p>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                    <Button className="bg-amber-500 text-amber-950 hover:bg-amber-500/90" onClick={handleEdit} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface LinkedIngredientsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    menuItem: MenuItem | null;
}

export function LinkedIngredientsModal({ open, onOpenChange, menuItem }: LinkedIngredientsModalProps) {
    if (!menuItem) return null;

    const ingredients = menuItem.ingredients || [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-serif text-xl">Recipe Ingredients</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-muted-foreground mb-4">
                        Ingredients required for <span className="font-semibold text-foreground">{menuItem.name}</span>:
                    </p>
                    {ingredients.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground italic py-6">
                            No ingredients linked to this menu item.
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {ingredients.map((ing) => {
                                const required = Number(ing.pivot?.quantity_required) || 0;
                                const stock = Number(ing.current_stock) || 0;
                                const isAvailable = stock >= required;
                                const isLowAlert = stock <= Number(ing.minimum_stock);

                                return (
                                    <div key={ing.id} className="flex flex-col p-3 rounded-lg border border-border/50 bg-secondary/20">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-sm">{ing.name}</span>
                                            <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                                                Requires: {required} {ing.unit}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs text-muted-foreground">Current Stock:</span>
                                            <span className={`text-xs font-semibold ${!isAvailable ? 'text-red-500' : isLowAlert ? 'text-amber-500' : 'text-green-500'}`}>
                                                {stock} {ing.unit} {!isAvailable ? '(Insufficient)' : ''}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
