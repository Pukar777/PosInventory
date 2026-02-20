<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RestaurantTable extends Model
{
    protected $table = 'tables';

    protected $fillable = ['number', 'status', 'qr_token'];

    public function orders()
    {
        return $this->hasMany(Order::class, 'table_id');
    }
}
