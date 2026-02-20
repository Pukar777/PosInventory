<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Http\Requests\MenuItemRequest;
use App\Services\ApiResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Exception;

class MenuItemController extends Controller
{
    public function index()
    {
        $menuItems = MenuItem::with(['category', 'ingredients'])->orderBy('id', 'desc')->get();
        return ApiResponse::success($menuItems, 'Menu items retrieved successfully.');
    }

    public function store(MenuItemRequest $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validated();
            
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('menu_items', 'public');
                $validated['image'] = $path;
            }

            $menuItem = MenuItem::create($validated);

            if (!empty($validated['ingredients'])) {
                $ingredientsData = [];
                foreach ($validated['ingredients'] as $ingredient) {
                    $ingredientsData[$ingredient['id']] = ['quantity_required' => $ingredient['quantity']];
                }
                $menuItem->ingredients()->sync($ingredientsData);
            }

            DB::commit();

            return ApiResponse::success($menuItem->load(['category', 'ingredients']), 'Menu item created successfully.', 201);
        } catch (Exception $e) {
            DB::rollBack();
            return ApiResponse::error('Failed to create menu item.', 500, ['error' => $e->getMessage()]);
        }
    }

    public function show(MenuItem $menuItem)
    {
        return ApiResponse::success($menuItem->load(['category', 'ingredients']), 'Menu item retrieved successfully.');
    }

    public function update(MenuItemRequest $request, MenuItem $menuItem)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validated();

            if ($request->hasFile('image')) {
                if ($menuItem->image && !preg_match('/[\x{1F600}-\x{1F64F}]/u', $menuItem->image) && Storage::disk('public')->exists($menuItem->image)) {
                    Storage::disk('public')->delete($menuItem->image);
                }
                $path = $request->file('image')->store('menu_items', 'public');
                $validated['image'] = $path;
            }

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

            DB::commit();

            return ApiResponse::success($menuItem->load(['category', 'ingredients']), 'Menu item updated successfully.');
        } catch (Exception $e) {
            DB::rollBack();
            return ApiResponse::error('Failed to update menu item.', 500, ['error' => $e->getMessage()]);
        }
    }

    public function destroy(MenuItem $menuItem)
    {
        try {
            DB::beginTransaction();
            
            if ($menuItem->image && !preg_match('/[\x{1F600}-\x{1F64F}]/u', $menuItem->image) && Storage::disk('public')->exists($menuItem->image)) {
                Storage::disk('public')->delete($menuItem->image);
            }
            
            $menuItem->delete();
            DB::commit();
            return ApiResponse::success(null, 'Menu item deleted successfully.', 200);
        } catch (Exception $e) {
            DB::rollBack();
            return ApiResponse::error('Failed to delete menu item.', 500, ['error' => $e->getMessage()]);
        }
    }
}
