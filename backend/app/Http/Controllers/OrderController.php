<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\RestaurantTable;
use App\Services\StockDeductionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\ApiResponse;

class OrderController extends Controller
{
    public function __construct(private StockDeductionService $stockService) {}

    /**
     * GET /api/orders
     * Returns all orders (admin) or today's orders depending on role.
     */
    public function index(Request $request)
    {
        $query = Order::with(['table', 'orderItems.menuItem', 'user'])->latest();

        if ($request->has('time_filter')) {
            $filter = $request->input('time_filter');
            $now = now();

            $query->where(function ($q) use ($filter, $now) {
                $q->whereIn('status', ['pending', 'preparing']);

                switch ($filter) {
                    case '15mins':
                        $q->orWhere('created_at', '>=', $now->copy()->subMinutes(15));
                        break;
                    case '30mins':
                        $q->orWhere('created_at', '>=', $now->copy()->subMinutes(30));
                        break;
                    case '45mins':
                        $q->orWhere('created_at', '>=', $now->copy()->subMinutes(45));
                        break;
                    case '60mins':
                        $q->orWhere('created_at', '>=', $now->copy()->subMinutes(60));
                        break;
                    case '120mins':
                        $q->orWhere('created_at', '>=', $now->copy()->subMinutes(120));
                        break;
                    case '3hrs':
                        $q->orWhere('created_at', '>=', $now->copy()->subHours(3));
                        break;
                    case '5hrs':
                        $q->orWhere('created_at', '>=', $now->copy()->subHours(5));
                        break;
                    case '8hrs':
                        $q->orWhere('created_at', '>=', $now->copy()->subHours(8));
                        break;
                    case '10hrs':
                        $q->orWhere('created_at', '>=', $now->copy()->subHours(10));
                        break;
                    case 'Today':
                        $q->orWhereDate('created_at', $now->toDateString());
                        break;
                    case 'Week':
                        $q->orWhere('created_at', '>=', $now->copy()->subDays(7));
                        break;
                }
            });
        }

        $orders = $query->get();

        return response()->json($orders);
    }

    /**
     * POST /api/orders
     * Place a new order. Expects: table_id, items: [{menu_item_id, quantity, custom_note?}]
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_id'             => 'required|exists:tables,id',
            'items'                => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity'     => 'required|integer|min:1',
            'items.*.custom_note'  => 'nullable|string|max:255',
        ]);

        $order = DB::transaction(function () use ($validated, $request) {
            // Calculate total
            $total = 0;
            $itemsData = [];

            foreach ($validated['items'] as $item) {
                $menuItem = \App\Models\MenuItem::findOrFail($item['menu_item_id']);
                $lineTotal = $menuItem->price * $item['quantity'];
                $total += $lineTotal;

                $itemsData[] = [
                    'menu_item_id' => $item['menu_item_id'],
                    'quantity'     => $item['quantity'],
                    'unit_price'   => $menuItem->price,
                    'custom_note'  => $item['custom_note'] ?? null,
                ];
            }

            // Create the order
            $order = Order::create([
                'table_id'     => $validated['table_id'],
                'user_id'      => $request->user()->id,
                'status'       => 'pending',
                'source'       => 'waiter',
                'total_amount' => $total,
            ]);

            // Create order items
            $order->orderItems()->createMany($itemsData);

            return $order;
        });

        // Deduct stock (outside the order transaction so order is committed first)
        try {
            $this->stockService->deduct($order);
        } catch (\RuntimeException $e) {
            // Stock deduction failed — cancel the order
            $order->update(['status' => 'cancelled']);
            return ApiResponse::error($e->getMessage(), 422);
        }

        // Mark table as occupied
        RestaurantTable::find($validated['table_id'])->update(['status' => 'occupied']);

        return ApiResponse::success(
            $order->load(['table', 'orderItems.menuItem']),
            'Order created successfully',
            201
        );
    }

    /**
     * GET /api/orders/{id}
     */
    public function show(Order $order)
    {
        return response()->json(
            $order->load(['table', 'orderItems.menuItem', 'user'])
        );
    }

    /**
     * PATCH /api/orders/{id}/status
     * Update order status: pending → preparing → delivered | cancelled
     */
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,preparing,delivered,cancelled',
        ]);

        $previousStatus = $order->status;

        $order->update(['status' => $validated['status']]);

        // Reverse stock if cancelling a non-pending order that was already deducted
        if ($validated['status'] === 'cancelled' && $previousStatus !== 'cancelled') {
            try {
                $this->stockService->reverse($order);
            } catch (\Exception $e) {
                // Log but don't block the status update
                \Log::warning("Stock reversal failed for order #{$order->id}: " . $e->getMessage());
            }

            // Mark table as available if no other active orders
            $activeOrders = Order::where('table_id', $order->table_id)
                ->whereNotIn('status', ['delivered', 'cancelled'])
                ->where('id', '!=', $order->id)
                ->exists();

            if (!$activeOrders) {
                RestaurantTable::find($order->table_id)->update(['status' => 'available']);
            }
        }

        // Mark table available when delivered
        if ($validated['status'] === 'delivered') {
            $activeOrders = Order::where('table_id', $order->table_id)
                ->whereNotIn('status', ['delivered', 'cancelled'])
                ->where('id', '!=', $order->id)
                ->exists();

            if (!$activeOrders) {
                RestaurantTable::find($order->table_id)->update(['status' => 'available']);
            }
        }

        return response()->json($order->load(['table', 'orderItems.menuItem']));
    }

    /**
     * GET /api/tables
     * Return all restaurant tables with status.
     */
    public function tables()
    {
        return response()->json(RestaurantTable::orderBy('number')->get());
    }
}
