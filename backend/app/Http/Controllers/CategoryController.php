<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use App\Services\ApiResponse;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::withCount('menuItems')->get();
        return ApiResponse::success($categories, 'Categories retrieved successfully');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
        ]);
        
        $category = Category::create($validated);
        return ApiResponse::success($category, 'Category created successfully', 201);
    }

    public function show(Category $category)
    {
        return ApiResponse::success($category, 'Category retrieved successfully');
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:categories,name,' . $category->id,
        ]);
        
        $category->update($validated);
        return ApiResponse::success($category, 'Category updated successfully');
    }

    public function destroy(Category $category)
    {
        $category->delete();
        return ApiResponse::success(null, 'Category deleted successfully', 200);
    }
}
