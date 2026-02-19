<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('modifiers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('category', ['removal','addition','replacement','sauce','topping','cooking_style','portion']);
            $table->decimal('price_impact', 6, 2)->default(0);
            $table->foreignId('ingredient_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('ingredient_qty', 10, 3)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('modifiers');
    }
};
