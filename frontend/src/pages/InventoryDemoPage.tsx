import { useState } from 'react';
import { CategoriesView, IngredientsView, MenuItemsView, RecipesView } from '@/components/inventory';
import { cn } from '@/lib/utils';

type Tab = 'categories' | 'ingredients' | 'menu' | 'recipes';

export default function InventoryDemoPage() {
    const [activeTab, setActiveTab] = useState<Tab>('categories');

    const tabs: { id: Tab; label: string }[] = [
        { id: 'categories', label: 'Categories' },
        { id: 'ingredients', label: 'Ingredients' },
        { id: 'menu', label: 'Menu Items' },
        { id: 'recipes', label: 'Recipes' }
    ];

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold font-serif text-foreground">
                    Inventory <span className="text-amber-500 italic">Demo</span>
                </h1>
            </div>

            <div className="flex items-center gap-2 mb-6 border-b border-border pb-px">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium transition-colors border-b-2",
                            activeTab === tab.id
                                ? "border-amber-500 text-amber-500"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 w-full max-w-5xl">
                {activeTab === 'categories' && <CategoriesView />}
                {activeTab === 'ingredients' && <IngredientsView />}
                {activeTab === 'menu' && <MenuItemsView />}
                {activeTab === 'recipes' && <RecipesView />}
            </div>
        </div>
    );
}
