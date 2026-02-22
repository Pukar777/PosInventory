<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use Illuminate\Http\Request;
use App\Services\ApiResponse;

class IngredientController extends Controller
{
    public function index()
    {
        return ApiResponse::success(Ingredient::with('menuItems')->get(), 'Ingredients retrieved successfully.');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:ingredients,name',
            'unit' => 'required|in:kg,gram,piece,liter,ml',
            'current_stock' => 'nullable|numeric|min:0',
            'minimum_stock' => 'nullable|numeric|min:0',
        ]);
        $ingredient = Ingredient::create($validated);
        return ApiResponse::success($ingredient, 'Ingredient created successfully.', 201);
    }

    public function show(Ingredient $ingredient)
    {
        return ApiResponse::success($ingredient->load('menuItems'), 'Ingredient retrieved successfully.');
    }

    public function update(Request $request, Ingredient $ingredient)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:ingredients,name,' . $ingredient->id,
            'unit' => 'sometimes|required|in:kg,gram,piece,liter,ml',
            'current_stock' => 'sometimes|nullable|numeric|min:0',
            'minimum_stock' => 'sometimes|nullable|numeric|min:0',
        ]);
        $ingredient->update($validated);
        return ApiResponse::success($ingredient, 'Ingredient updated successfully.');
    }

    public function destroy(Ingredient $ingredient)
    {
        $ingredient->delete();
        return ApiResponse::success(null, 'Ingredient deleted successfully.', 200);
    }
}
