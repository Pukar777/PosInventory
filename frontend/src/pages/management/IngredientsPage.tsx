import { IngredientsView } from '@/components/inventory';

export default function IngredientsPage() {
    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex-1 w-full">
                <IngredientsView />
            </div>
        </div>
    );
}
