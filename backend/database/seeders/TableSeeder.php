<?php

namespace Database\Seeders;

use App\Models\RestaurantTable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TableSeeder extends Seeder
{
    public function run(): void
    {
        if (RestaurantTable::count() > 0) {
            return; // Already seeded
        }

        for ($i = 1; $i <= 10; $i++) {
            RestaurantTable::create([
                'number'   => $i,
                'status'   => 'available',
                'qr_token' => Str::uuid(),
            ]);
        }

        $this->command->info('Seeded 10 restaurant tables.');
    }
}
