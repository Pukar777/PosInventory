<?php

namespace App\Services;

use App\Models\Ingredient;
use App\Models\Order;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;

class StockDeductionService
{
    /**
     * Deduct stock for all ingredients used by items in an order.
     * Uses lockForUpdate() to prevent race conditions on concurrent orders.
     */
    public function deduct(Order $order): void
    {
        $order->load('orderItems.menuItem.ingredients');

        DB::transaction(function () use ($order) {
            foreach ($order->orderItems as $orderItem) {
                $menuItem = $orderItem->menuItem;

                foreach ($menuItem->ingredients as $ingredient) {
                    $quantityNeeded = $ingredient->pivot->quantity_required * $orderItem->quantity;

                    // Lock row to prevent concurrent reads during stock change
                    $lockedIngredient = Ingredient::lockForUpdate()->find($ingredient->id);

                    if ($lockedIngredient->current_stock < $quantityNeeded) {
                        throw new \RuntimeException(
                            "Insufficient stock for ingredient: {$lockedIngredient->name}"
                        );
                    }

                    $lockedIngredient->decrement('current_stock', $quantityNeeded);

                    // Log the stock movement
                    StockMovement::create([
                        'ingredient_id'   => $lockedIngredient->id,
                        'order_id'        => $order->id,
                        'quantity_change' => -$quantityNeeded,
                        'type'            => 'deduction',
                        'note'            => "Auto-deducted for Order #{$order->id}",
                        'created_by'      => $order->user_id,
                    ]);
                }
            }
        });
    }

    /**
     * Reverse a stock deduction (e.g. order cancelled after being placed).
     */
    public function reverse(Order $order): void
    {
        $order->load('orderItems.menuItem.ingredients');

        DB::transaction(function () use ($order) {
            foreach ($order->orderItems as $orderItem) {
                $menuItem = $orderItem->menuItem;

                foreach ($menuItem->ingredients as $ingredient) {
                    $quantityToRestore = $ingredient->pivot->quantity_required * $orderItem->quantity;

                    Ingredient::lockForUpdate()->find($ingredient->id)
                        ->increment('current_stock', $quantityToRestore);

                    StockMovement::create([
                        'ingredient_id'   => $ingredient->id,
                        'order_id'        => $order->id,
                        'quantity_change' => +$quantityToRestore,
                        'type'            => 'adjustment',
                        'note'            => "Reversed for cancelled Order #{$order->id}",
                        'created_by'      => $order->user_id,
                    ]);
                }
            }
        });
    }

    /**
     * Check if stock has already been deducted for this order.
     */
    public function hasDeducted(Order $order): bool
    {
        return StockMovement::where('order_id', $order->id)
            ->where('type', 'deduction')
            ->exists();
    }
}
