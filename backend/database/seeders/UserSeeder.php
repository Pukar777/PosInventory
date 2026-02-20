<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1 Admin
        \App\Models\User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // 2 Waiters
        \App\Models\User::factory()->create([
            'name' => 'John Waiter',
            'email' => 'waiter1@example.com',
            'password' => bcrypt('password'),
            'role' => 'waiter',
        ]);

        \App\Models\User::factory()->create([
            'name' => 'Jane Waiter',
            'email' => 'waiter2@example.com',
            'password' => bcrypt('password'),
            'role' => 'waiter',
        ]);
    }
}
