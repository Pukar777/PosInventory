<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display a listing of all users for dropdowns and filtering.
     */
    public function index()
    {
        $users = User::select('id', 'name', 'role')->orderBy('name')->get();
        return response()->json($users);
    }
}
