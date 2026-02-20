import { useEffect, useState } from 'react';
import { Settings, Save } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { toast } from 'sonner';

export function SettingsSidebar({
    open,
    onOpenChange
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { settings, updateSettings } = useSettingsStore();

    // Local state for edits
    const [localValues, setLocalValues] = useState<Record<number, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Sync state when drawer opens or settings reload
    useEffect(() => {
        if (open && settings.length > 0) {
            const initVals: Record<number, string> = {};
            const populate = (nodes: any[]) => {
                nodes.forEach((n) => {
                    if (n.type !== 'group' && n.value !== null) {
                        initVals[n.id] = n.value;
                    }
                    if (n.children?.length) {
                        populate(n.children);
                    }
                });
            };
            populate(settings);
            setLocalValues(initVals);
        }
    }, [open, settings]);

    const handleChange = (id: number, val: string) => {
        setLocalValues((prev) => ({ ...prev, [id]: val }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updates = Object.entries(localValues).map(([id, value]) => ({
                id: Number(id),
                value
            }));
            await updateSettings(updates);
            toast.success('Settings saved successfully');
            onOpenChange(false);
        } catch (e: any) {
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const renderSettingInput = (setting: any) => {
        if (setting.type === 'string' || setting.type === 'number') {
            return (
                <div key={setting.id} className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-muted-foreground">{setting.label}</label>
                    <Input
                        value={localValues[setting.id] ?? ''}
                        onChange={(e) => handleChange(setting.id, e.target.value)}
                        type={setting.type === 'number' ? 'number' : 'text'}
                        className="bg-accent/50 border-border/50 focus-visible:ring-primary/30 h-9"
                    />
                </div>
            );
        }
        // Additional types like 'boolean' could be handled with Switch here
        return null;
    };

    const renderGroup = (group: any) => {
        if (group.type !== 'group') return null;
        return (
            <div key={group.id} className="mb-6 space-y-4">
                <h4 className="font-serif text-lg text-foreground border-b border-border/50 pb-2">
                    {group.label}
                </h4>
                <div className="space-y-4">
                    {group.children?.map((child: any) => renderSettingInput(child))}
                </div>
            </div>
        );
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0 border-l border-border/50 bg-background/95 backdrop-blur-xl">
                <SheetHeader className="p-6 border-b border-border/50 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary" />
                            <SheetTitle className="font-serif text-2xl m-0">Settings</SheetTitle>
                        </div>
                        {/* Shadcn Sheet includes a close button by default, but we can stylize or just leave it */}
                    </div>
                    <SheetDescription className="text-sm">
                        Manage your restaurant and application configurations.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-2">
                    {settings.map((group) => renderGroup(group))}
                </div>

                <div className="p-6 border-t border-border/50 shrink-0 bg-background/50 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="gap-2 shrink-0">
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
