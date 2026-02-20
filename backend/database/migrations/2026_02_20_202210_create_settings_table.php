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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('settings')->cascadeOnDelete();
            $table->string('key')->unique()->nullable(); // Unique key for fetching specific settings, nullable for groups
            $table->string('label');
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // 'string', 'boolean', 'enum', etc.
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
