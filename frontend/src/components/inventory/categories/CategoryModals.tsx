import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface Category {
    id: number;
    name: string;
    itemCount: number;
    created: string;
}

interface AddCategoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (name: string) => void;
}

export function AddCategoryModal({ open, onOpenChange, onAdd }: AddCategoryModalProps) {
    const [newName, setNewName] = useState('');

    useEffect(() => {
        if (!open) setNewName('');
    }, [open]);

    const handleAdd = () => {
        if (!newName.trim()) return;
        onAdd(newName);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-serif text-xl">Add Category</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Category Name</Label>
                        <Input
                            id="name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="e.g. Main Course"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button className="bg-amber-500 text-amber-950 hover:bg-amber-500/90" onClick={handleAdd}>Save Category</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface EditCategoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: Category | null;
    onEdit: (id: number, name: string) => void;
}

export function EditCategoryModal({ open, onOpenChange, category, onEdit }: EditCategoryModalProps) {
    const [editName, setEditName] = useState('');

    useEffect(() => {
        if (open && category) {
            setEditName(category.name);
        }
    }, [open, category]);

    const handleEdit = () => {
        if (!category || !editName.trim()) return;
        onEdit(category.id, editName);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-serif text-xl">Edit Category</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-name" className="text-xs uppercase tracking-wider text-muted-foreground">Category Name</Label>
                        <Input
                            id="edit-name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button className="bg-amber-500 text-amber-950 hover:bg-amber-500/90" onClick={handleEdit}>Update</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
