<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $generalGroup = Setting::create([
            'key' => 'general',
            'label' => 'General Settings',
            'value' => null,
            'type' => 'group',
            'parent_id' => null,
        ]);

        Setting::create([
            'key' => 'currency_symbol',
            'label' => 'Currency Symbol',
            'value' => 'Rs. ',
            'type' => 'string',
            'parent_id' => $generalGroup->id,
        ]);

        $restaurantGroup = Setting::create([
            'key' => 'restaurant_details',
            'label' => 'Restaurant Details',
            'value' => null,
            'type' => 'group',
            'parent_id' => null,
        ]);

        Setting::create([
            'key' => 'restaurant_name',
            'label' => 'Restaurant Name',
            'value' => 'Digital Waiter!',
            'type' => 'string',
            'parent_id' => $restaurantGroup->id,
        ]);
    }
}
