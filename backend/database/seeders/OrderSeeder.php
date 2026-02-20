<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\RestaurantTable;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        if (Order::count() > 0) {
            $this->command->warn('Orders already seeded. Skipping.');
            return;
        }

        // Ensure dependencies exist
        $this->call([MenuItemSeeder::class]);

        $tables    = RestaurantTable::all();
        $waiters   = User::where('role', 'waiter')->get();
        $menuItems = MenuItem::all();

        if ($tables->isEmpty() || $menuItems->isEmpty()) {
            $this->command->error('No tables or menu items found. Cannot seed orders.');
            return;
        }

        // Use admin as fallback waiter if no waiters exist
        $users = $waiters->isNotEmpty() ? $waiters : User::all();

        $statuses = ['pending', 'preparing', 'delivered', 'delivered', 'delivered', 'cancelled'];

        /**
         * Generate 30 realistic past orders spread over the last 7 days.
         */
        $orderCount = 0;

        for ($day = 6; $day >= 0; $day--) {
            // 3–6 orders per day
            $ordersToday = rand(3, 6);

            for ($i = 0; $i < $ordersToday; $i++) {
                $table   = $tables->random();
                $user    = $users->random();
                $status  = $statuses[array_rand($statuses)];

                // Random time during restaurant hours (10am – 10pm)
                $orderTime = Carbon::now()
                    ->subDays($day)
                    ->setHour(rand(10, 21))
                    ->setMinute(rand(0, 59))
                    ->setSecond(rand(0, 59));

                // Pick 1–4 random menu items for this order
                $pickedItems = $menuItems->random(rand(1, 4));
                $total = 0;

                $order = Order::create([
                    'table_id'     => $table->id,
                    'user_id'      => $user->id,
                    'status'       => $status,
                    'source'       => 'waiter',
                    'total_amount' => 0, // will update after
                    'created_at'   => $orderTime,
                    'updated_at'   => $orderTime,
                ]);

                foreach ($pickedItems as $menuItem) {
                    $qty       = rand(1, 3);
                    $lineTotal = $menuItem->price * $qty;
                    $total    += $lineTotal;

                    OrderItem::create([
                        'order_id'     => $order->id,
                        'menu_item_id' => $menuItem->id,
                        'quantity'     => $qty,
                        'unit_price'   => $menuItem->price,
                        'created_at'   => $orderTime,
                        'updated_at'   => $orderTime,
                    ]);
                }

                // Update actual total
                $order->update(['total_amount' => $total]);

                // For delivered orders, log stock deductions as an audit trail
                if ($status === 'delivered') {
                    foreach ($pickedItems as $menuItem) {
                        $orderItem = $order->orderItems->where('menu_item_id', $menuItem->id)->first();
                        if (!$orderItem) continue;

                        foreach ($menuItem->ingredients as $ingredient) {
                            $qtyUsed = $ingredient->pivot->quantity_required * $orderItem->quantity;

                            StockMovement::create([
                                'ingredient_id'   => $ingredient->id,
                                'order_id'        => $order->id,
                                'quantity_change' => -$qtyUsed,
                                'type'            => 'deduction',
                                'note'            => "Seeded deduction for Order #{$order->id}",
                                'created_by'      => $user->id,
                                'created_at'      => $orderTime,
                                'updated_at'      => $orderTime,
                            ]);
                        }
                    }
                }

                $orderCount++;
            }
        }

        $this->command->info("Seeded {$orderCount} orders across the last 7 days.");
    }
}
