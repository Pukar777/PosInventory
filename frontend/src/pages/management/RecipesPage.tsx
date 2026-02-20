import { RecipesView } from '@/components/inventory';

export default function RecipesPage() {
    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex-1 w-full">
                <RecipesView />
            </div>
        </div>
    );
}
