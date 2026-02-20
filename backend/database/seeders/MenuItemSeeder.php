<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Ingredient;
use App\Models\MenuItem;
use Illuminate\Database\Seeder;

class MenuItemSeeder extends Seeder
{
    public function run(): void
    {
        if (MenuItem::count() > 0) {
            $this->command->warn('Menu items already seeded. Skipping.');
            return;
        }

        // Ensure categories & ingredients exist
        $this->call([CategorySeeder::class, IngredientSeeder::class]);

        // Fetch categories by name for easy reference
        $cat = Category::pluck('id', 'name');

        // Fetch ingredients by name
        $ing = Ingredient::pluck('id', 'name');

        /**
         * Menu item structure:
         * [category_name, item_name, price, image_url, is_available, recipes: [[ingredient_name, qty_required]]]
         */
        $menu = [
            // ─── Starters ────────────────────────────────
            [
                'category' => 'Starters',
                'name'     => 'Chicken Tikka',
                'price'    => 350.00,
                'image'    => 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
                'recipes'  => [['Chicken Breast', 0.200], ['Cooking Oil', 0.030], ['Garam Masala', 10.0], ['Turmeric Powder', 5.0]],
            ],
            [
                'category' => 'Starters',
                'name'     => 'Paneer Tikka',
                'price'    => 300.00,
                'image'    => 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400',
                'recipes'  => [['Paneer', 0.150], ['Capsicum', 0.050], ['Cooking Oil', 0.020], ['Garam Masala', 8.0]],
            ],
            [
                'category' => 'Starters',
                'name'     => 'Crispy Calamari',
                'price'    => 380.00,
                'image'    => 'https://images.unsplash.com/photo-1604909052434-b9d3e9f7d2ef?w=400',
                'recipes'  => [['Fish Fillet', 0.120], ['All-Purpose Flour', 0.050], ['Cooking Oil', 0.050]],
            ],

            // ─── Soups ────────────────────────────────────
            [
                'category' => 'Soups',
                'name'     => 'Tomato Soup',
                'price'    => 180.00,
                'image'    => 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
                'recipes'  => [['Tomato', 0.200], ['Butter', 0.020], ['Fresh Cream', 0.030], ['Onion', 0.050]],
            ],
            [
                'category' => 'Soups',
                'name'     => 'Chicken Clear Soup',
                'price'    => 200.00,
                'image'    => 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=400',
                'recipes'  => [['Chicken Breast', 0.100], ['Ginger', 0.010], ['Garlic', 0.010], ['Spinach', 0.030]],
            ],
            [
                'category' => 'Soups',
                'name'     => 'Spinach & Garlic Soup',
                'price'    => 190.00,
                'image'    => 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400',
                'recipes'  => [['Spinach', 0.150], ['Garlic', 0.020], ['Butter', 0.015], ['Fresh Cream', 0.020]],
            ],

            // ─── Mains ────────────────────────────────────
            [
                'category' => 'Mains',
                'name'     => 'Butter Chicken',
                'price'    => 450.00,
                'image'    => 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400',
                'recipes'  => [
                    ['Chicken Breast', 0.250], ['Butter', 0.030], ['Fresh Cream', 0.050],
                    ['Tomato', 0.100], ['Onion', 0.080], ['Garam Masala', 12.0], ['Turmeric Powder', 5.0],
                ],
            ],
            [
                'category' => 'Mains',
                'name'     => 'Mutton Curry',
                'price'    => 520.00,
                'image'    => 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400',
                'recipes'  => [
                    ['Mutton', 0.250], ['Onion', 0.100], ['Tomato', 0.080],
                    ['Ginger', 0.020], ['Garlic', 0.020], ['Garam Masala', 15.0], ['Cooking Oil', 0.040],
                ],
            ],
            [
                'category' => 'Mains',
                'name'     => 'Palak Paneer',
                'price'    => 380.00,
                'image'    => 'https://images.unsplash.com/photo-1645177628172-a8d7abd0a41e?w=400',
                'recipes'  => [
                    ['Paneer', 0.150], ['Spinach', 0.200], ['Onion', 0.060],
                    ['Garlic', 0.010], ['Ginger', 0.010], ['Fresh Cream', 0.030], ['Butter', 0.020],
                ],
            ],
            [
                'category' => 'Mains',
                'name'     => 'Fish Masala',
                'price'    => 480.00,
                'image'    => 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400',
                'recipes'  => [
                    ['Fish Fillet', 0.200], ['Onion', 0.080], ['Tomato', 0.080],
                    ['Turmeric Powder', 5.0], ['Garam Masala', 10.0], ['Cooking Oil', 0.040],
                ],
            ],
            [
                'category' => 'Mains',
                'name'     => 'Egg Bhurji',
                'price'    => 250.00,
                'image'    => 'https://images.unsplash.com/photo-1612528443702-f6741f70a049?w=400',
                'recipes'  => [
                    ['Eggs', 3], ['Onion', 0.060], ['Tomato', 0.060],
                    ['Capsicum', 0.040], ['Butter', 0.020], ['Garam Masala', 5.0],
                ],
            ],

            // ─── Rice & Noodles ───────────────────────────
            [
                'category' => 'Rice & Noodles',
                'name'     => 'Chicken Biryani',
                'price'    => 420.00,
                'image'    => 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
                'recipes'  => [
                    ['Basmati Rice', 0.180], ['Chicken Breast', 0.200], ['Onion', 0.080],
                    ['Garam Masala', 15.0], ['Cooking Oil', 0.030], ['Fresh Cream', 0.030],
                ],
            ],
            [
                'category' => 'Rice & Noodles',
                'name'     => 'Mutton Biryani',
                'price'    => 500.00,
                'image'    => 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400',
                'recipes'  => [
                    ['Basmati Rice', 0.180], ['Mutton', 0.200], ['Onion', 0.080],
                    ['Garam Masala', 15.0], ['Cooking Oil', 0.030], ['Fresh Cream', 0.030],
                ],
            ],
            [
                'category' => 'Rice & Noodles',
                'name'     => 'Veg Fried Rice',
                'price'    => 220.00,
                'image'    => 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
                'recipes'  => [
                    ['Basmati Rice', 0.150], ['Capsicum', 0.040], ['Eggs', 1],
                    ['Cooking Oil', 0.030], ['Garlic', 0.010],
                ],
            ],

            // ─── Breads ───────────────────────────────────
            [
                'category' => 'Breads',
                'name'     => 'Butter Naan',
                'price'    => 60.00,
                'image'    => 'https://images.unsplash.com/photo-1599458252573-56ae36120de1?w=400',
                'recipes'  => [['All-Purpose Flour', 0.080], ['Butter', 0.015], ['Milk', 0.030]],
            ],
            [
                'category' => 'Breads',
                'name'     => 'Garlic Naan',
                'price'    => 75.00,
                'image'    => 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
                'recipes'  => [['All-Purpose Flour', 0.080], ['Garlic', 0.020], ['Butter', 0.020]],
            ],
            [
                'category' => 'Breads',
                'name'     => 'Tandoori Roti',
                'price'    => 40.00,
                'image'    => 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
                'recipes'  => [['All-Purpose Flour', 0.070], ['Cooking Oil', 0.010]],
            ],

            // ─── Beverages ────────────────────────────────
            [
                'category' => 'Beverages',
                'name'     => 'Mango Lassi',
                'price'    => 150.00,
                'image'    => 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400',
                'recipes'  => [['Milk', 0.200]],
            ],
            [
                'category' => 'Beverages',
                'name'     => 'Masala Chai',
                'price'    => 80.00,
                'image'    => 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400',
                'recipes'  => [['Milk', 0.150], ['Ginger', 0.005]],
            ],
            [
                'category' => 'Beverages',
                'name'     => 'Fresh Lime Soda',
                'price'    => 100.00,
                'image'    => 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
                'recipes'  => [],  // No tracked ingredients
            ],

            // ─── Desserts ─────────────────────────────────
            [
                'category' => 'Desserts',
                'name'     => 'Gulab Jamun',
                'price'    => 120.00,
                'image'    => 'https://images.unsplash.com/photo-1666711983467-c8f8d01fe671?w=400',
                'recipes'  => [['Milk', 0.100], ['All-Purpose Flour', 0.030], ['Cooking Oil', 0.100]],
            ],
            [
                'category' => 'Desserts',
                'name'     => 'Kulfi',
                'price'    => 140.00,
                'image'    => 'https://images.unsplash.com/photo-1615481777125-b1de5ea4e1be?w=400',
                'recipes'  => [['Milk', 0.200], ['Fresh Cream', 0.050]],
            ],

            // ─── Specials ─────────────────────────────────
            [
                'category' => 'Specials',
                'name'     => 'Chef\'s Thali',
                'price'    => 650.00,
                'image'    => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
                'recipes'  => [
                    ['Basmati Rice', 0.180], ['Chicken Breast', 0.150], ['Paneer', 0.100],
                    ['All-Purpose Flour', 0.080], ['Spinach', 0.100], ['Butter', 0.030],
                ],
            ],
            [
                'category' => 'Specials',
                'name'     => 'Weekend BBQ Platter',
                'price'    => 850.00,
                'image'    => 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
                'recipes'  => [
                    ['Chicken Breast', 0.300], ['Mutton', 0.200], ['Capsicum', 0.080],
                    ['Onion', 0.080], ['Cooking Oil', 0.050], ['Garam Masala', 20.0],
                ],
            ],
        ];

        foreach ($menu as $item) {
            $categoryId = $cat[$item['category']] ?? null;
            if (!$categoryId) continue;

            $menuItem = MenuItem::create([
                'category_id'  => $categoryId,
                'name'         => $item['name'],
                'price'        => $item['price'],
                'image'        => $item['image'],
                'is_available' => true,
            ]);

            // Attach recipes
            foreach ($item['recipes'] as [$ingredientName, $qty]) {
                $ingredientId = $ing[$ingredientName] ?? null;
                if (!$ingredientId) continue;

                $menuItem->ingredients()->attach($ingredientId, [
                    'quantity_required' => $qty,
                ]);
            }
        }

        $this->command->info('Seeded ' . count($menu) . ' menu items with recipes.');
    }
}
