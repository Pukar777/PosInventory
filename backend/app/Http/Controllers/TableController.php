<?php

namespace App\Http\Controllers;

use App\Models\RestaurantTable;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TableController extends Controller
{
    public function index()
    {
        return response()->json(RestaurantTable::orderBy('number')->get());
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

        return response()->json($table, 201);
    }

    public function destroy(RestaurantTable $table)
    {
        $table->delete();
        return response()->json(['message' => 'Table deleted.']);
    }
}
