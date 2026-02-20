import { create } from 'zustand';
import axios from 'axios';

interface Setting {
    id: number;
    parent_id: number | null;
    key: string;
    label: string;
    value: string | null;
    type: string;
    children?: Setting[];
}

interface SettingsState {
    settings: Setting[];
    isLoading: boolean;
    fetchSettings: () => Promise<void>;
    updateSettings: (updates: { id: number; value: string }[]) => Promise<void>;
    getSettingValue: (key: string, defaultValue?: string) => string;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    settings: [],
    isLoading: false,

    fetchSettings: async () => {
        set({ isLoading: true });
        try {
            const token = localStorage.getItem('token');
            const baseURL = `http://${window.location.hostname}:8000/api`;
            const response = await axios.get(`${baseURL}/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                set({ settings: response.data.data });
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    updateSettings: async (updates) => {
        try {
            const token = localStorage.getItem('token');
            const baseURL = `http://${window.location.hostname}:8000/api`;
            const response = await axios.post(`${baseURL}/settings`, { settings: updates }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                // Refresh local settings to reflect updates perfectly
                await get().fetchSettings();
            }
        } catch (error) {
            console.error('Failed to update settings:', error);
            throw error;
        }
    },

    getSettingValue: (key: string, defaultValue = '') => {
        const { settings } = get();
        // search recursively
        let foundValue = defaultValue;

        const searchTree = (nodes: Setting[]) => {
            for (const node of nodes) {
                if (node.key === key) {
                    foundValue = node.value ?? defaultValue;
                    return true; // found
                }
                if (node.children && node.children.length > 0) {
                    if (searchTree(node.children)) return true;
                }
            }
            return false;
        };

        searchTree(settings);
        return foundValue;
    }
}));
