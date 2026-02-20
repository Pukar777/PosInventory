import { CategoriesView } from '@/components/inventory';

export default function CategoriesPage() {
    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex-1 w-full">
                <CategoriesView />
            </div>
        </div>
    );
}
