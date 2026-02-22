import { create } from 'zustand';
import axios from 'axios';
import type { Ingredient } from '@/components/inventory/ingredients/IngredientModals';

interface InventoryState {
    ingredients: Ingredient[];
    isLoading: boolean;
    criticalCount: number;
    lowCount: number;
    fetchIngredients: () => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set) => ({
    ingredients: [],
    isLoading: false,
    criticalCount: 0,
    lowCount: 0,

    fetchIngredients: async () => {
        set({ isLoading: true });
        try {
            const token = localStorage.getItem('token');
            const baseURL = `${import.meta.env.VITE_API_BASE_URL}/api`;
            const response = await axios.get(`${baseURL}/ingredients`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                let critical = 0;
                let low = 0;

                const mappedIngredients = response.data.data.map((ing: any) => {
                    const stockNum = parseFloat(ing.current_stock);
                    const minNum = parseFloat(ing.minimum_stock);
                    let status: 'good' | 'warn' | 'low' = 'good';

                    if (stockNum <= minNum) {
                        status = 'low';
                        critical++;
                    } else if (stockNum <= minNum * 1.5) {
                        status = 'warn';
                        low++;
                    }

                    return {
                        ...ing,
                        current_stock: stockNum,
                        minimum_stock: minNum,
                        status
                    };
                });

                set({
                    ingredients: mappedIngredients,
                    criticalCount: critical,
                    lowCount: low
                });
            }
        } catch (error) {
            console.error('Failed to fetch ingredients:', error);
        } finally {
            set({ isLoading: false });
        }
    }
}));
