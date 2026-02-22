<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\TableController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // --- Admin-only routes ---
    Route::middleware('role:admin')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index']);
        Route::get('/settings', [\App\Http\Controllers\SettingController::class, 'index']);
        Route::post('/settings', [\App\Http\Controllers\SettingController::class, 'update']);
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('ingredients', IngredientController::class);
        Route::apiResource('menu-items', MenuItemController::class);
        Route::apiResource('recipes', \App\Http\Controllers\RecipeController::class)->only(['index', 'show', 'update']);
        Route::apiResource('tables', TableController::class)->only(['index', 'store', 'destroy']);
    });

    // --- Shared routes (admin + waiter) ---
    // Browse menu for POS
    Route::get('/menu', [MenuItemController::class, 'index']);
    Route::get('/menu/{menuItem}', [MenuItemController::class, 'show']);

    // Browse tables (waiters need to pick table when placing order)
    Route::get('/tables', [TableController::class, 'index']);

    // Orders (both admin can view all, waiter can place)
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);
});
