<?php

namespace Database\Seeders;

use App\Models\Ingredient;
use Illuminate\Database\Seeder;

class IngredientSeeder extends Seeder
{
    public function run(): void
    {
        if (Ingredient::count() > 0) {
            $this->command->warn('Ingredients already seeded. Skipping.');
            return;
        }

        // [name, unit, current_stock, minimum_stock]
        $ingredients = [
            // Proteins
            ['Chicken Breast',      'kg',    15.000,  2.000],
            ['Mutton',              'kg',    10.000,  2.000],
            ['Paneer',              'kg',     8.000,  1.000],
            ['Eggs',                'piece', 60.000, 12.000],
            ['Fish Fillet',         'kg',     6.000,  1.000],

            // Vegetables
            ['Onion',               'kg',    20.000,  3.000],
            ['Tomato',              'kg',    15.000,  3.000],
            ['Garlic',              'kg',     5.000,  0.500],
            ['Ginger',              'kg',     3.000,  0.500],
            ['Capsicum',            'kg',     4.000,  0.500],
            ['Spinach',             'kg',     5.000,  1.000],

            // Grains & Dairy
            ['Basmati Rice',        'kg',    30.000,  5.000],
            ['All-Purpose Flour',   'kg',    25.000,  5.000],
            ['Butter',              'kg',     4.000,  0.500],
            ['Fresh Cream',         'liter',  5.000,  1.000],
            ['Milk',                'liter', 10.000,  2.000],

            // Liquids & Spices
            ['Cooking Oil',         'liter', 15.000,  2.000],
            ['Cumin Seeds',         'gram',  500.000, 100.000],
            ['Garam Masala',        'gram',  300.000,  50.000],
            ['Turmeric Powder',     'gram',  200.000,  50.000],
        ];

        foreach ($ingredients as [$name, $unit, $stock, $min]) {
            Ingredient::create([
                'name'          => $name,
                'unit'          => $unit,
                'current_stock' => $stock,
                'minimum_stock' => $min,
            ]);
        }

        $this->command->info('Seeded ' . count($ingredients) . ' ingredients.');
    }
}
