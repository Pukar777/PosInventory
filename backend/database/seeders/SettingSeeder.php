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
        $generalGroup = Setting::updateOrCreate(
            ['key' => 'general'],
            [
                'label' => 'General Settings',
                'value' => null,
                'type' => 'group',
                'parent_id' => null,
            ]
        );

        Setting::updateOrCreate(
            ['key' => 'currency_symbol'],
            [
                'label' => 'Currency Symbol',
                'value' => 'Rs. ',
                'type' => 'string',
                'parent_id' => $generalGroup->id,
            ]
        );

        Setting::updateOrCreate(
            ['key' => 'default_time_filter'],
            [
                'label' => 'Default Time Filter',
                'value' => '30mins',
                'type' => 'select',
                'options' => [
                    ['value' => '15mins', 'label' => '15 Minutes'],
                    ['value' => '30mins', 'label' => '30 Minutes'],
                    ['value' => '45mins', 'label' => '45 Minutes'],
                    ['value' => '60mins', 'label' => '1 Hour'],
                    ['value' => '120mins', 'label' => '2 Hours'],
                    ['value' => 'Today', 'label' => 'Today'],
                ],
                'parent_id' => $generalGroup->id,
            ]
        );

        Setting::updateOrCreate(
            ['key' => 'stock_deduction_timing'],
            [
                'label' => 'Stock Deduction Timing',
                'value' => 'delivered',
                'type' => 'select',
                'options' => [
                    ['value' => 'delivered', 'label' => 'When Order is Delivered (Default)'],
                    ['value' => 'placed', 'label' => 'When Order is Placed'],
                ],
                'parent_id' => $generalGroup->id,
            ]
        );

        $restaurantGroup = Setting::updateOrCreate(
            ['key' => 'restaurant_details'],
            [
                'label' => 'Restaurant Details',
                'value' => null,
                'type' => 'group',
                'parent_id' => null,
            ]
        );

        Setting::updateOrCreate(
            ['key' => 'restaurant_name'],
            [
                'label' => 'Restaurant Name',
                'value' => 'Digital Waiter!',
                'type' => 'string',
                'parent_id' => $restaurantGroup->id,
            ]
        );
    }
}
