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
        // Fix any existing data that would violate the constraint
        DB::table('recipes')->where('quantity_required', '<=', 0)->update(['quantity_required' => 1]);

        try {
            DB::statement('ALTER TABLE recipes ADD CONSTRAINT check_quantity_required_positive CHECK (quantity_required > 0)');
        } catch (\Exception $e) {
            // Ignore if constraint already exists or fails to apply
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE recipes DROP CONSTRAINT check_quantity_required_positive');
    }
};
