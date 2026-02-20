<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    protected $fillable = [
        'ingredient_id',
        'order_id',
        'quantity_change',
        'type',
        'note',
        'created_by',
    ];

    protected $casts = [
        'quantity_change' => 'decimal:3',
    ];

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
