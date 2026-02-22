<?php

namespace App\Http\Controllers;

use App\Models\RestaurantTable;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Services\ApiResponse;

class TableController extends Controller
{
    public function index()
    {
        $tables = RestaurantTable::orderBy('number')->get();
        return ApiResponse::success($tables, 'Tables retrieved successfully');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'number' => 'required|integer|unique:tables,number',
        ]);

        $table = RestaurantTable::create([
            'number'   => $validated['number'],
            'status'   => 'available',
            'qr_token' => Str::uuid(),
        ]);

        return ApiResponse::success($table, 'Table created successfully', 201);
    }

    public function destroy(RestaurantTable $table)
    {
        $table->delete();
        return ApiResponse::success(null, 'Table deleted successfully', 200);
    }
}
