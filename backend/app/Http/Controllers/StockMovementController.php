<?php

namespace App\Http\Controllers;

use App\Models\StockMovement;
use Illuminate\Http\Request;

class StockMovementController extends Controller
{
    /**
     * Display a listing of stock movements with optional filtering.
     */
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 50);

        $query = StockMovement::with(['ingredient', 'order', 'createdBy']);

        // 1. Start Date and End Date
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->query('start_date'));
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->query('end_date'));
        }

        // 2. Ingredients
        if ($request->filled('ingredient_id')) {
            $query->where('ingredient_id', $request->query('ingredient_id'));
        }

        // 3. Menu Items (filter movements linked to an order that contains the menu item)
        if ($request->filled('menu_item_id')) {
            $menuItemId = $request->query('menu_item_id');
            $query->whereHas('order.orderItems', function ($q) use ($menuItemId) {
                $q->where('menu_item_id', $menuItemId);
            });
        }

        // 4. Stock In/Out
        if ($request->filled('movement_type')) {
            $type = $request->query('movement_type');
            if ($type === 'in') {
                $query->where('quantity_change', '>', 0);
            } elseif ($type === 'out') {
                $query->where('quantity_change', '<', 0);
            }
        }

        // 5. Waiter/User
        if ($request->filled('user_id')) {
            $userId = $request->query('user_id');
            // Check if the user created the movement manually or if they placed the order
            $query->where(function ($q) use ($userId) {
                $q->where('created_by', $userId)
                  ->orWhereHas('order', function ($oq) use ($userId) {
                      $oq->where('user_id', $userId);
                  });
            });
        }

        $movements = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($movements);
    }
}
