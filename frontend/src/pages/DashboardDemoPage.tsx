import { DashboardGrid } from '@/components/dashboard';

export default function DashboardDemoPage() {
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold font-serif text-foreground">Dashboard <span className="text-amber-500 italic">Overview</span></h1>
            </div>
            <DashboardGrid />
        </div>
    );
}
