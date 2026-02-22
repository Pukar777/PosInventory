<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MenuItem;
use App\Models\Ingredient;
use App\Models\Order;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        $startOfWeek = Carbon::now()->startOfWeek();

        // Menu Items
        $totalMenuItems = MenuItem::count();
        $menuItemsAddedThisWeek = MenuItem::where('created_at', '>=', $startOfWeek)->count();

        // Ingredients
        $totalIngredients = Ingredient::count();
        $lowStockIngredientsCount = Ingredient::whereRaw('current_stock <= minimum_stock * 1.5')->count();

        // Orders Today
        $ordersToday = Order::whereDate('created_at', $today)->count();
        $ordersYesterday = Order::whereDate('created_at', $yesterday)->count();

        $ordersGrowth = 0;
        if ($ordersYesterday > 0) {
            $ordersGrowth = (($ordersToday - $ordersYesterday) / $ordersYesterday) * 100;
        } elseif ($ordersToday > 0) {
            $ordersGrowth = 100;
        }

        // Revenue Today
        $revenueToday = Order::whereDate('created_at', $today)->sum('total_amount');
        $revenueYesterday = Order::whereDate('created_at', $yesterday)->sum('total_amount');

        $revenueGrowth = 0;
        if ($revenueYesterday > 0) {
            $revenueGrowth = (($revenueToday - $revenueYesterday) / $revenueYesterday) * 100;
        } elseif ($revenueToday > 0) {
            $revenueGrowth = 100;
        }

        // Recent Orders
        // Recent Orders
        $recentOrdersQuery = Order::with('orderItems.menuItem')->latest();

        if (request()->has('time_filter')) {
            $filter = request()->input('time_filter');
            $now = Carbon::now();

            $recentOrdersQuery->where(function ($q) use ($filter, $now) {
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

        $recentOrdersList = $recentOrdersQuery
            ->take(5)
            ->get()
            ->map(function ($order) {
                $itemsConfig = $order->orderItems->map(function ($item) {
                    $name = $item->menuItem ? $item->menuItem->name : 'Unknown';
                    return $name . ' ×' . $item->quantity;
                })->implode(', ');

                $statusMap = [
                    'pending' => 'Pending',
                    'preparing' => 'Preparing',
                    'ready' => 'Preparing',
                    'delivered' => 'Delivered',
                    'cancelled' => 'Cancelled'
                ];

                $status = $statusMap[strtolower($order->status)] ?? ucfirst($order->status);
                if (strtolower($order->status) === 'completed') $status = 'Delivered';

                return [
                    'id' => '#' . str_pad($order->id, 4, '0', STR_PAD_LEFT),
                    'itemsConfig' => $itemsConfig ?: 'No items',
                    'amount' => (float) $order->total_amount,
                    'status' => $status,
                ];
            });

        // Low Stock Alerts
        $lowStockAlertsList = Ingredient::whereRaw('current_stock <= minimum_stock * 1.5')
            ->get()
            ->map(function ($ingredient) {
                $level = $ingredient->current_stock <= $ingredient->minimum_stock ? 'critical' : 'warning';
                return [
                    'id' => (string) $ingredient->id,
                    'name' => $ingredient->name,
                    'quantity' => $ingredient->current_stock . ' ' . $ingredient->unit,
                    'min' => $ingredient->minimum_stock . ' ' . $ingredient->unit,
                    'level' => $level,
                ];
            });

        return response()->json([
            'cards' => [
                'menuItems' => [
                    'total' => $totalMenuItems,
                    'addedThisWeek' => $menuItemsAddedThisWeek,
                ],
                'ingredients' => [
                    'total' => $totalIngredients,
                    'lowStock' => $lowStockIngredientsCount,
                ],
                'orders' => [
                    'today' => $ordersToday,
                    'growth' => round($ordersGrowth, 1),
                ],
                'revenue' => [
                    'today' => round($revenueToday, 2),
                    'growth' => round($revenueGrowth, 1),
                ],
            ],
            'recentOrders' => $recentOrdersList,
            'lowStockAlerts' => $lowStockAlertsList,
        ]);
    }
}
