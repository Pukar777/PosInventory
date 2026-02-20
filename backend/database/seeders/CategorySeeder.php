<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        if (Category::count() > 0) {
            $this->command->warn('Categories already seeded. Skipping.');
            return;
        }

        $categories = [
            'Starters',
            'Soups',
            'Mains',
            'Rice & Noodles',
            'Breads',
            'Beverages',
            'Desserts',
            'Specials',
        ];

        foreach ($categories as $name) {
            Category::create(['name' => $name]);
        }

        $this->command->info('Seeded ' . count($categories) . ' categories.');
    }
}
