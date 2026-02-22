import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, List } from 'lucide-react';
import { PageHeader } from '../shared/PageHeader';
import { TableToolbar } from '../shared/TableToolbar';
import { DataTableCard, DataTableHeader, DataTableHead, DataTableRow, DataTableCell, Table, TableBody } from '../shared/DataTable';
import { CatPill, ImageThumb } from '../shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { AddMenuItemModal, EditMenuItemModal, LinkedIngredientsModal, type MenuItem, type Category } from './MenuItemModals';
import { useApi } from '@/hooks/useApi';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from 'sonner';

export function MenuItemsView() {
    const { request } = useApi();
    const [items, setItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingItems, setIsLoadingItems] = useState(true);
    const { getSettingValue } = useSettingsStore();
    const currency = getSettingValue('currency_symbol', '$');

    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('all');

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isIngredientsOpen, setIsIngredientsOpen] = useState(false);
    const [editItem, setEditItem] = useState<MenuItem | null>(null);

    const fetchData = async () => {
        setIsLoadingItems(true);
        try {
            const [itemsRes, catsRes] = await Promise.all([
                request({ url: '/menu-items', method: 'GET' }),
                request({ url: '/categories', method: 'GET' })
            ]);

            if (itemsRes.data.success) {
                setItems(itemsRes.data.data);
            }
            if (catsRes.data.success) {
                setCategories(catsRes.data.data.map((c: any) => ({ id: c.id, name: c.name })));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch menu items data');
        } finally {
            setIsLoadingItems(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = async (data: any) => {
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('category_id', data.category_id);
            formData.append('price', data.price.toString());
            if (data.image) {
                formData.append('image', data.image);
            }

            const response = await request({
                url: '/menu-items',
                method: 'POST',
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                fetchData();
                setIsAddOpen(false);
                toast.success('Menu item added successfully');
            }
        } catch (error: any) {
            console.error('Error adding menu item:', error);
            toast.error(error.response?.data?.message || 'Failed to add menu item');
        }
    };

    const handleEdit = async (id: number, data: any) => {
        try {
            const formData = new FormData();
            formData.append('_method', 'PUT'); // Spoof PUT request for Laravel
            formData.append('name', data.name);
            formData.append('category_id', data.category_id);
            formData.append('price', data.price.toString());
            if (data.image instanceof File) {
                formData.append('image', data.image);
            }

            const response = await request({
                url: `/menu-items/${id}`,
                method: 'POST', // Must be POST for multipart form data
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                fetchData();
                setIsEditOpen(false);
                setEditItem(null);
                toast.success('Menu item updated successfully');
            }
        } catch (error: any) {
            console.error('Error updating menu item:', error);
            toast.error(error.response?.data?.message || 'Failed to update menu item');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this menu item?')) return;
        try {
            const response = await request({
                url: `/menu-items/${id}`,
                method: 'DELETE'
            });
            if (response.data.success) {
                fetchData();
                toast.success('Menu item deleted successfully');
            }
        } catch (error: any) {
            console.error('Error deleting menu item:', error);
            toast.error(error.response?.data?.message || 'Failed to delete menu item');
        }
    };

    const filtered = useMemo(() => {
        return items.filter(i => {
            const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
            const matchesCat = filterCat === 'all' || i.category_id.toString() === filterCat;
            return matchesSearch && matchesCat;
        });
    }, [items, search, filterCat]);

    const filterOptions = [
        { value: 'all', label: 'All Categories' },
        ...categories.map(c => ({ value: c.id.toString(), label: c.name }))
    ];

    return (
        <div className="animate-in fade-in space-y-4">
            <PageHeader
                title="Menu Items"
                actionLabel="Add Menu Item"
                onAction={() => setIsAddOpen(true)}
                icon={<Plus className="w-4 h-4" />}
            />

            <TableToolbar
                searchQuery={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search menu items..."
                filterValue={filterCat}
                onFilterChange={setFilterCat}
                filterOptions={filterOptions}
            />

            <DataTableCard>
                <Table>
                    <DataTableHeader>
                        <DataTableHead className="w-[60px]">Image</DataTableHead>
                        <DataTableHead>Name</DataTableHead>
                        <DataTableHead>Category</DataTableHead>
                        <DataTableHead>Price</DataTableHead>
                        <DataTableHead>Recipe</DataTableHead>
                        <DataTableHead className="text-right">Actions</DataTableHead>
                    </DataTableHeader>
                    <TableBody>
                        {isLoadingItems ? (
                            <DataTableRow>
                                <DataTableCell colSpan={6} className="text-center text-muted-foreground italic py-10">Loading menu items...</DataTableCell>
                            </DataTableRow>
                        ) : filtered.length === 0 ? (
                            <DataTableRow>
                                <DataTableCell colSpan={6} className="text-center text-muted-foreground italic py-10">No items found</DataTableCell>
                            </DataTableRow>
                        ) : (
                            filtered.map((item) => {
                                // Determine if it's emoji or image url
                                const isEmoji = item.image ? /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(item.image) : false;
                                return (
                                    <DataTableRow key={item.id}>
                                        <DataTableCell>
                                            <ImageThumb
                                                emoji={isEmoji ? (item.image as string) : undefined}
                                                imageUrl={!isEmoji && item.image ? (item.image as string) : undefined}
                                            />
                                        </DataTableCell>
                                        <DataTableCell className="font-medium text-[14px]">{item.name}</DataTableCell>
                                        <DataTableCell><CatPill label={item.category?.name || 'Unknown'} /></DataTableCell>
                                        <DataTableCell className="font-mono text-[14px] text-cream">{currency}{Number(item.price).toFixed(2)}</DataTableCell>
                                        <DataTableCell>
                                            {(() => {
                                                if (item.ingredients && item.ingredients.length > 0) {
                                                    const isAvailable = item.ingredients.every(ing => Number(ing.current_stock) >= Number(ing.pivot.quantity_required));
                                                    if (isAvailable) {
                                                        return (
                                                            <span className="flex items-center text-green-500 text-xs gap-1" title="Ingredients available">
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> {item.ingredients.length} ingredients
                                                            </span>
                                                        );
                                                    } else {
                                                        return (
                                                            <span className="flex items-center text-red-500 text-xs gap-1" title="Ingredients missing">
                                                                <XCircle className="w-3.5 h-3.5" /> {item.ingredients.length} ingredients
                                                            </span>
                                                        );
                                                    }
                                                }
                                                return <span className="text-muted-foreground text-xs italic">No recipe</span>;
                                            })()}
                                        </DataTableCell>
                                        <DataTableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => { setEditItem(item); setIsIngredientsOpen(true); }}>
                                                <List className="w-3.5 h-3.5 mr-1" /> Ingredients
                                            </Button>
                                            <Button variant="secondary" size="sm" onClick={() => { setEditItem(item); setIsEditOpen(true); }}>
                                                <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                                            </Button>
                                            <Button variant="destructive" size="sm" className="bg-red-500/15 text-red-500 hover:bg-red-500/25 border border-red-500/20" onClick={() => handleDelete(item.id)}>
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

            <AddMenuItemModal
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                categories={categories}
                onAdd={handleAdd}
            />

            <EditMenuItemModal
                open={isEditOpen}
                onOpenChange={(open) => {
                    setIsEditOpen(open);
                    if (!open) setEditItem(null);
                }}
                categories={categories}
                menuItem={editItem}
                onEdit={handleEdit}
            />

            <LinkedIngredientsModal
                open={isIngredientsOpen}
                onOpenChange={(open) => {
                    setIsIngredientsOpen(open);
                    if (!open) setEditItem(null);
                }}
                menuItem={editItem}
            />
        </div>
    );
}
