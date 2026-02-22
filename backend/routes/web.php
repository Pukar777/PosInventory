<?php

use Illuminate\Support\Facades\Route;

Route::any('{any}', function () {
    return redirect(env('FRONTEND_URL', 'http://localhost:5173'));
})->where('any', '.*');
