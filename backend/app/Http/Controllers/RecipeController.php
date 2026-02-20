<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Http\Requests\RecipeRequest;
use App\Services\ApiResponse;
use Illuminate\Support\Facades\DB;
use Exception;

class RecipeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Get all menu items with their ingredients
        $menuItems = MenuItem::with('ingredients')->orderBy('id', 'desc')->get();
        return ApiResponse::success($menuItems, 'Recipes retrieved successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $menuItem = MenuItem::with('ingredients')->findOrFail($id);
        return ApiResponse::success($menuItem, 'Recipe retrieved successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(RecipeRequest $request, string $id)
    {
        try {
            DB::beginTransaction();

            $menuItem = MenuItem::findOrFail($id);
            $validated = $request->validated();

            if (array_key_exists('ingredients', $validated)) {
                if (!empty($validated['ingredients'])) {
                    $ingredientsData = [];
                    foreach ($validated['ingredients'] as $ingredient) {
                        $ingredientsData[$ingredient['ingredient_id']] = ['quantity_required' => $ingredient['quantity_required']];
                    }
                    $menuItem->ingredients()->sync($ingredientsData);
                } else {
                    $menuItem->ingredients()->detach();
                }
            }

            DB::commit();

            return ApiResponse::success($menuItem->load('ingredients'), 'Recipe updated successfully.');
        } catch (Exception $e) {
            DB::rollBack();
            return ApiResponse::error('Failed to update recipe.', 500, ['error' => $e->getMessage()]);
        }
    }
}
