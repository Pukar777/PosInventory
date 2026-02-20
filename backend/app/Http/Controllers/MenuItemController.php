<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\Http\Request;

class MenuItemController extends Controller
{
    public function index()
    {
        $menuItems = MenuItem::with(['category', 'ingredients'])->get();
        return response()->json($menuItems);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|string',
            'is_available' => 'boolean',
            'ingredients' => 'nullable|array',
            'ingredients.*.id' => 'required_with:ingredients|exists:ingredients,id',
            'ingredients.*.quantity' => 'required_with:ingredients|numeric|min:0.001',
        ]);

        $menuItem = MenuItem::create($validated);

        if (!empty($validated['ingredients'])) {
            $ingredientsData = [];
            foreach ($validated['ingredients'] as $ingredient) {
                $ingredientsData[$ingredient['id']] = ['quantity_required' => $ingredient['quantity']];
            }
            $menuItem->ingredients()->sync($ingredientsData);
        }

        return response()->json($menuItem->load(['category', 'ingredients']), 201);
    }

    public function show(MenuItem $menuItem)
    {
        return response()->json($menuItem->load(['category', 'ingredients']));
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|required|exists:categories,id',
            'name' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric|min:0',
            'image' => 'sometimes|nullable|string',
            'is_available' => 'sometimes|boolean',
            'ingredients' => 'nullable|array',
            'ingredients.*.id' => 'required_with:ingredients|exists:ingredients,id',
            'ingredients.*.quantity' => 'required_with:ingredients|numeric|min:0.001',
        ]);

        $menuItem->update($validated);

        if (array_key_exists('ingredients', $validated)) {
             if (!empty($validated['ingredients'])) {
                $ingredientsData = [];
                foreach ($validated['ingredients'] as $ingredient) {
                    $ingredientsData[$ingredient['id']] = ['quantity_required' => $ingredient['quantity']];
                }
                $menuItem->ingredients()->sync($ingredientsData);
            } else {
                $menuItem->ingredients()->detach();
            }
        }

        return response()->json($menuItem->load(['category', 'ingredients']));
    }

    public function destroy(MenuItem $menuItem)
    {
        $menuItem->delete();
        return response()->json(null, 204);
    }
}
